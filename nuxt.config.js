export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // Projet Supabase du questionnaire : NUXT_SUPABASE_URL, NUXT_SUPABASE_KEY (clé publishable)
      supabaseUrl: process.env.NUXT_SUPABASE_URL || '',
      supabaseKey: process.env.NUXT_SUPABASE_KEY || ''
    }
  },
  compatibilityDate: '2024-11-01',

  devtools: { enabled: false },
  css: [
    '@/assets/css/main.scss'
  ],
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/image',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Questionnaire d\'orientation, CIPREL',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Questionnaire d\'orientation professionnelle CIPREL : 18 questions oui/non pour découvrir vos soft skills et le département qui vous correspond.' },
        { name: 'theme-color', content: '#ed7f06' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icons/ios/192.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@500;600;700;800&display=swap' }
      ]
    }
  },

  nitro: {
    preset: 'vercel',
    prerender: {
      routes: ['/', '/questionnaire', '/results'],
      failOnError: true
    }
  },

  generate: {
    routes: ['/', '/questionnaire', '/results']
  },
  build: {
    transpile: ['vue-bundle-renderer', 'html2canvas']
  },
  ssr: false,
  target: 'static',
  image: {
    quality: 80,
    format: ['webp', 'jpg']
  },
})
