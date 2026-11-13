<script setup>
const store = useQuestionnaireStore()
const { quizDuration } = useRuntimeConfig().public
const duree = formatDuree(quizDuration)

// Le texte du bas tient sur une ligne : la taille de police s'ajuste à la largeur de l'écran.
const footer = ref(null)
const fit = () => {
  const el = footer.value
  if (!el) return
  let size = 17
  el.style.fontSize = `${size}px`
  while (el.scrollWidth > el.clientWidth && size > 10) {
    size -= 0.5
    el.style.fontSize = `${size}px`
  }
}

onMounted(async () => {
  // Retour à l'accueil = nouveau visiteur : on repart de zéro.
  store.resetQuestionnaire()
  store.preloadImages()
  await document.fonts?.ready
  fit()
  window.addEventListener('resize', fit)
})
onBeforeUnmount(() => window.removeEventListener('resize', fit))
</script>

<template>
  <div class="page">
    <AppHeader title="Ressources humaines" />
    <section class="hero panel">
      <div class="media">
        <img src="/images/debut.webp" alt="Une équipe CIPREL en tenue de travail réunie autour d'un ordinateur dans un open space" width="1448" height="1086">
      </div>
      <div class="body">
        <h1>QUEL MÉTIER EST FAIT POUR VOUS ?</h1>
        <p class="lead">
          Répondez par oui ou par non à {{ store.questions.length }} situations de travail. Vous découvrez vos soft skills les plus marquées
          et le département de CIPREL qui correspond le mieux à votre profil.
        </p>
        <ul class="chips" aria-label="En bref">
          <li class="chip">{{ store.questions.length }} questions</li>
          <li class="chip">Oui ou non</li>
          <li class="chip timer"><AppIcon name="clock" :size="18" />{{ duree }} chrono</li>
        </ul>
        <NuxtLink to="/questionnaire" class="btn start">
          Commencer<AppIcon name="next" :size="18" />
        </NuxtLink>
      </div>
    </section>
    <section class="skills" aria-labelledby="skills-title">
      <h2 id="skills-title">Ce que le questionnaire évalue</h2>
      <p ref="footer" class="oneline">Force collective, équité, engagement, respect, innovation et convivialité. Il n'y a pas de bonne ou de mauvaise réponse : répondez spontanément.</p>
    </section>
  </div>
</template>

<style scoped>
.hero { overflow: hidden; display: grid; }
.media { aspect-ratio: 16 / 9; background: var(--sky-deep); border-bottom: 3px solid var(--ink); }
.media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.body { padding: 22px 18px; display: grid; gap: 16px; align-content: center; }
h1 { font-size: clamp(1.8rem, 4.2vw, 2.7rem); font-weight: 800; line-height: 1.05; }
.lead { color: var(--ink-2); font-size: 1.05rem; max-width: 52ch; }
.chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.chip.timer { border-color: var(--orange); background: var(--orange-tint); }
.start { justify-self: start; min-width: 220px; min-height: 56px; font-size: 1.2rem; }
.skills { display: grid; gap: 6px; padding: 0 4px; }
.skills h2 { font-size: 1.25rem; font-weight: 800; }
.oneline { color: var(--ink-2); white-space: nowrap; overflow: hidden; }
@media (min-width: 768px) {
  .hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); min-height: 440px; }
  .media { aspect-ratio: auto; border-bottom: 0; border-right: 3px solid var(--ink); }
  .body { padding: 36px 40px; gap: 20px; }
}
</style>
