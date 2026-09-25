<script setup lang="ts">
// This component is deliberately thin: it manages Vue/Slidev lifecycle, while
// the generated WASM module owns wgpu rendering and the single shared winit
// event loop.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onSlideLeave, useNav, useSlideContext } from '@slidev/client'

// Keeping this API small makes slide scripts independent of the Rust handle.
// Each method ultimately queues a command for the active WebAssembly viewer.
export interface ViewerApi {
  loadObj(path: string): Promise<void>
  loadGltf(path: string): Promise<AnimationInfo[]>
  loadFbx(path: string): Promise<AnimationInfo[]>
  selectAnimation(index: number): void
  playAnimation(): void
  pauseAnimation(): void
  setAnimationTime(time: number): void
  renderPhantom(time: number, opacity?: number): void
  clearPhantoms(): void
  getAnimationTime(): Promise<number>
  setAnimationSpeed(speed: number): void
  setBackgroundColor(color: [number, number, number]): void
  hideScene(): void
  showScene(): void
  setMotionLines(config: MotionLineConfig): Promise<void>
  setMotionLineStyle(style: MotionLineStyle): void
  setMotionLineOpacity(opacity: number): void
  clearMotionLines(): void
  setMotionLinesVisible(visible: boolean): void
  setSeedPointsVisible(visible: boolean): void
  resetCamera(): void
  frameAnimation(): void
  setCamera(config: { eye: number[]; target: number[]; up: number[]; fov: number }): void
  setCameraFollowMesh(config: { offset: number[]; up: number[]; fov: number }): void
}

export interface AnimationInfo {
  name: string
  duration: number
  channels: { node: number; property: string; interpolation: string }[]
}

export interface MotionLineConfig {
  algorithm:
    | 'all'
    | 'random'
    | 'uniform'
    | 'uniform-spacetime'
    | 'importance-spacetime'
    | 'extended-importance-spacetime'
  count?: number
  fps?: number
  samplingRate?: number
  selection?: 'deterministic' | 'stochastic'
}

export type MotionLineStyle =
  | 'teaser'
  | 'dashed'
  | 'full-trajectory'
  | 'full-trajectory-window'
  | 'teaser-unweighted'

export type ViewerScript = (
  viewer: ViewerApi,
) => void | (() => void) | Promise<void | (() => void)>

// Slidev can keep several slide instances mounted at once, and its overview
// renders additional copies of those instances. Web winit still owns one
// page-wide event loop and one canvas-backed WebGPU surface, so these
// components share a process-wide ownership gate.
type ActiveViewer = {
  owner: symbol
  release: () => Promise<void>
}

let activeViewer: ActiveViewer | undefined
let viewerTransition: Promise<void> = Promise.resolve()

// Serialize attach/release operations. Independent IntersectionObservers must
// never attach two canvas-backed winit windows concurrently. The Rust runtime
// retains one Viewer/device and only moves its surface between these canvases.
function queueViewerTransition(operation: () => Promise<void>): Promise<void> {
  const next = viewerTransition.then(operation, operation)
  viewerTransition = next.catch(() => {})
  return next
}

// Every slide supplies behavior through a script instead of duplicating viewer
// setup code.  The optional cleanup function is called when the slide leaves
// the viewport.
const props = defineProps<{
  script: ViewerScript
  // Static previews are useful in overview/export/fallback modes, but remain
  // optional so existing interactive viewers do not need an image immediately.
  fallback?: string
  fallbackAlt?: string
  // Normal slide viewers reuse one page-wide viewer.  This opt-in flag is for
  // demonstrations that intentionally need two independent GPU surfaces.
  independent?: boolean
  // Introductory visual slides can let the canvas occupy the entire slide.
  fullscreen?: boolean
  // Playback controls are useful in explanatory slides but distract from a
  // full-bleed animation.
  controls?: boolean
  // A slide may react to its click state by changing the active animation
  // without replacing the canvas or resetting the camera.
  animationSpeed?: number
  // Slides that own substantial temporary GPU state can release it on leave.
  releaseOnLeave?: boolean
  // Called with the exact frame when a reactive speed change pauses playback.
  onAnimationPaused?: (time: number) => void
}>()

// Slidev provides the rendering context through Vue injection rather than a
// DOM attribute. This is the authoritative way to distinguish the real slide
// from overview, presenter, and next-slide preview copies.
const { $renderContext } = useSlideContext()
const { isPrintMode } = useNav()

// A stable token prevents a stale slide from releasing a newer slide's viewer.
const owner = Symbol('ObjViewer')

// Refs point at the DOM nodes only after Vue has mounted this component.
const container = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const error = ref('')
const sceneReady = ref(false)
const webgpuAvailable = ref<boolean | undefined>()

const fallbackUrl = computed(() => props.fallback ? assetUrl(props.fallback).toString() : '')
const fallbackVisible = computed(() => Boolean(
  props.fallback && (
    isPrintMode.value ||
    $renderContext.value !== 'slide' ||
    sceneReady.value === false ||
    webgpuAvailable.value === false
  ),
))

// IntersectionObserver prevents hidden Slidev slides from creating competing
// canvas contexts.  There is still one Rust event loop, but only one visible
// component should attach to it at a time.
let observer: IntersectionObserver | undefined
// A script may register a requestAnimationFrame loop; retain its cleanup here.
let cleanup: (() => void) | undefined
// `handle` is the currently attached WASM object for this component.
let handle: any
// Incrementing `run` invalidates async work from an older start attempt.
let run = 0
// Retain startup/disposal promises so transitions wait for the previous
// constructor or surface-detach acknowledgement before touching winit again.
let startPromise: Promise<void> | undefined
let releasePromise: Promise<void> | undefined
// ResizeObserver catches slide-layout changes without creating another viewer
// or depending on a camera/script callback to repair the canvas resolution.
let resizeObserver: ResizeObserver | undefined
// Slidev changes the apparent size of a slide with a CSS transform when the
// browser window is resized.  Transforms do not trigger ResizeObserver, so a
// window-resize callback is needed to refresh the physical backing store too.
let windowResizeListener: (() => void) | undefined
let lastCanvasSize = ''
// IntersectionObserver can run while Slidev is still transitioning its
// injected render context from "none" to "slide".  Remember the visibility
// result so the context watcher can retry startup without needing another
// intersection event.
let isVisibleSlide = false
let stopRenderContextWatch: (() => void) | undefined

async function disposeCandidate(candidate: any) {
  try {
    // The async method resolves after Rust has released the old WebGPU surface
    // and window. The shared device/viewer intentionally remains alive for the
    // next slide. The fallback supports a stale generated module during HMR.
    if (typeof candidate.disposeAsync === 'function') {
      await candidate.disposeAsync()
    } else {
      candidate.dispose?.()
    }
  } catch (error) {
    // Teardown during page close must not become an unhandled Vue exception.
    console.warn('Viewer disposal failed during slide navigation', error)
  }
}

async function releaseLocalViewer() {
  if (releasePromise) return releasePromise

  // If stop() happened while startup was awaiting WebGPU or WASM, wait for
  // that startup to publish its candidate before disposing it.
  const pendingStart = startPromise
  const promise = (async () => {
    await pendingStart?.catch(() => {})
    const candidate = handle
    handle = undefined
    if (candidate) await disposeCandidate(candidate)
  })()
  releasePromise = promise
  promise.then(
    () => {
      if (releasePromise === promise) releasePromise = undefined
    },
    () => {
      if (releasePromise === promise) releasePromise = undefined
    },
  )
  return promise
}

function stop() {
  // Invalidate promises that have not resumed yet.  This avoids attaching a
  // viewer after navigation has already made this component invisible.
  run += 1
  hideLocalScene()

  // Remove ownership immediately. The actual detach is serialized below so a
  // new visible slide waits until the old WebGPU surface is really gone.
  if (activeViewer?.owner === owner) activeViewer = undefined
  void queueViewerTransition(() => releaseLocalViewer())
}

function hideLocalScene() {
  sceneReady.value = false
  cleanup?.()
  cleanup = undefined
  handle?.hideScene()
}

// Keep playback controls at the component boundary so they work for every
// browser showcase without requiring each slide script to build its own UI.
// The Rust viewer remains the source of truth; these calls are harmless while
// a slide is still loading because `handle` is optional.
function playViewerAnimation() {
  handle?.playAnimation()
}

function pauseViewerAnimation() {
  handle?.pauseAnimation()
}

function applyRequestedAnimationSpeed(capturePause = false) {
  const speed = props.animationSpeed
  if (typeof speed === 'number' && Number.isFinite(speed)) {
    const viewerHandle = handle
    viewerHandle?.setAnimationSpeed(speed)
    if (capturePause && speed === 0 && viewerHandle && props.onAnimationPaused) {
      void viewerHandle.getAnimationTime()
        .then((time: number) => props.onAnimationPaused?.(time))
        .catch(() => {})
    }
  }
}

watch(() => props.animationSpeed, () => applyRequestedAnimationSpeed(true))

// Slidev renders the fixed-size slide content through a CSS transform. Fit the
// viewer in that unscaled slide rectangle rather than guessing from the
// browser viewport: the result remains correct at presentation, overview, and
// export sizes. A small CSS-pixel bottom inset preserves visible slide padding.
function fitViewerToSlide() {
  const element = container.value
  if (!element) return
  if (props.fullscreen) {
    if (element.style.height !== '100%') element.style.height = '100%'
    return
  }
  const slide = element.closest<HTMLElement>('.slidev-slide-content')
  if (!slide) return

  const slideRect = slide.getBoundingClientRect()
  const viewerRect = element.getBoundingClientRect()
  if (slideRect.width <= 0 || slideRect.height <= 0 || viewerRect.width <= 0) return

  const computedSlide = getComputedStyle(slide)
  const declaredScale = Number.parseFloat(
    computedSlide.getPropertyValue('--slidev-slide-scale'),
  )
  const measuredScale = slide.offsetWidth > 0 ? slideRect.width / slide.offsetWidth : 1
  const scale = declaredScale > 0 ? declaredScale : measuredScale
  if (!Number.isFinite(scale) || scale <= 0) return

  const bottomPadding = 16
  const availableHeight = (slideRect.bottom - viewerRect.top) / scale - bottomPadding
  if (availableHeight <= 0) return

  // 400 CSS pixels is large enough for the presentation while the measured
  // bound prevents the canvas from extending through the slide's bottom edge.
  const height = Math.max(1, Math.floor(Math.min(400, availableHeight)))
  const nextHeight = `${height}px`
  if (element.style.height !== nextHeight) element.style.height = nextHeight
}

function canvasSize(_entry?: ResizeObserverEntry) {
  // Slidev scales the complete slide with a CSS transform so that its fixed
  // presentation canvas fits the browser viewport. Fit the CSS box first so
  // the viewer cannot consume more than the remaining slide height.
  fitViewerToSlide()
  const element = container.value ?? canvas.value!
  const displayed = element.getBoundingClientRect()
  if (displayed.width <= 0 || displayed.height <= 0) return
  const scale = window.devicePixelRatio || 1
  return {
    width: Math.max(1, Math.round(displayed.width * scale)),
    height: Math.max(1, Math.round(displayed.height * scale)),
  }
}

function resizeCanvas(viewerHandle = handle, entry?: ResizeObserverEntry, force = false) {
  if (!canvas.value) return
  const size = canvasSize(entry)
  // Keep the existing backing store until layout produces a real measurement.
  // This prevents the first dual-view canvas from being permanently initialized
  // as 1x1 while the second canvas waits for the grid to settle.
  if (!size) return
  const key = `${size.width}x${size.height}`
  if (!force && key === lastCanvasSize) return
  lastCanvasSize = key
  // Keep CSS layout ownership with the component while retaining the explicit
  // physical backing dimensions measured above. The CSS size stays 100%; only
  // the backing store changes when the displayed, transformed slide changes.
  canvas.value.style.width = '100%'
  canvas.value.style.height = '100%'
  canvas.value.width = size.width
  canvas.value.height = size.height
  // Always notify the Rust surface when the logical component is first
  // attached.  Its winit window may have been created with a different size
  // before the browser completed layout.
  viewerHandle?.resize(size.width, size.height)
}

// Vue can mount the first child of a grid before the remaining children and
// Slidev's transition styles have been laid out. Waiting for two browser
// frames lets CSS layout settle before winit reads the displayed rectangle.
// The second frame is intentional: the first frame applies the slide/grid
// style, while the second observes the resulting layout.
async function waitForCanvasLayout() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (canvasSize()) return true
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }
  return Boolean(canvasSize())
}

// Resolve every public model through Slidev's configured base URL before
// calling fetch. Public assets are copied below that base during a production
// build, so a leading slash must not turn `/models/...` into a domain-root URL
// when the presentation is hosted from a GitHub Pages project subdirectory.
function assetUrl(path: string): URL {
  const baseUrl = new URL(import.meta.env.BASE_URL, document.baseURI)
  const relativePath = path.replace(/^\/+/, '')
  const url = new URL(relativePath, baseUrl)
  if (url.protocol === 'file:') {
    throw new Error(`Model URL resolves to file://, which a web page cannot fetch: ${path}`)
  }
  return url
}

async function start() {
  // An observer can report visibility more than once; do not initialize twice.
  if (handle || startPromise || isPrintMode.value) return

  // Capture this attempt's generation before any await expression.
  const currentRun = ++run
  error.value = ''
  sceneReady.value = false

  const operation = queueViewerTransition(async () => {
    // Slidev overview, presenter, and presenter-preview pages contain copies
    // of the slide. They are not interactive presentation surfaces and must
    // never create WebGPU viewers or fetch the entire deck's models. The
    // normal presentation page is explicitly marked with `slide`.
    // Only the real presentation slide may own the shared viewer.  In
    // particular, do not treat Slidev's initial "none" context as live: that
    // would let overview thumbnails attach temporary viewers.  The watcher
    // installed below retries this start after Slidev publishes "slide".
    if ($renderContext.value !== 'slide') return
    if (currentRun !== run || !canvas.value) return

    // Release whichever slide currently owns the singleton before attaching
    // this one. The release promise waits for winit's acknowledgement.
    if (!props.independent && activeViewer && activeViewer.owner !== owner) {
      const previous = activeViewer
      activeViewer = undefined
      await previous.release()
    }
    if (currentRun !== run || !canvas.value) return

    let candidate: any
    try {
      // Fail with a useful message before loading WASM if the browser cannot
      // provide the WebGPU API required by wgpu.
      const gpu = (navigator as any).gpu
      if (!gpu) {
        webgpuAvailable.value = false
        throw new Error(
          'WebGPU is unavailable in this browser or is disabled. Use a WebGPU-capable Chromium/Edge browser or enable WebGPU in Firefox.',
        )
      }
      if (!(canvas.value as any)?.getContext('webgpu')) {
        webgpuAvailable.value = false
        throw new Error(
          'This canvas could not create a WebGPU context. The browser may have WebGPU disabled, or the canvas may already be owned by another renderer.',
        )
      }
      if (!(await gpu.requestAdapter())) {
        webgpuAvailable.value = false
        throw new Error(
          'WebGPU is present but no usable GPU adapter was found. Check browser GPU settings and hardware acceleration.',
        )
      }
      webgpuAvailable.value = true

      // Dynamic import keeps the WASM bundle out of slides that do not use this
      // component until the component is actually visible.
      const module = await import('../generated/demo/demo.js')
      // wasm-bindgen's default export initializes memory and JS/WASM imports.
      await module.default()
      // Visibility may have changed while the module was loading.
      if (currentRun !== run || !canvas.value) return

      if (!(await waitForCanvasLayout()) || currentRun !== run || !canvas.value) {
        throw new Error('Viewer canvas has no measurable layout size')
      }

      // Seed the physical DOM backing store before the Rust constructor runs.
      // The constructor synchronously lets winit create its canvas window, so
      // sizing only after `new ViewerHandle(...)` is too late for the first
      // surface configuration and produces a blurry or invisible first view.
      resizeCanvas(undefined, undefined, true)

      // The constructor attaches this canvas to the page-wide winit event loop.
      candidate = new module.ViewerHandle(canvas.value, Boolean(props.independent))
      if (currentRun !== run) {
        // A fast navigation can make the candidate obsolete before it is stored.
        await disposeCandidate(candidate)
        return
      }
      // Set both DOM backing dimensions and the Rust surface dimensions.
      resizeCanvas(candidate, undefined, true)
      handle = candidate
      // Capture the candidate locally. Animation callbacks must not resolve the
      // mutable global `handle` after stop() has cleared it.
      const viewerHandle = candidate
      // A reused Viewer may still contain the previous slide's scene. Keep it
      // hidden until this slide's complete script has installed its scene.
      viewerHandle.hideScene()

      const viewer: ViewerApi = {
      async loadObj(path) {
        // Fetch is kept in TypeScript so slide assets use Slidev's public URL
        // routing; only parsed OBJ text crosses the WASM boundary.
        const response = await fetch(assetUrl(path))
        if (!response.ok) throw new Error(`Could not load model ${path}: ${response.status}`)
        // Wait until the queued mesh action has reached the ready GPU viewer.
        // This gives scripts a reliable point from which to start animation.
        await viewerHandle.load_obj_text_async(await response.text())
      },
      async loadGltf(path) {
        // The Rust loader receives raw bytes, which supports both binary GLB
        // and JSON glTF with embedded data buffers. Keeping fetch here lets
        // Slidev resolve public asset URLs in the normal browser way.
        // `path` is commonly root-relative, while `URL` requires an absolute
        // base. Resolve the document first so external buffers can be resolved
        // relative to the actual glTF URL below.
        const gltfUrl = assetUrl(path)
        const response = await fetch(gltfUrl)
        if (!response.ok) throw new Error(`Could not load glTF ${path}: ${response.status}`)
        let bytes = new Uint8Array(await response.arrayBuffer())

        // A browser cannot let Rust open a relative file URI. For JSON glTF,
        // fetch each external buffer here and turn it into a data URI before
        // passing the document to the buffer-only Rust loader. GLB already
        // contains its binary payload and skips this conversion.
        const text = new TextDecoder().decode(bytes)
        if (text.trimStart().startsWith('{')) {
          const gltfDocument = JSON.parse(text)
          for (const buffer of gltfDocument.buffers ?? []) {
            if (!buffer.uri || buffer.uri.startsWith('data:')) continue
            // `scene.bin` is beside scene.gltf, not beside the HTML page. This
            // also works when the presentation is served from a subdirectory.
            const bufferUrl = new URL(buffer.uri, gltfUrl)
            const bufferResponse = await fetch(bufferUrl)
            if (!bufferResponse.ok) {
              throw new Error(`Could not load glTF buffer ${buffer.uri}: ${bufferResponse.status}`)
            }
            const bufferBytes = new Uint8Array(await bufferResponse.arrayBuffer())
            let binary = ''
            const chunkSize = 0x8000
            for (let offset = 0; offset < bufferBytes.length; offset += chunkSize) {
              binary += String.fromCharCode(...bufferBytes.subarray(offset, offset + chunkSize))
            }
            buffer.uri = `data:application/octet-stream;base64,${btoa(binary)}`
          }
          bytes = new TextEncoder().encode(JSON.stringify(gltfDocument))
        }
        return (await viewerHandle.loadGltfBytes(bytes)) as AnimationInfo[]
      },
      async loadFbx(path) {
        // FBX is a self-contained binary asset for this viewer. Fetching raw
        // bytes preserves its animation curves and avoids the browser trying
        // to interpret the file as text or resolve file:// dependencies.
        const response = await fetch(assetUrl(path))
        if (!response.ok) throw new Error(`Could not load FBX ${path}: ${response.status}`)
        const bytes = new Uint8Array(await response.arrayBuffer())
        return (await viewerHandle.loadFbxBytes(bytes)) as AnimationInfo[]
      },
      selectAnimation(index) {
        viewerHandle.selectAnimation(index)
      },
      playAnimation() {
        viewerHandle.playAnimation()
      },
      pauseAnimation() {
        viewerHandle.pauseAnimation()
      },
      setAnimationTime(time) {
        viewerHandle.setAnimationTime(time)
      },
      renderPhantom(time, opacity = 0.24) {
        viewerHandle.renderPhantom(time, opacity)
      },
      clearPhantoms() {
        viewerHandle.clearPhantoms()
      },
      getAnimationTime() {
        return viewerHandle.getAnimationTime() as Promise<number>
      },
      setAnimationSpeed(speed) {
        viewerHandle.setAnimationSpeed(speed)
      },
      setBackgroundColor(color) {
        viewerHandle.setBackgroundColor(color)
      },
      hideScene() {
        viewerHandle.hideScene()
      },
      showScene() {
        viewerHandle.showScene()
      },
      setMotionLines(config) {
        const fps = config.fps ?? 30
        if (config.algorithm === 'all') {
          return viewerHandle.setMotionLinesAll(fps)
        }
        if (config.algorithm === 'uniform') {
          return viewerHandle.setMotionLinesUniform(config.count ?? 512, fps)
        }
        if (config.algorithm === 'uniform-spacetime') {
          return viewerHandle.setMotionLinesUniformSpacetime(
            config.count ?? 512,
            config.samplingRate ?? 8,
            fps,
          )
        }
        const stochastic = config.selection === 'stochastic'
        if (config.algorithm === 'importance-spacetime') {
          return viewerHandle.setMotionLinesImportanceSpacetime(
            config.count ?? 512,
            config.samplingRate ?? 8,
            stochastic,
            fps,
          )
        }
        if (config.algorithm === 'extended-importance-spacetime') {
          return viewerHandle.setMotionLinesExtendedImportanceSpacetime(
            config.count ?? 512,
            config.samplingRate ?? 8,
            stochastic,
            fps,
          )
        }
        return viewerHandle.setMotionLinesRandom(config.count ?? 512, fps)
      },
      setMotionLineStyle(style) {
        viewerHandle.setMotionLineStyle(style)
      },
      setMotionLineOpacity(opacity) {
        viewerHandle.setMotionLineOpacity(opacity)
      },
      clearMotionLines() {
        viewerHandle.clearMotionLines()
      },
      setMotionLinesVisible(visible) {
        viewerHandle.setMotionLinesVisible(visible)
      },
      setSeedPointsVisible(visible) {
        viewerHandle.setSeedPointsVisible(visible)
      },
      resetCamera() {
        viewerHandle.reset_camera()
      },
      frameAnimation() {
        viewerHandle.frameAnimation()
      },
      setCamera(config) {
        viewerHandle.set_camera(config.eye, config.target, config.up, config.fov)
      },
      setCameraFollowMesh(config) {
        viewerHandle.setCameraFollowMesh(config.offset, config.up, config.fov)
      },
      }
      // The slide script may start animation immediately after loading its mesh.
      cleanup = (await props.script(viewer)) as (() => void) | undefined
      if (currentRun !== run) {
        cleanup?.()
        cleanup = undefined
        await disposeCandidate(candidate)
        handle = undefined
        return
      }

      // The script establishes its default rate. Apply a reactive slide-level
      // override afterwards so a click can change the rate without recreating
      // the FBX scene or changing its camera pose.
      applyRequestedAnimationSpeed()

      viewerHandle.showScene()
      sceneReady.value = true

      // Only a fully initialized, still-visible component becomes the active
      // owner. Later slide changes release it through the same serialized path.
      if (!props.independent) {
        activeViewer = {
          owner,
          release: async () => {
            run += 1
            cleanup?.()
            cleanup = undefined
            await releaseLocalViewer()
          },
        }
      }
    } catch (e) {
      // Dispose this exact candidate without waiting on startPromise, which is
      // the operation currently executing this catch block.
      if (candidate) await disposeCandidate(candidate)
      handle = undefined
      if (currentRun === run) {
        if (!(webgpuAvailable.value === false && props.fallback)) {
          error.value = e instanceof Error ? e.message : String(e)
        }
      }
    }
  })

  startPromise = operation
  operation.then(
    () => {
      if (startPromise === operation) startPromise = undefined
    },
    () => {
      if (startPromise === operation) startPromise = undefined
    },
  )
}

onMounted(() => {
  // Slidev keeps multiple slides mounted in the DOM.  Visibility, not mount
  // state, decides which viewer may own the shared browser event loop.
  observer = new IntersectionObserver(
    ([entry]) => {
      // A neighboring slide or scaled overview thumbnail must not steal the
      // singleton merely because one pixel intersects the viewport.
      isVisibleSlide = Boolean(
        entry.isIntersecting &&
        entry.intersectionRatio >= 0.6 &&
        entry.boundingClientRect.width > 0
      )
      if (isVisibleSlide && $renderContext.value === 'slide' && !isPrintMode.value) start()
      else stop()
    },
    { threshold: [0, 0.6] },
  )
  if (container.value) observer.observe(container.value)
  // The initial IntersectionObserver callback may precede Slidev's render
  // context update.  Retrying here is what makes startup deterministic on the
  // first slide load and after Slidev switches back from its overview route.
  stopRenderContextWatch = watch($renderContext, (context) => {
    if (context === 'slide' && isVisibleSlide && !isPrintMode.value) start()
    else if (context !== 'slide') stop()
  }, { flush: 'post' })
  resizeObserver = new ResizeObserver(([entry]) => {
    // Independent viewers own their own surface.  Ordinary viewers remain
    // guarded by the singleton owner so hidden Slidev preview copies cannot
    // resize the visible viewer.
    if ((props.independent || activeViewer?.owner === owner) && handle) {
      resizeCanvas(handle, entry)
    }
  })
  if (container.value) {
    // Request physical-pixel measurements where supported.  Older browsers
    // reject this option, so the CSS-pixel fallback above remains portable.
    try {
      resizeObserver.observe(container.value, { box: 'device-pixel-content-box' })
    } catch {
      resizeObserver.observe(container.value)
    }
  }
  windowResizeListener = () => {
    // A CSS transform change does not necessarily produce a ResizeObserver
    // notification. Re-measure on viewport changes so presentation zoom and
    // device-pixel-ratio changes cannot leave the canvas under-resolved.
    if ((props.independent || activeViewer?.owner === owner) && handle) {
      resizeCanvas(handle, undefined, true)
    }
  }
  window.addEventListener('resize', windowResizeListener, { passive: true })
})

// Slidev keeps slide component instances mounted across navigation. This hook
// hides the retained Rust scene as soon as navigation changes, before the
// IntersectionObserver necessarily reports that the old canvas is gone.
onSlideLeave(() => {
  if ($renderContext.value === 'slide') {
    if (props.releaseOnLeave) stop()
    else hideLocalScene()
  }
})

onBeforeUnmount(() => {
  // Disconnect the observer and cancel all Rust/JavaScript resources owned by
  // this component before Vue removes its canvas.
  observer?.disconnect()
  stopRenderContextWatch?.()
  stopRenderContextWatch = undefined
  resizeObserver?.disconnect()
  if (windowResizeListener) {
    window.removeEventListener('resize', windowResizeListener)
    windowResizeListener = undefined
  }
  stop()
})
</script>

<template>
  <!-- The canvas is styled in CSS but sized in physical pixels by start(). -->
  <div ref="container" class="obj-viewer" :class="{ 'obj-viewer--fullscreen': props.fullscreen }">
    <img
      v-if="fallbackVisible"
      class="viewer-fallback"
      :src="fallbackUrl"
      :alt="props.fallbackAlt ?? ''"
    />
    <canvas ref="canvas" tabindex="0" />
    <div v-if="props.controls !== false" class="viewer-controls" @pointerdown.stop>
      <button type="button" aria-label="Play animation" @click.stop="playViewerAnimation">
        Play
      </button>
      <button type="button" aria-label="Pause animation" @click.stop="pauseViewerAnimation">
        Pause
      </button>
    </div>
    <div v-if="error" class="viewer-error">{{ error }}</div>
  </div>
</template>

<style scoped>
/* Keep the embedded scene compact enough to coexist with a slide title and
   notes while still preserving a useful interaction area. */
.obj-viewer {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  height: min(400px, calc(100% - 64px));
  min-height: 1px;
  max-height: 100%;
  overflow: hidden;
}

.obj-viewer--fullscreen {
  height: 100%;
  max-height: none;
}

.obj-viewer canvas {
  /* CSS controls layout size; start() controls the physical backing store. */
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  outline: none;
}

.viewer-fallback {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.viewer-controls {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 2;
  display: flex;
  gap: 4px;
}

.viewer-controls button {
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 4px;
  padding: 3px 7px;
  color: #f8fafc;
  background: rgb(15 23 42 / 80%);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

.viewer-controls button:hover,
.viewer-controls button:focus-visible {
  border-color: rgb(255 255 255 / 75%);
  background: rgb(30 41 59 / 92%);
}

.viewer-error {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 2rem;
  color: #fca5a5;
  background: #1f2937;
  text-align: center;
}
</style>
