set_background_color({ 1, 1, 1 })
local animations = load_fbx("../public/models/Butterfly Kick.fbx")
reset_camera()
if #animations > 0 then
  select_animation(1)
  set_animation_time(0.5)
  set_motion_lines_random(64, 30)
end
show_scene()
save_screenshot("../public/previews/butterfly-kick.png")
