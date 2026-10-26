<script setup>
import { useQuestionnaireStore } from '~/stores/questionnaire'

const store = useQuestionnaireStore()
const currentQuestionIndex = ref(0)
const locked = ref(false)
const saving = ref(false)
const saveError = ref(null)
// Retour au formulaire depuis la première question, sans perdre la saisie.
const editingUser = ref(false)

const questions = computed(() => store.questions)
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)
const dots = computed(() => questions.value.map((q, i) => ({
  state: i === currentQuestionIndex.value ? 'current' : typeof store.answers[q.id] === 'boolean' ? 'done' : 'todo'
})))

const handleUserSubmit = (data) => {
  store.setUserData(data)
  editingUser.value = false
}

const submit = async () => {
  saving.value = true
  saveError.value = null
  try {
    await store.submit()
    await navigateTo('/results')
  } catch (error) {
    console.error('Erreur Supabase :', error)
    saveError.value = 'Vos réponses n\'ont pas pu être enregistrées. Vérifiez votre connexion puis réessayez.'
  } finally {
    saving.value = false
  }
}

// Laisse voir la réponse choisie un court instant avant de passer à la suite.
const selectAnswer = (answer) => {
  if (locked.value || saving.value) return
  store.saveAnswer(currentQuestion.value.id, answer)
  locked.value = true
  setTimeout(() => {
    locked.value = false
    if (isLastQuestion.value) submit()
    else currentQuestionIndex.value++
  }, 260)
}

const previous = () => {
  if (currentQuestionIndex.value > 0) currentQuestionIndex.value--
  else editingUser.value = true
}

onMounted(() => {
  // Un questionnaire déjà enregistré repart de zéro.
  if (store.participantId) store.resetQuestionnaire()
  store.loadQuestions()
})
</script>

<template>
  <div class="page">
    <AppHeader title="Questionnaire d'orientation">
      <span v-if="store.userData && !editingUser && questions.length" class="chip count">
        {{ currentQuestionIndex + 1 }}<span class="muted">/{{ questions.length }}</span>
      </span>
    </AppHeader>

    <QuestionnaireUserForm v-if="!store.userData || editingUser" :initial="store.userData" @submit="handleUserSubmit" />

    <template v-else>
      <p v-if="store.isLoading" class="state panel" role="status">Chargement des questions…</p>
      <div v-else-if="store.loadError" class="state panel" role="alert">
        <p>{{ store.loadError }}</p>
        <button class="btn ghost" type="button" @click="store.loadQuestions()">
          <AppIcon name="refresh" :size="18" />Réessayer
        </button>
      </div>

      <template v-else-if="currentQuestion">
        <QuestionnaireQuestionDots :items="dots" />
        <Transition name="swap" mode="out-in">
          <QuestionnaireYesNoQuestion
            :key="currentQuestion.id"
            :question="currentQuestion"
            :number="currentQuestionIndex + 1"
            :total="questions.length"
            :model-value="store.answers[currentQuestion.id] ?? null"
            :disabled="locked || saving"
            @answer="selectAnswer"
          />
        </Transition>

        <div class="nav">
          <button class="btn ghost" type="button" :disabled="saving" @click="previous">
            <AppIcon name="back" :size="18" />Précédent
          </button>
          <p v-if="saving" class="saving" role="status">Enregistrement de vos réponses…</p>
        </div>

        <div v-if="saveError" class="state panel" role="alert">
          <p>{{ saveError }}</p>
          <button class="btn" type="button" @click="submit">
            <AppIcon name="refresh" :size="18" />Réessayer
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.count .muted { color: var(--ink-2); font-weight: 600; }
.state { padding: 20px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; font-weight: 600; }
.nav { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.saving { color: var(--ink-2); font-weight: 700; }
.swap-enter-active, .swap-leave-active { transition: opacity .22s var(--ease-out), transform .22s var(--ease-out); }
.swap-enter-from { opacity: 0; transform: translateX(24px); }
.swap-leave-to { opacity: 0; transform: translateX(-24px); }
</style>
