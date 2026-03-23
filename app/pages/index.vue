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
      <div
        ref="recommendedSongsGridRef"
        class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4"
      >
        <div
          v-for="song in recommendedSongs.slice(
            0,
            recommendedSongsVisibleCount,
          )"
          :key="song.Id"
          class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
          @click="openSongDetail(song)"
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
              @click.stop="toggleSongPlayback(song, recommendedSongs)"
            >
              <UIcon
                v-if="isSongPlaying(song)"
                name="i-fa6-solid-pause"
                class="size-4 text-white"
              />
              <UIcon
                v-else
                name="i-fa6-solid-play"
                class="size-4 text-white ml-0.5"
              />
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
      <div
        ref="recommendedAlbumsGridRef"
        class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4"
      >
        <NuxtLink
          v-for="album in recommendedAlbums.slice(
            0,
            recommendedAlbumsVisibleCount,
          )"
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
        class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4"
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
        class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4"
      >
        <div
          v-for="song in allSongs.slice(0, popularSongsVisibleCount)"
          :key="song.Id"
          class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
          @click="openSongDetail(song)"
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
              @click.stop="toggleSongPlayback(song, allSongs)"
            >
              <UIcon
                v-if="isSongPlaying(song)"
                name="i-fa6-solid-pause"
                class="size-4 text-white"
              />
              <UIcon
                v-else
                name="i-fa6-solid-play"
                class="size-4 text-white ml-0.5"
              />
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
        class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4"
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
    <div v-if="isLoading" class="space-y-10 mt-8 px-2 animate-pulse">
      <section v-for="section in 3" :key="section">
        <div class="flex items-center justify-between mb-4">
          <div class="h-7 w-56 rounded bg-neutral-800/80"></div>
          <div class="h-4 w-20 rounded bg-neutral-800/70"></div>
        </div>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          <div
            v-for="item in 6"
            :key="`skeleton-${section}-${item}`"
            class="rounded-lg p-3 bg-[#1a1a1a]"
          >
            <div
              class="w-full aspect-square rounded-md bg-neutral-800/80 mb-4"
            ></div>
            <div class="h-4 w-3/4 rounded bg-neutral-800/80"></div>
            <div class="h-3 w-1/2 rounded bg-neutral-800/60 mt-2"></div>
            <div class="flex items-center gap-3 mt-3">
              <div class="h-3 w-12 rounded bg-neutral-800/60"></div>
              <div class="h-3 w-12 rounded bg-neutral-800/60"></div>
            </div>
          </div>
        </div>
      </section>
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

const parseTotalItems = (response, fallbackLength) => {
  return (
    response?.TotalRecords ||
    response?.TotalCount ||
    response?.Pagination?.TotalRecords ||
    response?.Pagination?.TotalCount ||
    response?.Meta?.TotalRecords ||
    response?.Meta?.TotalCount ||
    fallbackLength ||
    0
  );
};

const sortSongsByPopularity = (songs = []) => {
  return [...songs].sort((a, b) => {
    const aListens = toNumber(a?.ListenCount);
    const bListens = toNumber(b?.ListenCount);
    if (bListens !== aListens) return bListens - aListens;

    const aLikes = toNumber(a?.LikeCount);
    const bLikes = toNumber(b?.LikeCount);
    if (bLikes !== aLikes) return bLikes - aLikes;

    const aCreated = new Date(a?.CreatedAt || 0).getTime();
    const bCreated = new Date(b?.CreatedAt || 0).getTime();
    if (bCreated !== aCreated) return bCreated - aCreated;

    return String(a?.Title || "").localeCompare(String(b?.Title || ""));
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

    if (bFollowers !== aFollowers) return bFollowers - aFollowers;
    if (bLikes !== aLikes) return bLikes - aLikes;
    if (bListens !== aListens) return bListens - aListens;
    if (bSongCount !== aSongCount) return bSongCount - aSongCount;

    const aName = a?.FullName || a?.ArtistName || "";
    const bName = b?.FullName || b?.ArtistName || "";
    return String(aName).localeCompare(String(bName));
  });
};

const fetchAllSongsForPopularity = async () => {
  const fetchPageSize = 100;
  const maxPages = 10;

  const firstRes = await musicApi
    .getSongs({ pageIndex: 1, pageSize: fetchPageSize })
    .catch(() => null);
  if (!firstRes) return [];

  const firstList = firstRes.Data || firstRes || [];
  const total = parseTotalItems(firstRes, firstList.length);
  const totalPages = Math.ceil(total / fetchPageSize);
  const pagesToFetch = Math.max(1, Math.min(totalPages, maxPages));

  if (pagesToFetch <= 1) return firstList;

  const rest = await Promise.all(
    Array.from({ length: pagesToFetch - 1 }, (_, index) =>
      musicApi
        .getSongs({ pageIndex: index + 2, pageSize: fetchPageSize })
        .catch(() => null),
    ),
  );

  const restItems = rest
    .filter(Boolean)
    .flatMap((res) => res?.Data || res || []);

  return [...firstList, ...restItems];
};

const fetchAllArtistsForPopularity = async () => {
  const fetchPageSize = 100;
  const maxPages = 10;

  const firstRes = await artistApi
    .getArtists({ pageIndex: 1, pageSize: fetchPageSize })
    .catch(() => null);
  if (!firstRes) return [];

  const firstList = firstRes.Data || firstRes || [];
  const total = parseTotalItems(firstRes, firstList.length);
  const totalPages = Math.ceil(total / fetchPageSize);
  const pagesToFetch = Math.max(1, Math.min(totalPages, maxPages));

  if (pagesToFetch <= 1) return firstList;

  const rest = await Promise.all(
    Array.from({ length: pagesToFetch - 1 }, (_, index) =>
      artistApi
        .getArtists({ pageIndex: index + 2, pageSize: fetchPageSize })
        .catch(() => null),
    ),
  );

  const restItems = rest
    .filter(Boolean)
    .flatMap((res) => res?.Data || res || []);

  return [...firstList, ...restItems];
};

const featuredArtistsGridRef = ref(null);
const popularSongsGridRef = ref(null);
const popularAlbumsGridRef = ref(null);
const recommendedSongsGridRef = ref(null);
const recommendedAlbumsGridRef = ref(null);

const featuredArtistsVisibleCount = ref(6);
const popularSongsVisibleCount = ref(6);
const popularAlbumsVisibleCount = ref(6);
const recommendedSongsVisibleCount = ref(6);
const recommendedAlbumsVisibleCount = ref(6);

const CARD_MIN_WIDTH = 230;
const GRID_GAP = 16;

const getVisibleCountForOneRow = (element, fallback = 6) => {
  const width = element?.clientWidth || 0;
  if (!width) return fallback;
  return Math.max(
    1,
    Math.floor((width + GRID_GAP) / (CARD_MIN_WIDTH + GRID_GAP)),
  );
};

const recalculateOneRowCounts = () => {
  recommendedSongsVisibleCount.value = getVisibleCountForOneRow(
    recommendedSongsGridRef.value,
    6,
  );
  recommendedAlbumsVisibleCount.value = getVisibleCountForOneRow(
    recommendedAlbumsGridRef.value,
    6,
  );
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
    recommendedSongsGridRef.value,
    recommendedAlbumsGridRef.value,
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

const getSongId = (song) => {
  return String(song?.SongId || song?.Id || song?.songId || "").trim();
};

const isSongPlaying = (song) => {
  const currentId = getSongId(playerStore.currentTrack);
  const targetId = getSongId(song);
  if (!currentId || !targetId) return false;
  return currentId === targetId && playerStore.isPlaying;
};

const toggleSongPlayback = (song, queue) => {
  const currentId = getSongId(playerStore.currentTrack);
  const targetId = getSongId(song);

  if (currentId && targetId && currentId === targetId) {
    playerStore.togglePlay();
    return;
  }

  playSong(song, queue);
};

const openSongDetail = async (song) => {
  const id = getSongId(song);
  if (!id) return;
  await navigateTo(`/song/${id}`);
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
    const [songsList, albumsRes, artistsList] = await Promise.all([
      fetchAllSongsForPopularity(),
      musicApi.getAlbums({ pageIndex: 1, pageSize: 12 }).catch(() => null),
      fetchAllArtistsForPopularity(),
    ]);

    // Handle songs response
    allSongs.value = sortSongsByPopularity(songsList || []);

    // Handle albums response
    if (albumsRes) {
      allAlbums.value = albumsRes.Data || albumsRes || [];
    }

    // Handle artists response
    artists.value = sortArtistsByPopularity(artistsList || []);

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
    () => recommendedSongs.value.length,
    () => recommendedAlbums.value.length,
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
