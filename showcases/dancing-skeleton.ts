// Browser showcase for the animated dancing-skeleton glTF asset.
//
// The reusable ObjViewer component fetches scene.gltf and its external
// scene.bin buffer; this module only describes which animation to play.
export async function dancingSkeleton(viewer: any) {
  // Loading returns only after the scene has been parsed and applied to the
  // active viewer, so animation commands below cannot race scene creation.
  const animations = await viewer.loadGltf('/models/dancing-skeleton/scene.gltf')

  // Keep the camera stable and frame the imported mesh before playback starts.
  viewer.resetCamera()

  // The asset currently exposes its Mixamo dance clip as animation zero.
  if (animations.length > 0) {
    viewer.selectAnimation(0)
    viewer.setAnimationSpeed(1.0)
    viewer.playAnimation()
  }
}
