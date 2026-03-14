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
        <div class="ml-auto relative">
          <div class="flex items-center w-64">
            <UIcon
              name="i-lucide-search"
              class="absolute left-3 size-4 text-neutral-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('header.search_placeholder')"
              class="w-full h-9 bg-[#242424] text-white text-sm pl-9 pr-4 rounded-full border border-transparent focus:border-white/20 focus:bg-[#2a2a2a] outline-none placeholder:text-neutral-500 transition-all"
            />
          </div>
        </div>
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
        <NuxtLink
          v-for="artist in filteredArtists"
          :key="artist.UserId || artist.Id || artist.ArtistId"
          :to="`/artist/${artist.UserId || artist.Id || artist.ArtistId}`"
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
              @click.prevent="playArtist(artist)"
            >
              <UIcon name="i-fa6-solid-play" class="size-4 text-white ml-0.5" />
            </button>
          </div>
          <p class="text-white font-semibold text-sm truncate text-center">
            {{ artist.FullName || artist.ArtistName }}
          </p>
          <p class="text-neutral-400 text-xs mt-1 text-center">
            {{
              artist.FollowerCount != null
                ? formatNumber(artist.FollowerCount) +
                  " " +
                  $t("artist.followers")
                : $t("home.artist_label")
            }}
          </p>
        </NuxtLink>
      </div>

      <!-- Empty -->
      <div
        v-if="!isLoading && filteredArtists.length === 0"
        class="text-center py-20"
      >
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
import { usePlayerStore } from "~/stores/usePlayerStore";
import { formatNumber } from "~/utils/formatNumber";

const playerStore = usePlayerStore();
const isLoading = ref(true);
const artists = ref([]);
const searchQuery = ref("");

const filteredArtists = computed(() => {
  if (!searchQuery.value.trim()) return artists.value;
  const q = searchQuery.value.toLowerCase().trim();
  return artists.value.filter((a) =>
    (a.FullName || a.ArtistName || "").toLowerCase().includes(q),
  );
});

const playArtist = async (artist) => {
  const artistId = artist.UserId || artist.Id || artist.ArtistId;
  if (!artistId) return;
  try {
    const res = await artistApi.getSongsByArtistId(artistId, {
      pageIndex: 1,
      pageSize: 50,
    });
    const artistSongs = res?.Data || res?.Items || res || [];
    if (artistSongs.length > 0) {
      playerStore.playTrack(artistSongs[0], artistSongs, 0);
    }
  } catch (error) {
    console.error("Error playing artist:", error);
  }
};

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
