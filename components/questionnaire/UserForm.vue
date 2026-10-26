<script setup>
// Coordonnées du participant, demandées avant la première question.
const props = defineProps({
  initial: { type: Object, default: null },
})
const emit = defineEmits(['submit'])

const formData = ref({
  nom: props.initial?.nom || '',
  prenom: props.initial?.prenom || '',
  email: props.initial?.email || '',
  contact: props.initial?.contact || ''
})

const FIELDS = [
  { key: 'prenom', label: 'Prénom', type: 'text', autocomplete: 'given-name' },
  { key: 'nom', label: 'Nom', type: 'text', autocomplete: 'family-name' },
  { key: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
  { key: 'contact', label: 'Téléphone', type: 'tel', autocomplete: 'tel' },
]

const submitForm = () => {
  emit('submit', { ...formData.value })
}
</script>

<template>
  <form class="form panel" @submit.prevent="submitForm">
    <div class="intro">
      <h1>Avant de commencer</h1>
      <p>Ces informations accompagnent vos résultats. Elles ne sont visibles que par l'équipe RH de CIPREL.</p>
    </div>
    <div class="fields">
      <div v-for="f in FIELDS" :key="f.key" class="field">
        <label :for="`f-${f.key}`">{{ f.label }}</label>
        <input
          :id="`f-${f.key}`"
          v-model.trim="formData[f.key]"
          :type="f.type"
          :autocomplete="f.autocomplete"
          required
        >
      </div>
    </div>
    <button type="submit" class="btn submit">
      Commencer le questionnaire<AppIcon name="next" :size="18" />
    </button>
  </form>
</template>

<style scoped>
.form { padding: 22px 18px; display: grid; gap: 20px; max-width: 640px; width: 100%; margin: 0 auto; }
.intro { display: grid; gap: 6px; }
.intro h1 { font-size: clamp(1.5rem, 3.6vw, 2rem); font-weight: 800; }
.intro p { color: var(--ink-2); }
.fields { display: grid; gap: 14px; }
.field { display: grid; gap: 6px; }
label { font-family: var(--font-display); font-weight: 700; font-size: 1.02rem; }
input {
  min-height: 50px; padding: 10px 14px;
  border-radius: 14px; border: 2px solid var(--line); background: var(--tray);
  font: inherit; color: var(--ink);
  transition: border-color .15s, background .15s;
}
input:hover { border-color: #9fb6c6; }
input:focus { outline: none; border: 3px solid var(--ink); padding: 9px 13px; background: var(--surface); }
input:focus-visible { outline: 3px solid var(--navy); outline-offset: 3px; }
.submit { justify-self: stretch; }
@media (min-width: 640px) {
  .form { padding: 28px 30px; }
  .fields { grid-template-columns: 1fr 1fr; }
  .submit { justify-self: start; }
}
</style>
