set_background_color({ 1, 1, 1 })
local animations = load_fbx("../public/models/Butterfly Kick.fbx")
if #animations > 0 then
  select_animation(1)
  set_animation_time(0.5)
  set_motion_lines_extended_importance_spacetime(64, 8, true, 60)
  frame_animation()
end
show_scene()
save_screenshot("../public/previews/butterfly-kick-extended-importance-spacetime.png")
