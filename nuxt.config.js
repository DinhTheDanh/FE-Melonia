// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxtjs/i18n"],
  srcDir: "app/",
  runtimeConfig: {
    public: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
      apiBase: process.env.BE_URL || "http://localhost:5111/api/v1",
    },
  },
  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },

  compatibilityDate: "2025-01-15",

  i18n: {
    locales: [
      { code: "en", name: "English", file: "en/en.json" },
      { code: "vi", name: "Vietnamese", file: "vi/vi.json" },
    ],
    langDir: "locales",
    defaultLocale: "vi",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },
  colorMode: {
    preference: "dark",
    fallback: "dark",
    classSuffix: "",
    storageKey: "nuxt-color-mode",
  },
});
