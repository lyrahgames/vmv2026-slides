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

<!-- <video id="butterfly-first" controls autoplay loop muted playsinline src="/butterfly.webm"></video> -->

<SlidevVideo autoplay loop>
  <source src="/butterfly.webm" type="video/webm" />
</SlidevVideo>

---

![Gamy Grand Prix de l'ACF, 1913 motocyclette](/Gamy-Grd-prix-de-l_Acf-1913-Motocyclette.jpg)

---

<SlidevVideo autoplay loop>
  <source src="/butterfly-with-lines.webm" type="video/webm" />
</SlidevVideo>

---

<script setup lang="ts">
import { lilium } from './showcases/lilium'
</script>

# JavaScript-scripted camera path

<ObjViewer :script="lilium" />

---

<script setup lang="ts">
import { flair } from './showcases/flair'
</script>

# Animated glTF surface mesh

<ObjViewer :script="flair" />

---

<script setup lang="ts">
import { insideCrescentKick } from './showcases/inside-crescent-kick'
</script>

# Animated FBX inside crescent kick

<ObjViewer :script="insideCrescentKick" />

---

<script setup lang="ts">
import { dancingSkeleton } from './showcases/dancing-skeleton'
</script>

<ObjViewer :script="dancingSkeleton" />

---

<script setup lang="ts">
import { butterflyKick } from './showcases/butterfly-kick'
</script>

<ObjViewer :script="butterflyKick" />

---

<script setup lang="ts">
import { butterflyKickUniform } from './showcases/butterfly-kick'
</script>

# Butterfly kick with uniform seed selection

<ObjViewer :script="butterflyKickUniform" />

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
