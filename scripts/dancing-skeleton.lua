-- Conservative native smoke test for the browser's dancing-skeleton scene.
--
-- Run from the `demo/` directory with:
--   cargo run -- ../scripts/dancing-skeleton.lua
--
-- The line count and FPS are intentionally modest: the script is useful for
-- checking the complete glTF + GPU-skinning + motion-line path on adapters
-- with less available memory than a desktop browser.
set_background_color({1.0, 1.0, 1.0})
local animations = load_gltf("../public/models/dancing-skeleton/scene.gltf")

for index, animation in ipairs(animations) do
  print(string.format("animation %d: %s (%.3f s)", index, animation.name, animation.duration))
end

print_memory_usage("after dancing-skeleton scene setup")
reset_camera()

if #animations > 0 then
  select_animation(1)
  set_motion_lines_random(128, 15)
  print_memory_usage("after dancing-skeleton motion-line extraction")
  set_animation_speed(1.0)
  play_animation()
end
