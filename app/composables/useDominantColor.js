import { ref, watch } from "vue";

export function useDominantColor(imageUrl) {
  const dominantColor = ref("#1DB954");
  const isLoading = ref(false);

  const extractColor = async (url) => {
    if (!url) {
      dominantColor.value = "#1DB954";
      return;
    }

    isLoading.value = true;

    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Sample size for performance
      const sampleSize = 10;
      canvas.width = sampleSize;
      canvas.height = sampleSize;

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;

      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let i = 0; i < data.length; i += 4) {
        // Skip very dark or very light pixels
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 30 && brightness < 220) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }

      if (count > 0) {
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        dominantColor.value = `rgb(${r}, ${g}, ${b})`;
      } else {
        dominantColor.value = "#1DB954";
      }
    } catch (error) {
      console.error("Error extracting color:", error);
      dominantColor.value = "#1DB954";
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
