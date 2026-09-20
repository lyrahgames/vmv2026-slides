// Browser showcase for the animated Inside Crescent Kick FBX asset.
//
// `ObjViewer` fetches the self-contained FBX as bytes and delegates decoding
// and animation sampling to the same Rust path used by the native application.
export async function insideCrescentKick(viewer: any) {
  // The URL encodes the spaces in the filename explicitly, making the example
  // work consistently with static servers and URL-based fetch implementations.
  const animations = await viewer.loadFbx('/models/Inside%20Crescent%20Kick.fbx')

  // Keep the camera fixed while the imported skeletal animation plays.
  viewer.resetCamera()

  // The provided file exposes the kick clip as animation zero.
  if (animations.length > 0) {
    viewer.selectAnimation(0)
    viewer.setAnimationSpeed(1.0)
    viewer.playAnimation()
  }
}
