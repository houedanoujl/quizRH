<script setup>
// Coordonnées du participant et consentement, demandés avant la première question.
// Une adresse email ne peut participer qu'une fois : vérification avant le lancement du chrono.
const props = defineProps({
  initial: { type: Object, default: null },
  total: { type: Number, required: true }, // nombre de questions
})
const emit = defineEmits(['submit'])

const { quizDuration } = useRuntimeConfig().public
const duree = formatDuree(quizDuration)

const formData = ref({
  nom: props.initial?.nom || '',
  prenom: props.initial?.prenom || '',
  email: props.initial?.email || '',
  contact: props.initial?.contact || ''
})
const consentement = ref(false)
const emailError = ref('')
const checking = ref(false)

const FIELDS = [
  { key: 'prenom', label: 'Prénom', type: 'text', autocomplete: 'given-name' },
  { key: 'nom', label: 'Nom', type: 'text', autocomplete: 'family-name' },
  { key: 'email', label: 'Email', type: 'email', autocomplete: 'email', inputmode: 'email' },
  { key: 'contact', label: 'Téléphone', type: 'tel', autocomplete: 'tel', inputmode: 'tel' },
]

watch(() => formData.value.email, () => { emailError.value = '' })

const submitForm = async () => {
  if (!consentement.value || checking.value) return
  checking.value = true
  try {
    if (await useBorne().hasEmail(formData.value.email)) {
      emailError.value = 'Cette adresse email a déjà participé au quiz.'
      return
    }
    emit('submit', {
      ...formData.value,
      email: normaliserEmail(formData.value.email),
      consentement: true,
      consentementAt: new Date().toISOString()
    })
  } finally {
    checking.value = false
  }
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
          :inputmode="f.inputmode"
          :aria-invalid="f.key === 'email' && !!emailError"
          :aria-describedby="f.key === 'email' && emailError ? 'email-error' : undefined"
          required
        >
        <p v-if="f.key === 'email' && emailError" id="email-error" class="error" role="alert">{{ emailError }}</p>
      </div>
    </div>

    <label class="consent">
      <input v-model="consentement" type="checkbox" required>
      <span>
        J'accepte que CIPREL utilise mes informations et mes réponses dans le cadre de ses actions
        d'orientation et de recrutement. Elles ne sont pas transmises à des tiers.
      </span>
    </label>

    <p class="timing">
      <AppIcon name="clock" :size="22" />
      <span>Vous aurez <strong>{{ duree }}</strong> pour répondre aux {{ total }} questions. Le chrono démarre à la première question.</span>
    </p>

    <button type="submit" class="btn submit" :disabled="!consentement || checking">
      Commencer le quiz<AppIcon name="next" :size="18" />
    </button>
  </form>
</template>

<style scoped>
.form { padding: 22px 18px; display: grid; gap: 20px; max-width: 720px; width: 100%; margin: 0 auto; }
.intro { display: grid; gap: 6px; }
.intro h1 { font-size: clamp(1.5rem, 3.6vw, 2rem); font-weight: 800; }
.intro p { color: var(--ink-2); }
.fields { display: grid; gap: 14px; }
.field { display: grid; gap: 6px; align-content: start; }
.field > label { font-family: var(--font-display); font-weight: 700; font-size: 1.02rem; }
.field input {
  min-height: 54px; padding: 10px 14px;
  border-radius: 14px; border: 2px solid var(--line); background: var(--tray);
  font: inherit; font-size: 1.05rem; color: var(--ink);
  transition: border-color .15s, background .15s;
}
.field input:hover { border-color: #9fb6c6; }
.field input:focus { outline: none; border: 3px solid var(--ink); padding: 9px 13px; background: var(--surface); }
.field input:focus-visible { outline: 3px solid var(--navy); outline-offset: 3px; }
.field input[aria-invalid="true"] { border-color: var(--bad); }
.error { color: var(--bad); font-weight: 700; }

.consent {
  display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px; align-items: start;
  padding: 14px 16px; border-radius: 14px; border: 2px solid var(--line); background: var(--tray);
  cursor: pointer; font-weight: 600;
}
.consent:has(input:checked) { border-color: var(--ink); background: var(--orange-tint); }
.consent input {
  appearance: none; margin: 0; width: 32px; height: 32px; border-radius: 8px;
  border: 3px solid var(--ink); background: var(--surface); display: grid; place-items: center; cursor: pointer;
}
.consent input:checked { background: var(--orange); }
.consent input:checked::after {
  content: ''; width: 9px; height: 16px; margin-top: -3px;
  border: solid var(--ink); border-width: 0 3px 3px 0; transform: rotate(45deg);
}
.consent input:focus-visible { outline: 3px solid var(--navy); outline-offset: 3px; }

.timing {
  display: flex; gap: 10px; align-items: center;
  padding: 12px 16px; border-radius: 14px; background: var(--cream); font-weight: 600;
}
.timing svg { flex: none; color: var(--orange-ink); }
.submit { justify-self: stretch; min-height: 56px; font-size: 1.15rem; }
@media (min-width: 640px) {
  .form { padding: 28px 30px; }
  .fields { grid-template-columns: 1fr 1fr; }
  .submit { justify-self: start; min-width: 260px; }
}
</style>
