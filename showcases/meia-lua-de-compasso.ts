// Browser showcase for the animated Meia Lua De Compasso FBX asset.
//
// ObjViewer fetches the self-contained FBX as bytes and passes it to the
// shared Rust decoder, so this example exercises the same animation path as
// the native Lua script.
export async function meiaLuaDeCompasso(viewer: any) {
  // URL-encode the filename because the public asset name contains spaces.
  const animations = await viewer.loadFbx('/models/Meia%20Lua%20De%20Compasso.fbx')

  // Frame the complete model once; playback changes the mesh, not the camera.
  viewer.resetCamera()

  // The supplied file exposes its demonstration clip as animation zero.
  if (animations.length > 0) {
    viewer.selectAnimation(0)
    viewer.setAnimationSpeed(1.0)
    viewer.playAnimation()
  }
}

