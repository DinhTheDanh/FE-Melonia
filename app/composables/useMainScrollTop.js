export const useMainScrollTop = () => {
  return () => {
    if (!import.meta.client) return;

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      const mainContainer = document.getElementById("main-scroll-container");
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });
  };
};
