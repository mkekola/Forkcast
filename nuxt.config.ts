import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Forkcast',
      htmlAttrs: { lang: 'fi' },
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&display=optional',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&display=optional',
          media: 'print',
          onload: "this.media='all'",
        },
      ],
      noscript: [
        {
          innerHTML:
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&display=optional">',
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
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: 'https://forkcast.kekola.fi' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Forkcast – Viikkosi, katettuna.' },
        {
          name: 'twitter:description',
          content:
            'Hae reseptejä, suunnittele viikon ateriat ja muodosta ostoslista automaattisesti.',
        },
        { name: 'twitter:image', content: 'https://forkcast.kekola.fi/images/og-image.png' },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/supabase'],

  supabase: {
    // Every visitor is signed in anonymously by a plugin, so there is no
    // login page to redirect to and no route protection to enforce here.
    redirect: false,
  },
})