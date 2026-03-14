/**
 * Composable for sticky header visibility based on scroll position.
 * Uses IntersectionObserver on a sentinel element to detect when the page
 * header has been scrolled past, showing a compact sticky header.
 *
 * @returns {{ showStickyHeader: Ref<boolean>, headerSentinel: Ref<HTMLElement|null>, setupObserver: () => void }}
 */
export const useStickyHeader = () => {
  const showStickyHeader = ref(false);
  const headerSentinel = ref(null);
  let observer = null;

  const setupObserver = () => {
    if (!headerSentinel.value) return;

    // The main scroll container in default layout
    const scrollContainer = document.getElementById("main-scroll-container");

    observer = new IntersectionObserver(
      ([entry]) => {
        showStickyHeader.value = !entry.isIntersecting;
      },
      {
        root: scrollContainer || null,
        threshold: 0,
      },
    );

    observer.observe(headerSentinel.value);
  };

  onMounted(() => {
    nextTick(() => {
      setupObserver();
    });
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

  return {
    showStickyHeader,
    headerSentinel,
  };
};
