<template>
  <div
    class="min-h-screen pb-8 bg-gradient-to-b px-4 from-[#121212] to-[#1e1e1e]"
  >
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
      <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
        <div
          v-for="song in recommendedSongs.slice(0, 6)"
          :key="song.Id"
          class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
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
          <div
            v-if="song.LikeCount || song.ListenCount"
            class="flex items-center gap-3 mt-1.5 text-neutral-500 text-xs"
          >
            <span v-if="song.LikeCount" class="flex items-center gap-1">
              <UIcon name="i-lucide-heart" class="size-3" />
              {{ formatNumber(song.LikeCount) }}
            </span>
            <span v-if="song.ListenCount" class="flex items-center gap-1">
              <UIcon name="i-lucide-headphones" class="size-3" />
              {{ formatNumber(song.ListenCount) }}
            </span>
          </div>
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
      <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
        <NuxtLink
          v-for="album in recommendedAlbums.slice(0, 6)"
          :key="album.AlbumId"
          :to="`/user/my-albums/${album.AlbumId}`"
          class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
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
              @click.prevent="playAlbum(album)"
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
        ref="featuredArtistsGridRef"
        class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6"
      >
        <NuxtLink
          v-for="artist in artists.slice(0, featuredArtistsVisibleCount)"
          :key="artist.UserId || artist.Id || artist.ArtistId"
          :to="`/artist/${artist.UserId || artist.Id || artist.ArtistId}`"
          class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
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
                  t("artist.followers")
                : t("home.artist_label")
            }}
          </p>
        </NuxtLink>
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
        ref="popularSongsGridRef"
        class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6"
      >
        <div
          v-for="song in allSongs.slice(0, popularSongsVisibleCount)"
          :key="song.Id"
          class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
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
          <div
            v-if="song.LikeCount || song.ListenCount"
            class="flex items-center gap-3 mt-1.5 text-neutral-500 text-xs"
          >
            <span v-if="song.LikeCount" class="flex items-center gap-1">
              <UIcon name="i-lucide-heart" class="size-3" />
              {{ formatNumber(song.LikeCount) }}
            </span>
            <span v-if="song.ListenCount" class="flex items-center gap-1">
              <UIcon name="i-lucide-headphones" class="size-3" />
              {{ formatNumber(song.ListenCount) }}
            </span>
          </div>
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
        ref="popularAlbumsGridRef"
        class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6"
      >
        <NuxtLink
          v-for="album in allAlbums.slice(0, popularAlbumsVisibleCount)"
          :key="album.AlbumId"
          :to="`/user/my-albums/${album.AlbumId}`"
          class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
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
              @click.prevent="playAlbum(album)"
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
import { formatNumber } from "~/utils/formatNumber";

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

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sortSongsByPopularity = (songs = []) => {
  return [...songs].sort((a, b) => {
    const aLikes = toNumber(a?.LikeCount);
    const bLikes = toNumber(b?.LikeCount);
    const aListens = toNumber(a?.ListenCount);
    const bListens = toNumber(b?.ListenCount);

    const scoreA = aLikes * 3 + aListens;
    const scoreB = bLikes * 3 + bListens;

    if (scoreB !== scoreA) return scoreB - scoreA;
    if (bLikes !== aLikes) return bLikes - aLikes;
    if (bListens !== aListens) return bListens - aListens;

    const aCreated = new Date(a?.CreatedAt || 0).getTime();
    const bCreated = new Date(b?.CreatedAt || 0).getTime();
    return bCreated - aCreated;
  });
};

const sortArtistsByPopularity = (artistList = []) => {
  return [...artistList].sort((a, b) => {
    const aFollowers = toNumber(a?.FollowerCount);
    const bFollowers = toNumber(b?.FollowerCount);
    const aLikes = toNumber(a?.TotalLikes);
    const bLikes = toNumber(b?.TotalLikes);
    const aListens = toNumber(a?.TotalListens);
    const bListens = toNumber(b?.TotalListens);
    const aSongCount = toNumber(a?.SongCount);
    const bSongCount = toNumber(b?.SongCount);

    const scoreA = aFollowers * 5 + aLikes * 2 + aListens + aSongCount * 3;
    const scoreB = bFollowers * 5 + bLikes * 2 + bListens + bSongCount * 3;

    if (scoreB !== scoreA) return scoreB - scoreA;
    if (bFollowers !== aFollowers) return bFollowers - aFollowers;
    if (bListens !== aListens) return bListens - aListens;
    return bSongCount - aSongCount;
  });
};

const featuredArtistsGridRef = ref(null);
const popularSongsGridRef = ref(null);
const popularAlbumsGridRef = ref(null);

const featuredArtistsVisibleCount = ref(6);
const popularSongsVisibleCount = ref(6);
const popularAlbumsVisibleCount = ref(6);

const CARD_MIN_WIDTH = 180;
const GRID_GAP = 24;

const getVisibleCountForOneRow = (element, fallback = 6) => {
  const width = element?.clientWidth || 0;
  if (!width) return fallback;
  return Math.max(
    1,
    Math.floor((width + GRID_GAP) / (CARD_MIN_WIDTH + GRID_GAP)),
  );
};

const recalculateOneRowCounts = () => {
  featuredArtistsVisibleCount.value = getVisibleCountForOneRow(
    featuredArtistsGridRef.value,
    6,
  );
  popularSongsVisibleCount.value = getVisibleCountForOneRow(
    popularSongsGridRef.value,
    6,
  );
  popularAlbumsVisibleCount.value = getVisibleCountForOneRow(
    popularAlbumsGridRef.value,
    6,
  );
};

let homeGridResizeObserver = null;

const attachGridObservers = () => {
  if (!import.meta.client || !homeGridResizeObserver) return;

  homeGridResizeObserver.disconnect();

  [
    featuredArtistsGridRef.value,
    popularSongsGridRef.value,
    popularAlbumsGridRef.value,
  ]
    .filter(Boolean)
    .forEach((element) => homeGridResizeObserver.observe(element));
};

// Play a song and set queue
const playSong = (song, queue) => {
  const index = queue.findIndex((s) => s.Id === song.Id);
  playerStore.playTrack(song, queue, index >= 0 ? index : 0);
};

// Play all songs by an artist
const playArtist = async (artist) => {
  const artistId = artist.UserId || artist.Id || artist.ArtistId;
  if (!artistId) return;
  try {
    const res = await artistApi.getSongsByArtistId(artistId, {
      pageIndex: 1,
      pageSize: 20,
    });
    const artistSongs = res?.Data || res?.Items || res || [];
    if (artistSongs.length > 0) {
      playerStore.playTrack(artistSongs[0], artistSongs, 0);
    }
  } catch (error) {
    console.error("Error playing artist:", error);
  }
};

// Play all songs in an album
const playAlbum = async (album) => {
  const albumId = album.AlbumId || album.Id;
  if (!albumId) return;
  try {
    const res = await musicApi.getAlbumDetail(albumId, { pageSize: 15 });
    let albumSongs = [];
    if (res?.Songs?.Data) {
      albumSongs = res.Songs.Data;
    } else if (res?.data?.Songs?.Data) {
      albumSongs = res.data.Songs.Data;
    }
    if (albumSongs.length > 0) {
      // Map to player format
      const queue = albumSongs.map((s) => ({
        Id: s.SongId || s.Id,
        Title: s.Title,
        ArtistNames: s.ArtistNames || "Unknown Artist",
        Thumbnail: s.Thumbnail,
        FileUrl: s.FileUrl,
        Duration: s.Duration,
      }));
      playerStore.playTrack(queue[0], queue, 0);
    }
  } catch (error) {
    console.error("Error playing album:", error);
  }
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
      const songList = songsRes.Data || songsRes || [];
      allSongs.value = sortSongsByPopularity(songList);
    }

    // Handle albums response
    if (albumsRes) {
      allAlbums.value = albumsRes.Data || albumsRes || [];
    }

    // Handle artists response
    if (artistsRes) {
      const artistList = artistsRes.Data || artistsRes || [];
      artists.value = sortArtistsByPopularity(artistList);
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
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
  recalculateOneRowCounts();

  if (import.meta.client) {
    window.addEventListener("resize", recalculateOneRowCounts);

    homeGridResizeObserver = new ResizeObserver(() => {
      recalculateOneRowCounts();
    });

    attachGridObservers();
  }
});

watch(
  [
    () => artists.value.length,
    () => allSongs.value.length,
    () => allAlbums.value.length,
    () => isLoading.value,
  ],
  async () => {
    await nextTick();
    recalculateOneRowCounts();
    attachGridObservers();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener("resize", recalculateOneRowCounts);
  }
  homeGridResizeObserver?.disconnect();
  homeGridResizeObserver = null;
});
</script>
