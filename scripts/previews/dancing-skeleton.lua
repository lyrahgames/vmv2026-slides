set_background_color({ 1, 1, 1 })
local animations = load_gltf("../public/models/dancing-skeleton/scene.gltf")
reset_camera()
if #animations > 0 then
  select_animation(1)
  set_animation_time(0.4)
  set_motion_lines_random(256, 15)
end
show_scene()
save_screenshot("../public/previews/dancing-skeleton.png")
