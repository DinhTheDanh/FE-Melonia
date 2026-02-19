<template>
  <div class="min-h-screen pb-8">
    <div class="px-6 pt-8">
      <div class="flex items-center gap-4 mb-6">
        <button
          class="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          @click="$router.back()"
        >
          <UIcon name="i-lucide-arrow-left" class="size-6 text-white" />
        </button>
        <h1 class="text-3xl font-bold text-white">
          {{ $t("home.featured_artists") }}
        </h1>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 text-neutral-400 animate-spin"
        />
      </div>

      <!-- Artists Grid -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="artist in artists"
          :key="artist.Id || artist.ArtistId"
          class="group hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer"
        >
          <div class="relative mb-4">
            <img
              v-if="artist.Avatar || artist.Thumbnail"
              :src="artist.Avatar || artist.Thumbnail"
              :alt="artist.FullName || artist.ArtistName"
              class="w-full aspect-square object-cover rounded-full shadow-lg shadow-black/50"
            />
            <div
              v-else
              class="w-full aspect-square bg-[#282828] rounded-full flex items-center justify-center"
            >
              <UIcon name="i-lucide-user" class="size-12 text-neutral-500" />
            </div>
            <button
              class="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg shadow-black/60 hover:scale-105 cursor-pointer"
            >
              <UIcon name="i-fa6-solid-play" class="size-4 text-white ml-0.5" />
            </button>
          </div>
          <p class="text-white font-semibold text-sm truncate text-center">
            {{ artist.FullName || artist.ArtistName }}
          </p>
          <p class="text-neutral-400 text-xs mt-1 text-center">
            {{ $t("home.artist_label") }}
          </p>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!isLoading && artists.length === 0" class="text-center py-20">
        <UIcon
          name="i-lucide-user"
          class="size-16 text-neutral-600 mb-4 mx-auto"
        />
        <p class="text-neutral-400">{{ $t("home.no_artists") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import artistApi from "~/api/artistApi";

const isLoading = ref(true);
const artists = ref([]);

onMounted(async () => {
  try {
    const res = await artistApi.getArtists({ pageIndex: 1, pageSize: 50 });
    artists.value = res.Data || res || [];
  } catch (error) {
    console.error("Error fetching artists:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>
