import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Forkcast',
      htmlAttrs: { lang: 'fi' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
        },
      ],
      meta: [
        {
          name: 'description',
          content:
            'Forkcast auttaa löytämään reseptejä, suunnittelemaan viikon ateriat ja kokoamaan ostoslistan – kaikki yhdessä paikassa.',
        },
        { name: 'theme-color', content: '#c1432a' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Forkcast' },
        { property: 'og:title', content: 'Forkcast – Viikkosi, katettuna.' },
        {
          property: 'og:description',
          content:
            'Hae reseptejä, suunnittele viikon ateriat ja muodosta ostoslista automaattisesti.',
        },
        { property: 'og:image', content: 'https://forkcast.kekola.fi/images/og-image.png' },
        { property: 'og:url', content: 'https://forkcast.kekola.fi' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@pinia/nuxt', '@nuxt/eslint'],
})