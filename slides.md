---
theme: default
layout: default
title: Automatic Motion Lines for Animated Surface Meshes
info: VMV 2026 paper presentation
highlighter: shiki
transition: fade
mdc: true
colorSchema: light
---

<div class="title-slide">
  <a class="vmv-background-link" href="https://www.gcpr-vmv.de/year/2026" aria-label="VMV 2026">
    <img class="vmv-background" src="/vmv2026-logo-cropped.jpg" alt="VMV 2026"/>
  </a>
  <img class="cube-background" src="/illustrative-cube-with-speedlines.png" alt="" aria-hidden="true"/>
  <div class="title-content">
    <h1>Automatic Motion Lines<br/><em>for Animated Surface Meshes</em></h1>
    <div class="authors">
      <span class="author"><a class="author-name" href="https://orcid.org/0009-0001-9615-5976">Markus Pawellek</a><a class="orcid" href="https://orcid.org/0009-0001-9615-5976" aria-label="Markus Pawellek on ORCID"><img src="/orcid.png" alt="ORCID"/></a><sup>1,2</sup></span>
      <span class="author-separator">·</span>
      <span class="author"><a class="author-name" href="https://orcid.org/0000-0002-0544-5397">Anna Sterzik</a><a class="orcid" href="https://orcid.org/0000-0002-0544-5397" aria-label="Anna Sterzik on ORCID"><img src="/orcid.png" alt="ORCID"/></a><sup>1</sup></span>
      <span class="author-separator">·</span>
      <span class="author"><a class="author-name" href="https://orcid.org/0000-0002-1511-4022">Kai Lawonn</a><a class="orcid" href="https://orcid.org/0000-0002-1511-4022" aria-label="Kai Lawonn on ORCID"><img src="/orcid.png" alt="ORCID"/></a><sup>1</sup></span>
    </div>
    <div class="author-rule"></div>
    <div class="institution-strip" aria-label="Affiliations">
      <div class="affiliation-row">
        <div class="affiliation leipzig-affiliation"><span class="institution-logo leipzig-logos"><a href="https://home.uni-leipzig.de/computervision/"><img src="/computer-vision-group-logo.png" alt="Computer Vision Group"/></a><a href="https://scads.ai/"><img src="/scadsai-logo.png" alt="ScaDS.AI Dresden/Leipzig"/></a><a href="https://www.uni-leipzig.de/"><img src="/leipzig-university-logo-without-divider.png" alt="University of Leipzig"/></a></span><span class="affiliation-separator" aria-hidden="true"></span><a class="affiliation-label" href="https://home.uni-leipzig.de/computervision/"><span><sup>1</sup> Computer Vision Group</span><span>ScaDS.AI Dresden/Leipzig</span><span>University of Leipzig</span></a></div>
        <div class="affiliation jena-affiliation"><a class="institution-logo" href="https://www.uni-jena.de/"><img src="/jena-university-logo-cropped.png" alt="University of Jena"/></a><span class="affiliation-separator" aria-hidden="true"></span><a class="affiliation-label" href="https://www.uni-jena.de/"><span><sup>2</sup> Faculty of Mathematics</span><span>and Computer Science</span><span>University of Jena</span></a></div>
      </div>
    </div>
  </div>
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
:root{--ink:#133b50;--muted:#527180;--teal:#087f7a;--coral:#f26b5e}
html,html.dark{color-scheme:light}
.slidev-layout{padding:0}
.title-slide{position:relative;box-sizing:border-box;width:100%;height:100%;min-height:600px;overflow:hidden;background:#fff;color:var(--ink);padding:8% 8%;font-family:'DM Sans',sans-serif}
.title-slide a,.title-slide a:hover,.title-slide a:focus{border:0!important;box-shadow:none!important;text-decoration:none!important;background-image:none!important}
.title-content{position:relative;z-index:1;width:88%}
.vmv-background-link{position:absolute;top:6%;right:4%;z-index:1;width:39%;line-height:0}
.vmv-background{position:relative;width:100%;height:auto;opacity:.16;display:block}
.cube-background{position:absolute;top:24%;right:-42%;z-index:0;width:150%;height:auto;opacity:.22;transform:rotate(18deg);transform-origin:top right;pointer-events:none}
h1{margin:34px 0 28px;font-family:'Space Grotesk',sans-serif;font-size:45px;line-height:1.08;letter-spacing:-.045em;font-weight:600}
h1 em{color:var(--teal);font-style:normal}
.authors{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:20px;font-weight:600}
.author{display:inline-flex;align-items:center;gap:4px}
.author-name{color:var(--ink)}
.orcid{display:inline-flex;align-items:center;width:16px;height:16px}
.orcid img{display:block;width:100%;height:100%}
.authors sup,.affiliation-label sup{color:var(--coral);font-size:.65em;font-weight:700}
.author-separator{color:var(--teal)}
.author-rule{width:100%;height:1px;margin:18px 0 20px;background:#b6d8d7}
.institution-strip{width:calc(100% / .88);margin-top:0;color:var(--muted);font-size:14px;line-height:1.35}
.affiliation-row{display:flex;flex-direction:column;align-items:flex-start;gap:24px}
.affiliation{display:flex;flex:none;min-width:0;flex-direction:row-reverse;align-items:center;gap:12px;color:var(--muted)}
.institution-logo{display:flex;flex:none;align-items:center;height:44px}
.institution-logo img{display:block;width:auto;height:44px;object-fit:contain}
.leipzig-logos{gap:14px}
.affiliation-label{display:block;box-sizing:border-box;width:195px;padding-right:12px;text-align:right}
.affiliation-separator{width:1px;height:58px;background:#b6d8d7}
.affiliation-label span{display:block;white-space:nowrap}
</style>

---

<script setup lang="ts">
import { computed } from 'vue'
import { butterflyKickIntro, rememberButterflyKickIntroTime } from './showcases/butterfly-kick'

const butterflyKickSpeed = computed(() => {
  if ($clicks.value >= 2) return 0
  if ($clicks.value >= 1) return 0.5
  return 1
})
</script>

<ObjViewer
  :script="butterflyKickIntro"
  :animation-speed="butterflyKickSpeed"
  :on-animation-paused="rememberButterflyKickIntroTime"
  fullscreen
  :controls="false"
/>
<span v-click class="butterfly-kick-speed-click" aria-hidden="true"></span>
<span v-click class="butterfly-kick-speed-click" aria-hidden="true"></span>

<style>
.butterfly-kick-speed-click{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
</style>

---

<div class="historical-image-slide">
  <div class="historical-image-frame">
    <img src="/Gamy-Grd-prix-de-l_Acf-1913-Motocyclette.jpg" alt="Gamy Grand Prix de l'ACF, 1913 motocyclette" />
    <a
      class="historical-image-source"
      href="https://www.museemecanicart.com/wp-content/uploads/2016/06/Gamy-Grd-prix-de-l_Acf-1913-Motocyclette.jpg"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the source image"
    >
      <span class="historical-image-source-label">Image source</span>
      <carbon-launch aria-hidden="true" class="historical-image-source-icon" />
    </a>
  </div>
</div>

<style>
.historical-image-slide{display:grid;width:100%;height:100%;place-items:center;overflow:hidden}
.historical-image-frame{position:relative;width:100%;aspect-ratio:950/471}
.historical-image-frame>img{display:block;width:100%;height:100%}
.historical-image-source{position:absolute;right:1.25rem;bottom:1.25rem;display:inline-flex;align-items:center;gap:0;padding:.45rem;border:1px solid #b6d8d7!important;border-radius:999px;box-shadow:none!important;background:rgb(255 255 255 / .92)!important;background-image:none!important;color:#133b50!important;font-size:.72rem;font-weight:600;text-decoration:none!important;opacity:.55;transition:gap .2s ease,padding .2s ease,border-color .2s ease,color .2s ease,opacity .2s ease}
.historical-image-source-label{max-width:0;overflow:hidden;opacity:0;white-space:nowrap;transition:max-width .2s ease,opacity .15s ease}
.historical-image-source-icon{width:1.15rem;height:1.15rem}
.historical-image-source:hover,.historical-image-source:focus-visible{gap:.35rem;padding-left:.7rem;border-color:#087f7a!important;color:#087f7a!important;opacity:1}
.historical-image-source:hover .historical-image-source-label,.historical-image-source:focus-visible .historical-image-source-label{max-width:10rem;opacity:1}
</style>

---

<script setup lang="ts">
import { computed } from 'vue'
import { butterflyKickIntroWithMotionLines } from './showcases/butterfly-kick'

const butterflyKickMotionLineSpeed = computed(() => {
  if ($clicks.value >= 2) return 1
  if ($clicks.value >= 1) return 0.5
  return 0
})
</script>

<ObjViewer
  :script="butterflyKickIntroWithMotionLines"
  :animation-speed="butterflyKickMotionLineSpeed"
  fullscreen
  :controls="false"
/>
<span v-click class="butterfly-kick-speed-click" aria-hidden="true"></span>
<span v-click class="butterfly-kick-speed-click" aria-hidden="true"></span>

---

<script setup lang="ts">
import { watch } from 'vue'
import { butterflyKickTemporalFiltering } from './showcases/butterfly-kick'

let temporalViewer: any
let trajectoriesRequested = false

function applyTemporalFilteringClick() {
  const viewer = temporalViewer
  if (!viewer) return
  const clicks = $clicks.value
  viewer.setSeedPointsVisible(clicks >= 1)
  viewer.setMotionLinesVisible(clicks >= 2)
  if (clicks === 3) viewer.playAnimation()
  else viewer.pauseAnimation()
  viewer.setMotionLineStyle(
    clicks >= 7 ? 'teaser'
      : clicks >= 6 ? 'teaser-unweighted'
        : clicks >= 5 ? 'full-trajectory-window'
          : 'full-trajectory',
  )

  if (clicks >= 1 && !trajectoriesRequested) {
    trajectoriesRequested = true
    // Select seeds from poses sampled at 8 FPS, then trace their motion
    // lines at the existing 12 FPS rate.
    void viewer.setMotionLines({
      algorithm: 'uniform-spacetime', count: 8, samplingRate: 8, fps: 12,
    })
      .catch((error: unknown) => console.error('Temporal Filtering motion lines:', error))
  }
}

watch($clicks, applyTemporalFilteringClick)

async function temporalFilteringScript(viewer: any) {
  await butterflyKickTemporalFiltering(viewer)
  temporalViewer = viewer
  trajectoriesRequested = false
  applyTemporalFilteringClick()
  return () => {
    if (temporalViewer === viewer) temporalViewer = undefined
  }
}
</script>

# Seeding, Tracing, and Styling

<ObjViewer
  :script="temporalFilteringScript"
  release-on-leave
  :controls="false"
/>
<span v-click class="temporal-filtering-click" aria-hidden="true"></span>
<span v-click class="temporal-filtering-click" aria-hidden="true"></span>
<span v-click class="temporal-filtering-click" aria-hidden="true"></span>
<span v-click class="temporal-filtering-click" aria-hidden="true"></span>
<span v-click class="temporal-filtering-click" aria-hidden="true"></span>
<span v-click class="temporal-filtering-click" aria-hidden="true"></span>
<span v-click class="temporal-filtering-click" aria-hidden="true"></span>
<style>
.temporal-filtering-click{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
</style>

---

# Temporal Filtering

<v-clicks>

- Seeds are fixed over time


$\implies$ Filter significant motion to reduce visual clutter (opacity & thickness weighting)

</v-clicks>


<v-click>

- Maximum speed over a past time window must exceed a given threshold

$$
\max_{t\in [t_0-\tau, t_0]} v(t) \ge v_{\mathrm{min}}
$$

</v-click>

<v-click>

- The distance traveled in the past time window must exceed a given threshold

$$
s(t_0) - s(t_0 - \tau) \ge s_{\mathrm{min}}
$$

</v-click>

---

# Seeding

The Static Case

<script setup lang="ts">
import { butterflyKickStaticSeeding } from './showcases/butterfly-kick'
</script>

<div class="static-seeding-layout">
<div class="static-seeding-text">

<v-clicks>

For a fixed time $t\in T$,

iteratively choose from candidates $V$ the next seed in $S$.

Maximize the minimum pairwise Euclidean distances:

$$
\argmax_{v\in V} \min_{s\in S} \|v(t) - s(t)\|
$$

</v-clicks>

</div>

<ObjViewer
  :script="butterflyKickStaticSeeding"
  release-on-leave
  :controls="false"
  style="width: 100%; height: 400px; margin: 0"
/>
</div>

<style>
.static-seeding-layout{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);align-items:center;gap:1.25rem;height:400px}
.static-seeding-text{min-width:0}
@media(max-width:800px){.static-seeding-layout{grid-template-columns:minmax(0,1fr) minmax(220px,.8fr);gap:.75rem}}
</style>

---

# Seeding

The Dynamic Case

For the full animation, maximize minimal pairwise distance across time:

$$
\argmax_{v\in V} \max_{t\in T} \min_{s\in S} \|v(t) - s(t)\|
$$

---

# Importance Seeding
Alternate Formulation as Probability Distribution

<v-click>

Assign the maximum pairwise distance as potential value to a candidate:

$$
\varphi(v) \coloneqq \max_{t\in T} \min_{s\in S} \|v(t) - s(t)\|
$$

</v-click>

<v-click>

Transform potential into probability distribution:

$$
P(v) \coloneqq \frac{\varphi(v)}{\sum_{w\in V} \varphi(w)}
$$

</v-click>

<v-click>

Sample from the distribution for randomization and even construct other heuristics

</v-click>

---

<script setup lang="ts">
import { dancingSkeleton } from './showcases/dancing-skeleton'
</script>

<ObjViewer :script="dancingSkeleton" fallback="/previews/dancing-skeleton.png" fallback-alt="Dancing skeleton surface mesh preview" />

---

<script setup lang="ts">
import { butterflyKick } from './showcases/butterfly-kick'
</script>

<ObjViewer :script="butterflyKick" fallback="/previews/butterfly-kick.png" fallback-alt="Butterfly kick motion-line preview" />

---

<script setup lang="ts">
import { meiaLuaDeCompasso } from './showcases/meia-lua-de-compasso'
</script>

<ObjViewer :script="meiaLuaDeCompasso" release-on-leave :controls="false" />

---

<script setup lang="ts">
import { butterflyKickExtendedImportanceSpacetime } from './showcases/butterfly-kick'
</script>

<ObjViewer :script="butterflyKickExtendedImportanceSpacetime" fallback="/previews/butterfly-kick-extended-importance-spacetime.png" fallback-alt="Butterfly kick extended importance preview" />

---

# Conclusions

<div class="h-full flex flex-col justify-center">

- test
- test2

</div>

---
layout: default
class: repositories-slide
---

<img class="cube-background" src="/illustrative-cube-with-speedlines.png" alt="" aria-hidden="true" />

# Thank you very much!

| [![QR code for the hosted slides](/generated/qr/slides.svg)](https://lyrahgames.github.io/vmv2026-slides) | [![QR code for the vmv2026-demo GitHub repository](/generated/qr/demo.svg)](https://github.com/lyrahgames/vmv2026-demo) |
|:---:|:---:|
| **[Slides](https://lyrahgames.github.io/vmv2026-slides)** | **[Demo](https://github.com/lyrahgames/vmv2026-demo)** |
| `lyrahgames.github.io/vmv2026-slides` | `github.com/lyrahgames/vmv2026-demo` |

<style>
.repositories-slide{position:relative;overflow:hidden;background:#fff;color:var(--ink);font-family:'DM Sans',sans-serif;display:flex;flex-direction:column}
.repositories-slide{padding:8% 8%;box-sizing:border-box}
.repositories-slide .cube-background{position:absolute;top:24%;right:-42%;z-index:0;width:150%;height:auto;opacity:.22;transform:rotate(18deg);transform-origin:top right;pointer-events:none}
.repositories-slide h1,.repositories-slide table{position:relative;z-index:1}
.repositories-slide h1{margin:0 0 12px;font-family:'Space Grotesk',sans-serif;font-size:38px;line-height:1;letter-spacing:-.04em}
.repositories-slide>p{margin:14px 0 26px;color:var(--muted);font-size:16px}
.repositories-slide table{width:100%;max-width:900px;margin:auto;border-collapse:separate;border-spacing:28px 0;table-layout:fixed}
.repositories-slide th,.repositories-slide td{width:50%;padding:0 22px;text-align:center;vertical-align:middle;border-left:1px solid #b6d8d7;border-right:1px solid #b6d8d7}
.repositories-slide th{padding-top:20px;border-top:1px solid #b6d8d7;border-radius:24px 24px 0 0}
.repositories-slide th img{display:block;width:min(100%,230px);height:auto;margin:0 auto}
.repositories-slide tbody tr:first-child td{padding-top:14px}
.repositories-slide tbody tr:last-child td{padding-bottom:18px;border-bottom:1px solid #b6d8d7;border-radius:0 0 24px 24px;color:var(--muted);font-size:13px}
.repositories-slide tbody tr:first-child a{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:600;letter-spacing:-.02em}
.repositories-slide a,.repositories-slide a:hover,.repositories-slide a:focus{border:0!important;box-shadow:none!important;background-image:none!important;color:var(--ink);text-decoration:none!important}
.repositories-slide a:hover,.repositories-slide a:focus{color:var(--teal)}
</style>
