import { ref, watch, onMounted, onUnmounted } from "vue";

export function useDominantColor(imageUrl) {
  const dominantColor = ref("#a855f7");
  const isLoading = ref(false);
  let stopWatch = null;

  const extractColor = (url) => {
    // Safety check for SSR
    if (!import.meta.client || !url) {
      return;
    }

    isLoading.value = true;

    const img = new Image();
    img.crossOrigin = "Anonymous";

    // For Cloudinary images, ensure CORS
    let processedUrl = url;
    if (url.includes("cloudinary.com") && !url.includes("f_auto")) {
      processedUrl = url.replace("/upload/", "/upload/f_auto,q_auto/");
    }

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const sampleSize = 40;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;

        // Color frequency map
        const colorMap = {};

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue;

          const brightness = (r + g + b) / 3;
          if (brightness < 20 || brightness > 240) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;

          if (saturation < 0.15) continue;

          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const key = `${qr},${qg},${qb}`;

          if (!colorMap[key]) {
            colorMap[key] = { r: 0, g: 0, b: 0, count: 0, saturation: 0 };
          }
          colorMap[key].r += r;
          colorMap[key].g += g;
          colorMap[key].b += b;
          colorMap[key].count++;
          colorMap[key].saturation += saturation;
        }

        const colors = Object.values(colorMap);
        if (colors.length > 0) {
          colors.sort((a, b) => {
            const scoreA = a.count * (a.saturation / a.count);
            const scoreB = b.count * (b.saturation / b.count);
            return scoreB - scoreA;
          });

          const best = colors[0];
          const r = Math.round(best.r / best.count);
          const g = Math.round(best.g / best.count);
          const b = Math.round(best.b / best.count);
          dominantColor.value = `rgb(${r}, ${g}, ${b})`;
        }
      } catch (error) {
        dominantColor.value = "#a855f7";
      } finally {
        isLoading.value = false;
      }
    };

    img.onerror = (err) => {
      dominantColor.value = "#a855f7";
      isLoading.value = false;
    };

    img.src = processedUrl;
  };

  // Setup watcher only on client side after mount
  onMounted(() => {
    if (typeof imageUrl === "object" && imageUrl.value !== undefined) {
      // Watch reactive ref
      stopWatch = watch(
        imageUrl,
        (newUrl) => {
          if (newUrl) {
            extractColor(newUrl);
          } else {
            dominantColor.value = "#a855f7";
          }
        },
        { immediate: true },
      );
    } else if (imageUrl) {
      extractColor(imageUrl);
    }
  });

  onUnmounted(() => {
    if (stopWatch) {
      stopWatch();
    }
  });

  return {
    dominantColor,
    isLoading,
    extractColor,
  };
}
