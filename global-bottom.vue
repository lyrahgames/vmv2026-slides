<script setup>
import { useNav } from '@slidev/client'

const { currentPage, total } = useNav()
</script>

<template>
  <footer class="global-footer" :class="{ 'is-closing-slide': currentPage === total }">
    <div class="footer-links">
      <a
        href="https://github.com/lyrahgames/vmv2026-slides"
        class="source-link"
        aria-label="View lyrahgames/vmv2026-slides on GitHub"
      >
        <span class="source-label">Slides on GitHub: lyrahgames/vmv2026-slides</span>
        <carbon-logo-github aria-hidden="true" class="github-mark" />
      </a>
      <a
        href="mailto:markus.pawellek@uni-leipzig.de"
        class="contact-link"
        aria-label="Email Markus Pawellek"
      >
        <span class="contact-label">markus.pawellek@uni-leipzig.de</span>
        <carbon-email aria-hidden="true" class="mail-mark" />
      </a>
    </div>
  </footer>
</template>

<style>
.global-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  height: 3.5rem;
  padding: 0 1.75rem 1rem;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.22;
  transition: opacity 0.2s ease;
}

.global-footer:hover .footer-links,
.global-footer:focus-within .footer-links {
  opacity: 1;
}

.is-closing-slide .footer-links {
  opacity: 1;
}

.source-link,
.contact-link {
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
.source-link:focus-visible,
.contact-link,
.contact-link:hover,
.contact-link:focus-visible {
  border: 1px solid #b6d8d7 !important;
  box-shadow: none !important;
  background-image: none !important;
  text-decoration: none !important;
}

.source-link:hover,
.source-link:focus-visible,
.contact-link:hover,
.contact-link:focus-visible {
  gap: 0.35rem;
  padding-left: 0.7rem;
  border-color: #087f7a !important;
  color: #087f7a;
}

.source-label,
.contact-label {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  transition: max-width 0.2s ease, opacity 0.15s ease;
}

.source-link:hover .source-label,
.source-link:focus-visible .source-label {
  max-width: 18rem;
  opacity: 1;
}

.contact-link:hover .contact-label,
.contact-link:focus-visible .contact-label,
.is-closing-slide .contact-label {
  max-width: 15rem;
  opacity: 1;
}

.is-closing-slide .source-link,
.is-closing-slide .contact-link {
  gap: 0.35rem;
  padding-left: 0.7rem;
}

.is-closing-slide .source-label {
  max-width: 18rem;
  opacity: 1;
}

.github-mark,
.mail-mark {
  width: 1.15rem;
  height: 1.15rem;
}
</style>
