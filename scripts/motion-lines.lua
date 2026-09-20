-- Native smoke test for GPU-traced motion lines.
--
-- Run from the `demo/` directory with:
--   cargo run -- ../scripts/motion-lines.lua
--
-- The two seed stages are exposed independently. Change this to
-- `set_motion_lines_all(30)` to trace every surface vertex instead.
-- Models live in the parent slides project, alongside this script directory.
set_background_color({1.0, 1.0, 1.0})
local animations = load_fbx("../public/models/Butterfly Kick.fbx")

for index, animation in ipairs(animations) do
  print(string.format("animation %d: %s (%.3f s)", index, animation.name, animation.duration))
end

print_memory_usage("after butterfly-kick scene setup")

reset_camera()

if #animations > 0 then
  select_animation(1)
  set_motion_lines_random(512, 30)
  print_memory_usage("after butterfly-kick motion-line extraction")
  set_animation_speed(1.0)
  play_animation()
end
