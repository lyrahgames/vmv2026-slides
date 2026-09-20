// Browser showcase for the animated Butterfly Kick FBX asset.
//
// ObjViewer fetches the self-contained FBX as bytes and passes it to the
// shared Rust decoder, so this example exercises the same animation path as
// the native Lua script.
export async function butterflyKick(viewer: any) {
  viewer.setBackgroundColor([1, 1, 1])
  // URL-encode the filename because the public asset name contains spaces.
  const animations = await viewer.loadFbx('/models/Butterfly%20Kick.fbx')

  // Frame the complete model once; playback changes the mesh, not the camera.
  viewer.resetCamera()

  // The supplied file exposes its demonstration clip as animation zero.
  if (animations.length > 0) {
    viewer.selectAnimation(0)
    await viewer.setMotionLines({ algorithm: 'random', count: 512, fps: 30 })
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
