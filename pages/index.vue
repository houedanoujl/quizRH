<script setup>
const store = useQuestionnaireStore()
onMounted(() => store.loadQuestions())
</script>

<template>
  <div class="page">
    <AppHeader title="Questionnaire d'orientation" subtitle="Ressources humaines" />
    <section class="hero panel">
      <div class="media">
        <img src="/images/01.webp" alt="Une équipe CIPREL en casques de chantier réunie autour d'un ordinateur" width="1024" height="1024">
      </div>
      <div class="body">
        <h1>Quel département vous ressemble ?</h1>
        <p class="lead">
          Répondez par oui ou par non à 18 situations de travail. Vous découvrez vos soft skills les plus marquées
          et le département de CIPREL qui correspond le mieux à votre profil.
        </p>
        <ul class="chips" aria-label="En bref">
          <li class="chip">18 questions</li>
          <li class="chip">Oui ou non</li>
          <li class="chip">Environ 3 minutes</li>
        </ul>
        <NuxtLink to="/questionnaire" class="btn start">
          Commencer<AppIcon name="next" :size="18" />
        </NuxtLink>
      </div>
    </section>
    <section class="skills" aria-labelledby="skills-title">
      <h2 id="skills-title">Ce que le questionnaire évalue</h2>
      <p>Force collective, équité, engagement, respect, innovation et convivialité. Il n'y a pas de bonne ou de mauvaise réponse : répondez spontanément.</p>
    </section>
  </div>
</template>

<style scoped>
.hero { overflow: hidden; display: grid; }
.media { aspect-ratio: 16 / 9; background: var(--sky-deep); border-bottom: 3px solid var(--ink); }
.media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.body { padding: 22px 18px; display: grid; gap: 16px; align-content: center; }
h1 { font-size: clamp(1.8rem, 4.6vw, 2.8rem); font-weight: 800; line-height: 1.05; }
.lead { color: var(--ink-2); font-size: 1.05rem; max-width: 52ch; }
.chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.start { justify-self: start; min-width: 200px; }
.skills { display: grid; gap: 6px; padding: 0 4px; }
.skills h2 { font-size: 1.25rem; font-weight: 800; }
.skills p { color: var(--ink-2); max-width: 70ch; }
@media (min-width: 768px) {
  .hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); min-height: 440px; }
  .media { aspect-ratio: auto; border-bottom: 0; border-right: 3px solid var(--ink); }
  .body { padding: 36px 40px; gap: 20px; }
}
</style>
