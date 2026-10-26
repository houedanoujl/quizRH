<script setup>
const store = useQuestionnaireStore()
const results = computed(() => store.results)
const topSkills = computed(() => results.value?.softSkillsTriees.slice(0, 2).map(s => s.label) ?? [])

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
        <AppHeader title="Vos résultats" />

        <div v-if="results" id="capture-zone" class="sheet">
            <section class="verdict panel">
                <p class="who">{{ store.userData.prenom }} {{ store.userData.nom }}</p>
                <h1>Département recommandé</h1>
                <p class="dept">{{ results.departement }}</p>
                <p class="why">
                    Vos soft skills les plus marquées :
                    <strong>{{ results.softSkillsTriees[0]?.label }}</strong> et
                    <strong>{{ results.softSkillsTriees[1]?.label }}</strong>.
                </p>
            </section>

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
        </div>

        <ShareResults v-if="results" :departement="results.departement" :skills="topSkills" />

        <div v-if="results" class="actions">
            <button class="btn ghost" type="button" @click="retournerAccueil">
                <AppIcon name="home" :size="18" />Retour à l'accueil
            </button>
        </div>
    </div>
</template>

<style scoped>
.sheet { display: grid; gap: 18px; }
.verdict { padding: 22px 18px; display: grid; gap: 8px; background: var(--cream); }
.who { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; color: var(--ink-2); }
h1 { font-size: 1.15rem; font-weight: 700; }
.dept {
    justify-self: start;
    font-family: var(--font-display); font-weight: 800; font-size: clamp(1.8rem, 5vw, 2.8rem); line-height: 1.05;
    padding: 6px 20px; border-radius: 999px; border: 3px solid var(--ink); background: var(--orange);
}
.why { color: var(--ink-2); }
.why strong { color: var(--ink); }
.skills { padding: 22px 18px; display: grid; gap: 14px; }
.skills h2 { font-size: 1.35rem; font-weight: 800; }
.note { color: var(--ink-2); margin-top: -8px; }
.list { display: grid; gap: 16px; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; }
@media (min-width: 768px) {
    .verdict, .skills { padding: 28px 30px; }
    .list { grid-template-columns: 1fr 1fr; gap: 18px 28px; }
}
</style>
