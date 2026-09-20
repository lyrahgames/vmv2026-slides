# VMV 2026 slides

```
git clone --recurse git@github.com:lyrahgames/vmv2026-slides.git
cd vmv2026-slides
pnpm install
pnpm dev
```

The animated viewer exposes motion-line extraction through both frontends. In
Lua, after loading and selecting an FBX/glTF animation:

```lua
set_motion_lines_random(512, 30) -- count, samples per second
-- or: set_motion_lines_all(30)
-- or: set_motion_lines_uniform(512, 30) -- greedy spatial coverage
```

The browser API has the equivalent asynchronous call:

```ts
viewer.setBackgroundColor([1, 1, 1]) // normalized linear RGB
await viewer.setMotionLines({ algorithm: 'uniform', count: 512, fps: 30 })
```

Native Lua scripts use the same normalized RGB convention with one-based
arrays:

```lua
set_background_color({1, 1, 1})
```

The native smoke-test scripts live in the slides repository because their
models are slide assets, not files owned by the `demo/` submodule. Run them
from the `demo/` directory:

```sh
cd demo
cargo run -- ../scripts/motion-lines.lua
# More conservative glTF test for lower-memory adapters:
cargo run -- ../scripts/dancing-skeleton.lua
```

Both scripts print native CPU RSS and viewer-owned GPU buffer usage at setup
checkpoints. The GPU value is a tracked allocation lower bound because wgpu
does not expose portable live VRAM counters.
