import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export default defineNuxtPlugin({
  name: "pinia-persist",
  setup(nuxtApp) {
    // Only run on client side
    if (import.meta.client) {
      nuxtApp.$pinia.use(piniaPluginPersistedstate);
    }
  },
});
