import { ref, watch } from "vue";

export function useDominantColor(imageUrl) {
  const dominantColor = ref("#a855f7");
  const isLoading = ref(false);

  const extractColor = async (url) => {
    if (!url) {
      dominantColor.value = "#a855f7";
      return;
    }

    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    isLoading.value = true;

    try {
      // Dynamic import ColorThief only on client
      const ColorThief = (await import("colorthief")).default;
      const colorThief = new ColorThief();

      const img = new Image();
      img.crossOrigin = "Anonymous";

      // For Cloudinary images, ensure CORS
      let processedUrl = url;
      if (url.includes("cloudinary.com") && !url.includes("f_auto")) {
        processedUrl = url.replace("/upload/", "/upload/f_auto,q_auto/");
      }

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = processedUrl;
      });

      // Use ColorThief to get dominant color
      const color = colorThief.getColor(img);

      if (color) {
        dominantColor.value = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      } else {
        dominantColor.value = "#a855f7";
      }
    } catch (error) {
      console.error("Error extracting color:", error);
      dominantColor.value = "#a855f7";
    } finally {
      isLoading.value = false;
    }
  };

  // Watch for URL changes
  if (typeof imageUrl === "object" && imageUrl.value !== undefined) {
    watch(
      imageUrl,
      (newUrl) => {
        extractColor(newUrl);
      },
      { immediate: true },
    );
  } else if (imageUrl) {
    extractColor(imageUrl);
  }

  return {
    dominantColor,
    isLoading,
    extractColor,
  };
}
