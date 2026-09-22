-- Native smoke test for travelled-distance-weighted importance spacetime seeds.
--
-- Run from the demo directory:
--   cargo run -- ../scripts/motion-lines-extended-importance-spacetime.lua
--
-- The boolean third argument selects stochastic mode. This example uses true,
-- so each round samples from normalized spacing multiplied by normalized
-- travelled-distance probability.
set_background_color({1.0, 1.0, 1.0})
local animations = load_fbx("../public/models/Butterfly Kick.fbx")

for index, animation in ipairs(animations) do
  print(string.format("animation %d: %s (%.3f s)", index, animation.name, animation.duration))
end

print_memory_usage("after extended-importance-spacetime scene setup")
reset_camera()

if #animations > 0 then
  select_animation(1)
  set_motion_lines_extended_importance_spacetime(64, 8, true, 60)
  print_memory_usage("after extended-importance-spacetime motion-line extraction")
  set_animation_speed(1.0)
  play_animation()
end
