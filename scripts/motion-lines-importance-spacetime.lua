-- Native smoke test for deterministic importance spacetime seed selection.
--
-- Run from the demo directory:
--   cargo run -- ../scripts/motion-lines-importance-spacetime.lua
--
-- The boolean third argument selects stochastic mode. This example uses
-- false, so each round promotes the candidate with the largest normalized
-- max-min spacetime probability.
set_background_color({1.0, 1.0, 1.0})
local animations = load_fbx("../public/models/Butterfly Kick.fbx")

for index, animation in ipairs(animations) do
  print(string.format("animation %d: %s (%.3f s)", index, animation.name, animation.duration))
end

print_memory_usage("after importance-spacetime scene setup")
reset_camera()

if #animations > 0 then
  select_animation(1)
  set_motion_lines_importance_spacetime(64, 8, false, 60)
  print_memory_usage("after importance-spacetime motion-line extraction")
  set_animation_speed(1.0)
  play_animation()
end
