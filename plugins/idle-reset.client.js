// Borne : sans contact pendant 90 s (formulaire, résultats, admin), retour à l'accueil.
// Le visiteur suivant ne voit pas les données du précédent. Pendant le quiz, le chrono s'en charge.
const IDLE_MS = 90_000

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const store = useQuestionnaireStore()
  let timer = null

  const fire = () => {
    const quizEnCours = store.startedAt && !store.participantId
    if (router.currentRoute.value.path === '/' || quizEnCours) return arm()
    store.resetQuestionnaire()
    router.push('/')
  }
  const arm = () => {
    clearTimeout(timer)
    timer = setTimeout(fire, IDLE_MS)
  }

  for (const type of ['pointerdown', 'keydown', 'touchstart']) {
    window.addEventListener(type, arm, { passive: true, capture: true })
  }
  router.afterEach(arm)
  arm()
})
