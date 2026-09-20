// Browser showcase for the animated Flair FBX asset.
//
// The existing flair.ts example loads the converted glTF asset.  This module
// keeps the original FBX path visible as a separate browser demonstration.
export async function flair(viewer: any) {
  viewer.setBackgroundColor([1, 1, 1])
  // Encode the space in the public filename for static-server compatibility.
  const animations = await viewer.loadFbx('/models/Flair.fbx')

  // Keep the camera fixed while the imported skeleton drives the mesh.
  viewer.resetCamera()

  // The first imported FBX clip is exposed as animation zero in JavaScript.
  if (animations.length > 0) {
    viewer.selectAnimation(0)
    await viewer.setMotionLines({ algorithm: 'uniform', count: 128, fps: 30 })
    viewer.setAnimationSpeed(1.0)
    viewer.playAnimation()
  }
}
