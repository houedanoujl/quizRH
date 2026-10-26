<script setup>
// Une question oui/non illustrée. Deux grands boutons en pilule ; la réponse
// choisie prend l'état « sélectionné » du quiz expert énergie. Raccourcis O / N.
const props = defineProps({
  question: { type: Object, required: true }, // { id, texte, image }
  number: { type: Number, required: true },
  total: { type: Number, required: true },
  // true (oui), false (non) ou null ; pas de type Boolean, que Vue convertirait en false.
  modelValue: { default: null },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['answer'])

const choose = (value) => {
  if (!props.disabled) emit('answer', value)
}

const onKey = (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
  if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return
  const k = e.key.toLowerCase()
  if (k === 'o') choose(true)
  else if (k === 'n') choose(false)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <section class="question panel" :aria-labelledby="`q-${question.id}`">
    <div class="media">
      <img :src="question.image" alt="" width="1024" height="1024" decoding="async">
    </div>
    <div class="body">
      <p class="meta">Question {{ number }} sur {{ total }}</p>
      <h2 :id="`q-${question.id}`" class="prompt">{{ question.texte }}</h2>
      <div class="choices" role="group" :aria-labelledby="`q-${question.id}`">
        <button
          type="button"
          class="choice yes"
          :class="{ selected: modelValue === true }"
          :aria-pressed="modelValue === true"
          :disabled="disabled"
          @click="choose(true)"
        >
          <span class="mark" aria-hidden="true"><AppIcon name="check" :size="22" /></span>
          Oui
        </button>
        <button
          type="button"
          class="choice no"
          :class="{ selected: modelValue === false }"
          :aria-pressed="modelValue === false"
          :disabled="disabled"
          @click="choose(false)"
        >
          <span class="mark" aria-hidden="true"><AppIcon name="cross" :size="20" /></span>
          Non
        </button>
      </div>
      <p class="hint" aria-hidden="true">Au clavier : <kbd>O</kbd> pour oui, <kbd>N</kbd> pour non.</p>
    </div>
  </section>
</template>

<style scoped>
.question { overflow: hidden; display: grid; min-width: 0; }
.media { aspect-ratio: 16 / 10; background: var(--sky-deep); border-bottom: 3px solid var(--ink); }
.media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.body { padding: 18px; display: grid; gap: 16px; align-content: center; min-width: 0; }
.meta { font-size: .95rem; font-weight: 700; color: var(--ink-2); }
.prompt { font-weight: 700; font-size: clamp(1.25rem, 2.8vw, 1.65rem); line-height: 1.25; text-wrap: pretty; }
.choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.choice {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  min-height: 64px; padding: 10px 16px;
  border-radius: var(--radius-answer); border: 3px solid var(--ink); background: var(--surface);
  font-family: var(--font-display); font-weight: 800; font-size: 1.35rem; line-height: 1; color: var(--ink);
  cursor: pointer; box-shadow: 0 3px 8px rgba(31, 40, 50, .14);
  transition: background .15s, transform .15s var(--ease-out), box-shadow .15s var(--ease-out);
}
.choice:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(31, 40, 50, .18); }
.choice:active:not(:disabled) { transform: translateY(1px); box-shadow: 0 1px 3px rgba(31, 40, 50, .18); }
.choice:disabled { cursor: default; }
.mark {
  width: 36px; height: 36px; border-radius: 50%; flex: none;
  display: grid; place-items: center; border: 3px solid var(--ink); background: var(--surface);
}
/* Oui et Non partagent le même état neutre ; seule la réponse cliquée passe en orange. */
.choice { color: var(--navy); }
.choice:hover:not(:disabled) { background: #f1f7fb; }
.choice.selected,
.choice.selected:hover:not(:disabled) { background: var(--orange); color: var(--ink); box-shadow: 0 0 0 5px #ffd9ae; }
.hint { display: none; font-size: .9rem; color: var(--ink-2); }
/* Très petits écrans : pastille et marges réduites pour que Oui / Non tiennent côte à côte. */
@media (max-width: 359px) {
  .body { padding: 14px; }
  .choices { gap: 8px; }
  .choice { gap: 6px; padding: 8px 10px; font-size: 1.2rem; }
  .mark { width: 28px; height: 28px; border-width: 2px; }
}
kbd {
  display: inline-block; min-width: 1.6em; padding: 0 .35em; text-align: center;
  border: 2px solid var(--line); border-radius: 6px; background: var(--tray);
  font-family: var(--font-display); font-weight: 700; font-size: .85rem;
}
@media (min-width: 768px) {
  .question { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); min-height: 420px; }
  .media { aspect-ratio: auto; border-bottom: 0; border-right: 3px solid var(--ink); }
  .body { padding: 28px 30px; gap: 20px; }
  .hint { display: block; }
}
</style>
