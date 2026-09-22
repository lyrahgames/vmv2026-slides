<template>
  <header v-if="$nav.currentPage > 1" class="global-header">
    <a
      href="https://github.com/lyrahgames/vmv2026-slides"
      class="source-link"
      aria-label="View the slides source code on GitHub"
    >
      <span class="source-label">Source code</span>
      <carbon-logo-github aria-hidden="true" class="github-mark" />
    </a>
  </header>
</template>

<style>
.global-header {
  position: absolute;
  top: 1rem;
  right: 1.75rem;
  z-index: 20;
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 0;
  padding: 0.45rem;
  border: 1px solid #b6d8d7;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.92);
  color: #133b50;
  font-size: 0.72rem;
  font-weight: 600;
  text-decoration: none;
  transition: gap 0.2s ease, padding 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.source-link,
.source-link:hover,
.source-link:focus-visible {
  border: 1px solid #b6d8d7 !important;
  box-shadow: none !important;
  background-image: none !important;
  text-decoration: none !important;
}

.source-link:hover,
.source-link:focus-visible {
  gap: 0.35rem;
  padding-left: 0.7rem;
  border-color: #087f7a !important;
  color: #087f7a;
}

.source-label {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  transition: max-width 0.2s ease, opacity 0.15s ease;
}

.source-link:hover .source-label,
.source-link:focus-visible .source-label {
  max-width: 5.5rem;
  opacity: 1;
}

.github-mark {
  width: 1.15rem;
  height: 1.15rem;
}
</style>
