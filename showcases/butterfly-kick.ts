// Browser showcase for the animated Butterfly Kick FBX asset.
//
// ObjViewer fetches the self-contained FBX as bytes and passes it to the
// shared Rust decoder, so this example exercises the same animation path as
// the native Lua script.
export function butterflyKick(viewer: any) {
  return runButterflyKick(viewer, 'random')
}

// Same scene and camera path as the main showcase, but with the greedy
// farthest-point seed selector so the two slides can be compared directly.
export function butterflyKickUniform(viewer: any) {
  return runButterflyKick(viewer, 'uniform')
}

// Fixed-camera space-time variants share one complete-clip framing so the
// seeding strategies can be compared directly.
const BUTTERFLY_KICK_LINE_COUNT = 64
const BUTTERFLY_KICK_UNIFORM_SPACETIME_SAMPLING_RATE = 30
const BUTTERFLY_KICK_IMPORTANCE_SPACETIME_SAMPLING_RATE = 8

export function butterflyKickUniformSpacetime(viewer: any) {
  return runButterflyKickSpacetime(viewer, 'uniform-spacetime')
}

export function butterflyKickExtendedImportanceSpacetime(viewer: any) {
  return runButterflyKickSpacetime(viewer, 'extended-importance-spacetime', 'stochastic')
}

export function butterflyKickImportanceSpacetime(viewer: any) {
  return runButterflyKickSpacetime(viewer, 'importance-spacetime', 'deterministic')
}

async function runButterflyKick(viewer: any, algorithm: 'random' | 'uniform') {
  viewer.setBackgroundColor([1, 1, 1])
  // URL-encode the filename because the public asset name contains spaces.
  const animations = await viewer.loadFbx('/models/Butterfly%20Kick.fbx')

  // Frame the complete model once; playback changes the mesh, not the camera.
  viewer.resetCamera()

  // The supplied file exposes its demonstration clip as animation zero.
  if (animations.length > 0) {
    viewer.selectAnimation(0)
    await viewer.setMotionLines({ algorithm, count: 64, fps: 30 })
    viewer.setAnimationSpeed(1.0)
    viewer.playAnimation()
  }

  // Express the orbit relative to the animated mesh. The renderer resolves
  // the current pose center every frame, so root motion cannot leave the
  // camera behind the fighter.
  const roundtripSeconds = 10
  const horizontalRadius = 390
  let active = true
  let frameId: number | undefined
  const start = performance.now()

  const updateCamera = (now: number) => {
    if (!active) return

    // Complete one continuous orbit around the fighter. At the end of the
    // cycle the angle is again equivalent to the start angle, but the camera
    // never reverses direction or oscillates between two views.
    const cycle = ((now - start) / 1000 % roundtripSeconds) / roundtripSeconds
    const angle = -0.9 + cycle * 2 * Math.PI
    const radius = horizontalRadius + 24 * Math.sin(cycle * 2 * Math.PI)
    const height = 112 + 20 * Math.cos(cycle * 2 * Math.PI)

    viewer.setCameraFollowMesh({
      offset: [radius * Math.sin(angle), height, radius * Math.cos(angle)],
      up: [0, 1, 0],
      fov: 45,
    })
    frameId = requestAnimationFrame(updateCamera)
  }

  frameId = requestAnimationFrame(updateCamera)
  return () => {
    active = false
    if (frameId !== undefined) cancelAnimationFrame(frameId)
  }
}

async function runButterflyKickSpacetime(
  viewer: any,
  algorithm: 'uniform-spacetime' | 'importance-spacetime' | 'extended-importance-spacetime',
  selection?: 'deterministic' | 'stochastic',
) {
  viewer.setBackgroundColor([1, 1, 1])
  const animations = await viewer.loadFbx('/models/Butterfly%20Kick.fbx')

  if (animations.length > 0) {
    viewer.selectAnimation(0)
    await viewer.setMotionLines({
      algorithm,
      count: BUTTERFLY_KICK_LINE_COUNT,
      samplingRate:
        algorithm === 'uniform-spacetime'
          ? BUTTERFLY_KICK_UNIFORM_SPACETIME_SAMPLING_RATE
          : BUTTERFLY_KICK_IMPORTANCE_SPACETIME_SAMPLING_RATE,
      selection,
      fps: 60,
    })
    // Frame the entire clip once. Playback changes only the mesh below.
    viewer.frameAnimation()
    viewer.setAnimationSpeed(1.0)
    viewer.playAnimation()
  }
}
