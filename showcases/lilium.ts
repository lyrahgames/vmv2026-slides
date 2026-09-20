// This example demonstrates that JavaScript can drive the Rust camera without
// owning the renderer or creating another WebGPU context.
export async function lilium(viewer: any) {
  viewer.setBackgroundColor([1, 1, 1])
  // The OBJ is loaded before animation starts so the first camera command is
  // applied to a real mesh rather than an empty/default scene.
  await viewer.loadObj('/models/lilium.obj')
  // Use the mesh bounds to establish a sensible initial camera and clip range.
  viewer.resetCamera()

  // The cleanup flag is checked by every future animation callback.  This is
  // necessary because Slidev can remove a slide while a requestAnimationFrame
  // callback is already queued in the browser.
  let active = true
  const start = performance.now()
  const update = (now: number) => {
    if (!active) return

    // Submit the inexpensive camera pose once per animation frame. The Rust
    // side only assigns camera fields; rendering remains owned by winit's
    // redraw loop and is not throttled by this script.
    const t = (now - start) / 1000
    // Orbit well outside Lilium's roughly two-unit-wide bounds so its petals
    // remain visible in the short slide canvas.
    const r = 5
    viewer.setCamera({
      eye: [r * Math.cos(t), 0.7 + 0.25 * Math.sin(t * 1.7), r * Math.sin(t)],
      target: [-0.37, -0.04, -0.13],
      up: [0, 1, 0],
      fov: 45,
    })

    // Keep scheduling while active; stop() prevents the next callback from
    // issuing any more Rust commands after navigation.
    requestAnimationFrame(update)
  }

  // Store the first request ID so cleanup can cancel it immediately.  The
  // active flag handles callbacks that were already queued after that point.
  const id = requestAnimationFrame(update)
  return () => {
    active = false
    cancelAnimationFrame(id)
  }
}
