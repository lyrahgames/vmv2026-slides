-- Native smoke test for uniform spacetime seed selection.
--
-- Run from the demo directory:
--   cargo run -- ../scripts/motion-lines-uniform-spacetime.lua
--
-- The first rate samples every surface vertex only for seed selection. The
-- final line trace still uses the higher FPS value passed as the third
-- argument.
set_background_color({1.0, 1.0, 1.0})
local animations = load_fbx("../public/models/Butterfly Kick.fbx")

for index, animation in ipairs(animations) do
  print(string.format("animation %d: %s (%.3f s)", index, animation.name, animation.duration))
end

print_memory_usage("after spacetime-seed scene setup")
reset_camera()

if #animations > 0 then
  select_animation(1)
  set_motion_lines_uniform_spacetime(64, 30, 60)
  print_memory_usage("after spacetime-seed motion-line extraction")
  set_animation_speed(1.0)
  play_animation()
end
