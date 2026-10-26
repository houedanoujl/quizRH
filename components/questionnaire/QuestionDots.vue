<script setup>
// Une pastille par question : marine une fois répondue, anneau orange pour la question en cours.
const props = defineProps({
  items: { type: Array, required: true }, // [{ state: 'todo' | 'current' | 'done' }]
})
const summary = computed(() => {
  const done = props.items.filter(i => i.state === 'done').length
  return `Progression : ${done} réponse${done > 1 ? 's' : ''} sur ${props.items.length}`
})
</script>

<template>
  <div class="dots" role="img" :aria-label="summary">
    <span v-for="(it, i) in items" :key="i" class="dot" :class="it.state" />
  </div>
</template>

<style scoped>
.dots { display: flex; flex-wrap: wrap; gap: 5px; }
.dot { width: 16px; height: 16px; border-radius: 50%; background: var(--surface); border: 2px solid #9fb0bf; }
.dot.current { border: 3px solid var(--orange); background: var(--orange-tint); }
.dot.done { background: var(--navy); border-color: var(--navy); }
@media (max-width: 479px) {
  .dots { gap: 4px; }
  .dot { width: 14px; height: 14px; }
}
</style>
