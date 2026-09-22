<script setup>
import { useNav } from '@slidev/client'

const { currentPage, total } = useNav()
</script>

<template>
  <header v-if="currentPage > 1" class="global-header">
    <span class="slide-number" aria-label="Slide number">
      {{ currentPage - 1 }} / {{ total - 1 }}
    </span>
  </header>
</template>

<style>
.global-header {
  position: absolute;
  top: 1rem;
  right: 1.75rem;
  z-index: 20;
}

.slide-number {
  display: inline-block;
  color: #527180;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}
</style>
