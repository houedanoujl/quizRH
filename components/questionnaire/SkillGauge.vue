<script setup>
// Jauge d'une soft skill (d'après la jauge de charge du quiz expert énergie).
const props = defineProps({
  label: { type: String, required: true },
  points: { type: Number, required: true },
  max: { type: Number, required: true },
  top: { type: Boolean, default: false },
})
const pct = computed(() => (props.max ? Math.round((props.points / props.max) * 100) : 0))
</script>

<template>
  <div class="gauge" :class="{ top }">
    <div class="head">
      <span class="label">{{ label }}</span>
      <span class="value">{{ points }}<span class="max"> / {{ max }}</span></span>
    </div>
    <div
      class="bar" role="meter" :aria-label="label"
      :aria-valuenow="points" aria-valuemin="0" :aria-valuemax="max"
      :aria-valuetext="`${points} oui sur ${max} questions`"
    >
      <span class="fill" :style="{ width: `${pct}%` }" />
    </div>
  </div>
</template>

<style scoped>
.gauge { display: grid; gap: 6px; }
.head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.label { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; }
.value { font-family: var(--font-display); font-weight: 800; font-size: 1.4rem; font-variant-numeric: tabular-nums; line-height: 1; }
.max { font-size: 1rem; font-weight: 700; color: var(--ink-2); }
.bar { position: relative; height: 22px; border-radius: 999px; background: var(--surface); border: 3px solid var(--ink); overflow: hidden; }
.fill { position: absolute; inset: 0 auto 0 0; background: var(--line); border-right: 3px solid var(--ink); transition: width .8s var(--ease-out); }
.fill[style*="width: 0%"] { border-right: 0; }
.top .fill { background: var(--energy); }
</style>
