<script setup>
// En-tête : logo CIPREL sur plaque blanche, titre de la page et actions à droite.
defineProps({
  title: { type: String, default: 'Questionnaire d\'orientation' },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <header class="top">
    <NuxtLink to="/" class="brand" aria-label="Accueil CIPREL">
      <img src="/images/logo.webp" alt="CIPREL" class="logo" width="168" height="43">
    </NuxtLink>
    <div class="title">
      <p class="name">{{ title }}</p>
      <p v-if="subtitle" class="sub">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="tools"><slot /></div>
  </header>
</template>

<style scoped>
.top { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; }
.brand { display: inline-flex; border-radius: 10px; }
.logo { height: 44px; width: auto; background: #fff; border-radius: 10px; padding: 6px 10px; box-shadow: 0 2px 6px rgba(31, 40, 50, .08); }
.title { flex: 1 1 200px; min-width: 0; }
.name { font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; line-height: 1.15; }
.sub { color: var(--ink-2); font-size: .95rem; }
.tools { display: flex; gap: 10px; align-items: center; }
@media (min-width: 768px) {
  .logo { height: 54px; }
  .name { font-size: 1.3rem; }
}
</style>
