// Code PIN de l'administration de la borne : obligatoire pour construire l'installateur.
// Pas de valeur par défaut : un PIN connu ouvrirait l'export des données des participants.
const adminPin = process.env.NUXT_PUBLIC_ADMIN_PIN || ''
if (['borne:build', 'borne:test'].includes(process.env.npm_lifecycle_event) && !/^\d{4,8}$/.test(adminPin)) {
  throw new Error('NUXT_PUBLIC_ADMIN_PIN manquant ou invalide (4 à 8 chiffres) : NUXT_PUBLIC_ADMIN_PIN=xxxx yarn borne:build')
}

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // Durée du quiz en secondes (NUXT_PUBLIC_QUIZ_DURATION). Figée au build.
      quizDuration: 120,
      // Vide : administration désactivée.
      adminPin
    }
  },
  compatibilityDate: '2024-11-01',

  devtools: { enabled: false },
  // Borne hors ligne : polices embarquées (pas de Google Fonts).
  css: [
    '@fontsource/baloo-2/600.css',
    '@fontsource/baloo-2/700.css',
    '@fontsource/baloo-2/800.css',
    '@fontsource/nunito/500.css',
    '@fontsource/nunito/600.css',
    '@fontsource/nunito/700.css',
    '@fontsource/nunito/800.css',
    '@/assets/css/main.scss'
  ],
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Quel métier est fait pour vous ? CIPREL',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Quiz métier CIPREL : 18 questions oui/non en 2 minutes pour découvrir vos soft skills et le métier qui vous correspond.' },
        { name: 'theme-color', content: '#ed7f06' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icons/ios/192.png' }
      ]
    }
  },

  nitro: {
    prerender: {
      routes: ['/', '/questionnaire', '/results', '/admin'],
      failOnError: true
    }
  },

  ssr: false
})
