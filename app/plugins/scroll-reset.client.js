export default defineNuxtPlugin((nuxtApp) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const mainContainer = document.getElementById("main-scroll-container");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  const scheduleScrollReset = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToTop);
    });
  };

  nuxtApp.hook("page:finish", scheduleScrollReset);
  nuxtApp.hook("app:mounted", scheduleScrollReset);
});
