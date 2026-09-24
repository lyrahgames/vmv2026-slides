-- Run from demo/: cargo run -- ../scripts/motion-lines-seed-points.lua
-- The rings follow the same selected vertex IDs as the traced motion lines.
set_background_color({1.0, 1.0, 1.0})
local animations = load_fbx("../public/models/Butterfly Kick.fbx")
reset_camera()

if #animations > 0 then
  select_animation(1)
  set_motion_line_style("dashed")
  set_motion_lines_uniform_spacetime(8, 30, 30)
  set_seed_points_visible(true)
  set_animation_speed(0.5)
  play_animation()
end
