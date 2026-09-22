<script setup>
import { useNav } from '@slidev/client'

const { currentPage, total } = useNav()
</script>

<template>
  <footer v-if="currentPage > 1" class="global-footer">
    <span aria-label="Slide number">
      {{ currentPage - 1 }} / {{ total - 1 }}
    </span>
  </footer>
</template>

<style>
.global-footer {
  position: absolute;
  right: 1.75rem;
  bottom: 1rem;
  z-index: 20;
  padding-top: 0.3rem;
  /*border-top: 1px solid #b6d8d7;*/
  color: #527180;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}
</style>
