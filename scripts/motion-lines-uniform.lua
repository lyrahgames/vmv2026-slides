-- Native smoke test for the greedy uniform/farthest-point seed selector.
--
-- Run from the demo directory:
--   cargo run -- ../scripts/motion-lines-uniform.lua
--
-- Unlike random selection, this promotes the candidate farthest from its
-- closest already selected seed. Every selected seed is still an actual
-- surface vertex of the loaded FBX mesh.
set_background_color({1.0, 1.0, 1.0})
local animations = load_fbx("../public/models/Butterfly Kick.fbx")

for index, animation in ipairs(animations) do
  print(string.format("animation %d: %s (%.3f s)", index, animation.name, animation.duration))
end

print_memory_usage("after uniform-seed scene setup")
reset_camera()

if #animations > 0 then
  select_animation(1)
  set_motion_lines_uniform(64, 30)
  print_memory_usage("after uniform-seed motion-line extraction")
  set_animation_speed(1.0)
  play_animation()
end
