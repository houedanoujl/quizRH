<script setup>
import { useQuestionnaireStore } from '~/stores/questionnaire'

const store = useQuestionnaireStore()
const { quizDuration } = useRuntimeConfig().public
const duration = Number(quizDuration)

const currentQuestionIndex = ref(0)
const locked = ref(false)
const saving = ref(false)
const saveError = ref(null)
// Quiz terminé (dernière réponse ou chrono écoulé) : plus de réponse possible.
const finished = ref(false)
const timeUp = ref(false)

const questions = computed(() => store.questions)
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)
const dots = computed(() => questions.value.map((q, i) => ({
  state: i === currentQuestionIndex.value ? 'current' : typeof store.answers[q.id] === 'boolean' ? 'done' : 'todo'
})))

// Le chrono démarre à l'affichage de la première question.
const handleUserSubmit = (data) => {
  store.setUserData(data)
  store.startTimer()
}

const submit = async (tempsEcoule = false) => {
  saving.value = true
  saveError.value = null
  try {
    await store.submit({ tempsEcoule })
    await navigateTo('/results')
  } catch (error) {
    console.error('Enregistrement impossible :', error)
    saveError.value = error?.code === 'EMAIL_DEJA_UTILISE'
      ? 'Cette adresse email a déjà participé au quiz.'
      : 'Vos réponses n\'ont pas pu être enregistrées sur la borne. Réessayez ou prévenez l\'équipe CIPREL.'
  } finally {
    saving.value = false
  }
}

// Laisse voir la réponse choisie un court instant avant de passer à la suite.
const selectAnswer = (answer) => {
  if (locked.value || saving.value || finished.value) return
  store.saveAnswer(currentQuestion.value.id, answer)
  locked.value = true
  setTimeout(() => {
    locked.value = false
    if (finished.value) return
    if (isLastQuestion.value) {
      finished.value = true
      submit(false)
    } else {
      currentQuestionIndex.value++
    }
  }, 260)
}

// Chrono écoulé : les questions sans réponse comptent « Non ».
let expireTimer = null
const onExpire = () => {
  if (finished.value) return
  finished.value = true
  timeUp.value = true
  expireTimer = setTimeout(() => submit(true), 1600)
}
onBeforeUnmount(() => clearTimeout(expireTimer))

// Le chrono tourne : pas de retour au formulaire.
const previous = () => {
  if (currentQuestionIndex.value > 0) currentQuestionIndex.value--
}

onMounted(() => {
  // Un questionnaire déjà enregistré repart de zéro.
  if (store.participantId) store.resetQuestionnaire()
  if (store.userData) store.startTimer()
})
</script>

<template>
  <div class="page">
    <AppHeader>
      <template v-if="store.userData && store.startedAt">
        <QuestionnaireCountdown
          :started-at="store.startedAt"
          :duration="duration"
          :stopped="finished"
          @expire="onExpire"
        />
        <span class="chip count">
          {{ currentQuestionIndex + 1 }}<span class="muted">/{{ questions.length }}</span>
        </span>
      </template>
    </AppHeader>

    <QuestionnaireUserForm v-if="!store.userData" :initial="store.userData" :total="questions.length" @submit="handleUserSubmit" />

    <template v-else-if="currentQuestion">
      <QuestionnaireQuestionDots :items="dots" />
      <Transition name="swap" mode="out-in">
        <QuestionnaireYesNoQuestion
          :key="currentQuestion.id"
          :question="currentQuestion"
          :number="currentQuestionIndex + 1"
          :total="questions.length"
          :model-value="store.answers[currentQuestion.id] ?? null"
          :disabled="locked || saving || finished"
          @answer="selectAnswer"
        />
      </Transition>

      <div class="nav">
        <button class="btn ghost" type="button" :disabled="saving || finished || currentQuestionIndex === 0" @click="previous">
          <AppIcon name="back" :size="18" />Précédent
        </button>
        <p v-if="saving" class="saving" role="status">Enregistrement de vos réponses…</p>
      </div>

      <div v-if="saveError" class="state panel" role="alert">
        <p>{{ saveError }}</p>
        <button class="btn" type="button" @click="submit(store.tempsEcoule)">
          <AppIcon name="refresh" :size="18" />Réessayer
        </button>
      </div>
    </template>

    <Transition name="fade">
      <div v-if="timeUp && !saveError" class="timeup" role="alert">
        <div class="timeup-card panel">
          <AppIcon name="clock" :size="56" />
          <p class="timeup-title">Temps écoulé !</p>
          <p>Les questions sans réponse comptent comme « Non ». Voici vos résultats.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.count { font-size: 1.15rem; }
.count .muted { color: var(--ink-2); font-weight: 600; }
.state { padding: 20px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; font-weight: 600; }
.nav { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.saving { color: var(--ink-2); font-weight: 700; }
.swap-enter-active, .swap-leave-active { transition: opacity .22s var(--ease-out), transform .22s var(--ease-out); }
.swap-enter-from { opacity: 0; transform: translateX(24px); }
.swap-leave-to { opacity: 0; transform: translateX(-24px); }

.timeup { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; padding: 16px; background: rgba(31, 40, 50, .55); }
.timeup-card { display: grid; justify-items: center; gap: 10px; padding: 32px 36px; max-width: 480px; text-align: center; border: 3px solid var(--ink); font-weight: 600; }
.timeup-card svg { color: var(--bad); }
.timeup-title { font-family: var(--font-display); font-weight: 800; font-size: 2.2rem; line-height: 1; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s var(--ease-out); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
