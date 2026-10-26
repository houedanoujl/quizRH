<script setup>
// Pictogrammes au trait (24×24), repris du quiz expert énergie.
defineProps({ name: { type: String, required: true }, size: { type: [Number, String], default: 20 } })
const PATHS = {
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  cross: 'M6 6l12 12 M18 6L6 18',
  share: 'M12 15V3 M7 8l5-5 5 5 M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',
  download: 'M12 3v12 M7 10l5 5 5-5 M5 21h14',
  home: 'M4 11l8-7 8 7 M6 9.5V20h12V9.5 M10 20v-5h4v5',
  refresh: 'M20 11a8 8 0 0 0-14.6-4.5L3 9 M3 4v5h5 M4 13a8 8 0 0 0 14.6 4.5L21 15 M21 20v-5h-5',
  clock: 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  target: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0z M12 12h.01',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z',
  info: 'M12 11v6 M12 7.5v.5 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
}
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path :d="PATHS[name]" />
  </svg>
</template>
