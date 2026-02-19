<template>
  <div class="min-h-screen pb-8">
    <!-- Hero Gradient Header -->
    <div
      class="relative -mx-4 -mt-4 px-6 pt-12 pb-8"
      style="
        background: linear-gradient(
          180deg,
          #4c1d95 0%,
          #2d1a5e 45%,
          #121212 100%
        );
      "
    >
      <h1 class="text-4xl font-bold text-white mb-6">
        {{ greeting }}
      </h1>

      <!-- Quick Pick Grid (Recently Played - compact cards) -->
      <div
        v-if="recentSongs.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-6"
      >
        <div
          v-for="song in recentSongs.slice(0, 8)"
          :key="song.Id"
          class="flex items-center bg-white/10 hover:bg-white/20 rounded-md overflow-hidden group cursor-pointer transition-colors"
          @click="playSong(song, recentSongs)"
        >
          <img
            v-if="song.Thumbnail"
            :src="song.Thumbnail"
            :alt="song.Title"
            class="w-12 h-12 object-cover shrink-0"
          />
          <div
            v-else
            class="w-12 h-12 bg-[#282828] flex items-center justify-center shrink-0"
          >
            <UIcon name="i-lucide-music" class="size-5 text-neutral-500" />
          </div>
          <span class="text-sm font-semibold text-white px-3 truncate flex-1">
            {{ song.Title }}
          </span>
          <!-- Play button on hover -->
          <button
            class="w-10 h-10 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center mr-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg shadow-black/50 hover:scale-105 cursor-pointer"
            @click.stop="playSong(song, recentSongs)"
          >
            <UIcon name="i-fa6-solid-play" class="size-3.5 text-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Recommended Songs Section -->
    <section v-if="recommendedSongs.length > 0" class="mt-8 px-2">
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-2xl font-bold text-white hover:underline cursor-pointer"
        >
          {{ t("home.recommended_songs") }}
        </h2>
        <NuxtLink
          to="/browse/songs?type=recommended"
          class="text-sm font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {{ t("home.show_all") }}
        </NuxtLink>
      </div>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="song in recommendedSongs.slice(0, 6)"
          :key="song.Id"
          class="group hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer"
          @click="playSong(song, recommendedSongs)"
        >
          <div class="relative mb-4">
            <img
              v-if="song.Thumbnail"
              :src="song.Thumbnail"
              :alt="song.Title"
              class="w-full aspect-square object-cover rounded-md shadow-lg shadow-black/50"
            />
            <div
              v-else
              class="w-full aspect-square bg-[#282828] rounded-md flex items-center justify-center"
            >
              <UIcon name="i-lucide-music" class="size-12 text-neutral-500" />
            </div>
            <button
              class="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg shadow-black/60 hover:scale-105 cursor-pointer"
              @click.stop="playSong(song, recommendedSongs)"
            >
              <UIcon name="i-fa6-solid-play" class="size-4 text-white ml-0.5" />
            </button>
          </div>
          <p class="text-white font-semibold text-sm truncate">
            {{ song.Title }}
          </p>
          <p class="text-neutral-400 text-xs mt-1 truncate">
            {{ song.ArtistNames || t("home.unknown_artist") }}
          </p>
        </div>
      </div>
    </section>

    <!-- Recommended Albums Section -->
    <section v-if="recommendedAlbums.length > 0" class="mt-10 px-2">
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-2xl font-bold text-white hover:underline cursor-pointer"
        >
          {{ t("home.recommended_albums") }}
        </h2>
        <NuxtLink
          to="/browse/albums?type=recommended"
          class="text-sm font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {{ t("home.show_all") }}
        </NuxtLink>
      </div>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <NuxtLink
          v-for="album in recommendedAlbums.slice(0, 6)"
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
            {{ album.ArtistName || t("home.unknown_artist") }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Artists Section -->
    <section v-if="artists.length > 0" class="mt-10 px-2">
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-2xl font-bold text-white hover:underline cursor-pointer"
        >
          {{ t("home.featured_artists") }}
        </h2>
        <NuxtLink
          to="/browse/artists"
          class="text-sm font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {{ t("home.show_all") }}
        </NuxtLink>
      </div>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="artist in artists.slice(0, 6)"
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
            {{ t("home.artist_label") }}
          </p>
        </div>
      </div>
    </section>

    <!-- All Songs (Browse) Section -->
    <section v-if="allSongs.length > 0" class="mt-10 px-2">
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-2xl font-bold text-white hover:underline cursor-pointer"
        >
          {{ t("home.popular_songs") }}
        </h2>
        <NuxtLink
          to="/browse/songs?type=popular"
          class="text-sm font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {{ t("home.show_all") }}
        </NuxtLink>
      </div>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="song in allSongs.slice(0, 12)"
          :key="song.Id"
          class="group hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer"
          @click="playSong(song, allSongs)"
        >
          <div class="relative mb-4">
            <img
              v-if="song.Thumbnail"
              :src="song.Thumbnail"
              :alt="song.Title"
              class="w-full aspect-square object-cover rounded-md shadow-lg shadow-black/50"
            />
            <div
              v-else
              class="w-full aspect-square bg-[#282828] rounded-md flex items-center justify-center"
            >
              <UIcon name="i-lucide-music" class="size-12 text-neutral-500" />
            </div>
            <button
              class="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg shadow-black/60 hover:scale-105 cursor-pointer"
              @click.stop="playSong(song, allSongs)"
            >
              <UIcon name="i-fa6-solid-play" class="size-4 text-white ml-0.5" />
            </button>
          </div>
          <p class="text-white font-semibold text-sm truncate">
            {{ song.Title }}
          </p>
          <p class="text-neutral-400 text-xs mt-1 truncate">
            {{ song.ArtistNames || t("home.unknown_artist") }}
          </p>
        </div>
      </div>
    </section>

    <!-- All Albums Section -->
    <section v-if="allAlbums.length > 0" class="mt-10 px-2">
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-2xl font-bold text-white hover:underline cursor-pointer"
        >
          {{ t("home.popular_albums") }}
        </h2>
        <NuxtLink
          to="/browse/albums?type=popular"
          class="text-sm font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {{ t("home.show_all") }}
        </NuxtLink>
      </div>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <NuxtLink
          v-for="album in allAlbums.slice(0, 6)"
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
            {{ album.ArtistName || t("home.unknown_artist") }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UIcon
        name="i-lucide-loader-2"
        class="size-8 text-neutral-400 animate-spin"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="
        !isLoading && allSongs.length === 0 && recommendedSongs.length === 0
      "
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon name="i-lucide-music" class="size-16 text-neutral-600 mb-4" />
      <h3 class="text-xl font-bold text-white mb-2">
        {{ t("home.empty_title") }}
      </h3>
      <p class="text-neutral-400">
        {{ t("home.empty_description") }}
      </p>
    </div>
  </div>
</template>

<script setup>
import musicApi from "~/api/musicApi";
import artistApi from "~/api/artistApi";
import recommendationApi from "~/api/recommendationApi";
import interactionApi from "~/api/interactionApi";
import { usePlayerStore } from "~/stores/usePlayerStore";

const { t } = useI18n();
const { user } = useAuth();
const playerStore = usePlayerStore();

// State
const isLoading = ref(true);
const recommendedSongs = ref([]);
const recommendedAlbums = ref([]);
const recentSongs = ref([]);
const allSongs = ref([]);
const allAlbums = ref([]);
const artists = ref([]);

// Greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return t("home.good_morning");
  if (hour < 18) return t("home.good_afternoon");
  return t("home.good_evening");
});

// Play a song and set queue
const playSong = (song, queue) => {
  const index = queue.findIndex((s) => s.Id === song.Id);
  playerStore.playTrack(song, queue, index >= 0 ? index : 0);
};

// Fetch all data
const fetchData = async () => {
  isLoading.value = true;
  try {
    const userId = user.value?.id;

    // Fetch data in parallel
    const [songsRes, albumsRes, artistsRes] = await Promise.all([
      musicApi.getSongs({ pageIndex: 1, pageSize: 20 }).catch(() => null),
      musicApi.getAlbums({ pageIndex: 1, pageSize: 12 }).catch(() => null),
      artistApi.getArtists({ pageIndex: 1, pageSize: 12 }).catch(() => null),
    ]);

    // Handle songs response
    if (songsRes) {
      allSongs.value = songsRes.Data || songsRes || [];
    }

    // Handle albums response
    if (albumsRes) {
      allAlbums.value = albumsRes.Data || albumsRes || [];
    }

    // Handle artists response
    if (artistsRes) {
      artists.value = artistsRes.Data || artistsRes || [];
    }

    // Fetch recommendations if user is logged in
    if (userId) {
      const [recSongsRes, recAlbumsRes, likedRes] = await Promise.all([
        recommendationApi.getRecommendedSongs(userId, 20).catch(() => null),
        recommendationApi.getRecommendedAlbums(userId, 10).catch(() => null),
        interactionApi
          .getLikedSongs({ pageIndex: 1, pageSize: 10 })
          .catch(() => null),
      ]);

      if (recSongsRes) {
        recommendedSongs.value = recSongsRes.Data || recSongsRes || [];
      }

      if (recAlbumsRes) {
        recommendedAlbums.value = recAlbumsRes.Data || recAlbumsRes || [];
      }

      // Use liked songs as "recently played" fallback
      if (likedRes) {
        recentSongs.value = likedRes.Data || likedRes || [];
      }
    }
  } catch (error) {
    console.error("Error fetching home data:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
