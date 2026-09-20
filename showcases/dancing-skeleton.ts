// Browser showcase for the animated dancing-skeleton glTF asset.
//
// The reusable ObjViewer component fetches scene.gltf and its external
// scene.bin buffer; this module only describes which animation to play.
export async function dancingSkeleton(viewer: any) {
  viewer.setBackgroundColor([1, 1, 1])
  // Loading returns only after the scene has been parsed and applied to the
  // active viewer, so animation commands below cannot race scene creation.
  const animations = await viewer.loadGltf('/models/dancing-skeleton/scene.gltf')

  // Keep the camera stable and frame the imported mesh before playback starts.
  viewer.resetCamera()

  // The asset currently exposes its Mixamo dance clip as animation zero.
  if (animations.length > 0) {
    viewer.selectAnimation(0)
    // This clip lasts about 37 seconds. A conservative seed/FPS budget keeps
    // the browser bundle small while still leaving room for adaptive
    // Catmull–Rom subdivisions on curved parts of the motion.
    try {
      await viewer.setMotionLines({ algorithm: 'random', count: 256, fps: 15 })
    } catch (error) {
      // Motion lines are an optional effect. Keep the animation usable if a
      // particularly constrained browser adapter rejects the allocation.
      console.warn('Dancing-skeleton motion lines disabled:', error)
    }
    viewer.setAnimationSpeed(1.0)
    viewer.playAnimation()
  }
}
