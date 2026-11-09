<script setup>
const store = useQuestionnaireStore()
const results = computed(() => store.results)
const top = computed(() => results.value?.softSkillsTriees.slice(0, 2) ?? [])

// Texte du QR : prénom, métier, soft skills dominantes et début du texte métier.
// Jamais d'email ni de téléphone. Taille limitée pour rester lisible par un téléphone.
const QR_MAX_OCTETS = 420
const qrText = computed(() => {
  if (!results.value || !store.userData) return ''
  const date = new Date(store.endedAt || Date.now()).toLocaleDateString('fr-FR')
  const lignes = [
    'CIPREL - QUEL MÉTIER EST FAIT POUR VOUS ?',
    `${store.userData.prenom} - ${date}`,
    `Métier : ${results.value.metier.label}`,
    `Soft skills : ${top.value.map(s => `${s.label} ${s.points}/${s.max}`).join(', ')}`
  ]
  const base = lignes.join('\n')
  const texte = results.value.metier.texte?.trim()
  if (!texte) return base
  const octets = s => new TextEncoder().encode(s).length
  const complet = `${base}\n\n${texte}`
  if (octets(complet) <= QR_MAX_OCTETS) return complet
  const phrase = texte.match(/^.+?[.!?](\s|$)/)?.[0].trim()
  return phrase && octets(`${base}\n\n${phrase}`) <= QR_MAX_OCTETS ? `${base}\n\n${phrase}` : base
})

const retournerAccueil = () => {
  store.resetQuestionnaire()
  navigateTo('/')
}

onMounted(() => {
  // Pas de résultats (page rechargée ou accès direct) : retour à l'accueil.
  if (!store.results || !store.userData) navigateTo('/')
})
</script>

<template>
  <div class="page">
    <AppHeader />

    <template v-if="results">
      <div class="result-top">
        <section class="verdict panel">
          <p class="who">{{ store.userData.prenom }} {{ store.userData.nom }}</p>
          <h1>Le métier fait pour vous</h1>
          <p class="dept">{{ results.metier.label }}</p>
          <p v-if="results.metier.texte" class="texte">{{ results.metier.texte }}</p>
          <p class="why">
            Vos soft skills les plus marquées :
            <strong>{{ top[0]?.label }}</strong> et
            <strong>{{ top[1]?.label }}</strong>.
          </p>
          <p v-if="store.tempsEcoule && results.sansReponse" class="note">
            Temps écoulé : {{ results.sansReponse }} question{{ results.sansReponse > 1 ? 's' : '' }}
            sans réponse {{ results.sansReponse > 1 ? 'comptent' : 'compte' }} comme « Non ».
          </p>
        </section>
        <ResultsQr v-if="qrText" :text="qrText" />
      </div>

      <section class="skills panel" aria-labelledby="skills-title">
        <h2 id="skills-title">Vos soft skills</h2>
        <p class="note">Nombre de « oui » sur les questions de chaque soft skill.</p>
        <div class="list">
          <QuestionnaireSkillGauge
            v-for="(s, i) in results.softSkillsTriees"
            :key="s.skill"
            :label="s.label"
            :points="s.points"
            :max="s.max"
            :top="i < 2"
          />
        </div>
      </section>

      <div class="actions">
        <button class="btn" type="button" @click="retournerAccueil">
          <AppIcon name="home" :size="18" />Terminer
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.result-top { display: grid; gap: 18px; }
.verdict { padding: 22px 18px; display: grid; gap: 10px; align-content: center; background: var(--cream); }
.who { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; color: var(--ink-2); }
h1 { font-size: 1.15rem; font-weight: 700; }
.dept {
  justify-self: start;
  font-family: var(--font-display); font-weight: 800; font-size: clamp(1.8rem, 5vw, 2.8rem); line-height: 1.05;
  padding: 6px 20px; border-radius: 999px; border: 3px solid var(--ink); background: var(--orange);
}
.texte { font-size: 1.05rem; max-width: 62ch; }
.why { color: var(--ink-2); }
.why strong { color: var(--ink); }
.note { color: var(--ink-2); font-size: .95rem; }
.skills { padding: 22px 18px; display: grid; gap: 14px; }
.skills h2 { font-size: 1.35rem; font-weight: 800; }
.skills .note { margin-top: -8px; }
.list { display: grid; gap: 16px; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; }
.actions .btn { min-width: 200px; min-height: 56px; font-size: 1.15rem; }
@media (min-width: 768px) {
  .result-top { grid-template-columns: minmax(0, 1fr) auto; }
  .verdict, .skills { padding: 28px 30px; }
  .list { grid-template-columns: 1fr 1fr; gap: 18px 28px; }
}
</style>
