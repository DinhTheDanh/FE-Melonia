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
        <h1 class="text-3xl font-bold text-white">{{ title }}</h1>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 text-neutral-400 animate-spin"
        />
      </div>

      <!-- Albums Grid -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <NuxtLink
          v-for="album in albums"
          :key="album.AlbumId"
          :to="`/user/my-albums/${album.AlbumId}`"
          class="group hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer"
        >
          <div class="relative mb-4">
            <img
              v-if="album.Thumbnail"
              :src="album.Thumbnail"
              :alt="album.Title"
              class="w-full aspect-square object-cover rounded-md shadow-lg shadow-black/50"
            />
            <div
              v-else
              class="w-full aspect-square bg-[#282828] rounded-md flex items-center justify-center"
            >
              <UIcon name="i-lucide-disc" class="size-12 text-neutral-500" />
            </div>
            <button
              class="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg shadow-black/60 hover:scale-105 cursor-pointer"
              @click.prevent
            >
              <UIcon name="i-fa6-solid-play" class="size-4 text-white ml-0.5" />
            </button>
          </div>
          <p class="text-white font-semibold text-sm truncate">
            {{ album.Title }}
          </p>
          <p class="text-neutral-400 text-xs mt-1 truncate">
            {{ album.ArtistName || $t("home.unknown_artist") }}
          </p>
        </NuxtLink>
      </div>

      <!-- Empty -->
      <div v-if="!isLoading && albums.length === 0" class="text-center py-20">
        <UIcon
          name="i-lucide-disc"
          class="size-16 text-neutral-600 mb-4 mx-auto"
        />
        <p class="text-neutral-400">{{ $t("song.no_albums") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import musicApi from "~/api/musicApi";
import recommendationApi from "~/api/recommendationApi";

const { t } = useI18n();
const route = useRoute();
const { user } = useAuth();

const isLoading = ref(true);
const albums = ref([]);

const type = computed(() => route.query.type || "popular");

const title = computed(() => {
  if (type.value === "recommended") return t("home.recommended_albums");
  return t("home.popular_albums");
});

onMounted(async () => {
  try {
    if (type.value === "recommended" && user.value?.id) {
      const res = await recommendationApi.getRecommendedAlbums(
        user.value.id,
        50,
      );
      albums.value = res.Data || res || [];
    } else {
      const res = await musicApi.getAlbums({ pageIndex: 1, pageSize: 50 });
      albums.value = res.Data || res || [];
    }
  } catch (error) {
    console.error("Error fetching albums:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>
