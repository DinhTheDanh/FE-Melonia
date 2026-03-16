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

      <!-- Songs Grid -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <div
          v-for="song in filteredSongs"
          :key="song.Id"
          class="group hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer"
          @click="playSong(song)"
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
              @click.stop="playSong(song)"
            >
              <UIcon name="i-fa6-solid-play" class="size-4 text-white ml-0.5" />
            </button>
          </div>
          <p class="text-white font-semibold text-sm truncate">
            {{ song.Title }}
          </p>
          <p class="text-neutral-400 text-xs mt-1 truncate">
            {{ song.ArtistNames || $t("home.unknown_artist") }}
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

      <!-- Pagination -->
      <div
        v-if="!isLoading && totalPages > 1"
        class="flex items-center justify-center gap-4 mt-8"
      >
        <button
          class="px-3 py-1.5 rounded-full text-sm border border-white/15 text-neutral-300 hover:text-white hover:border-white/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          {{ $t("song.previous") || "Previous" }}
        </button>
        <span class="text-sm text-neutral-300">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          class="px-3 py-1.5 rounded-full text-sm border border-white/15 text-neutral-300 hover:text-white hover:border-white/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          {{ $t("song.next") || "Next" }}
        </button>
      </div>

      <!-- Empty -->
      <div
        v-if="!isLoading && filteredSongs.length === 0"
        class="text-center py-20"
      >
        <UIcon
          name="i-lucide-music"
          class="size-16 text-neutral-600 mb-4 mx-auto"
        />
        <p class="text-neutral-400">{{ $t("song.no_songs") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import musicApi from "~/api/musicApi";
import recommendationApi from "~/api/recommendationApi";
import { usePlayerStore } from "~/stores/usePlayerStore";
import { formatNumber } from "~/utils/formatNumber";

const { t } = useI18n();
const route = useRoute();
const playerStore = usePlayerStore();
const { user } = useAuth();

const isLoading = ref(true);
const songs = ref([]);
const recommendedSongsAll = ref([]);
const popularSongsAll = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = 24;
const totalItems = ref(0);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sortSongsByPopularity = (list = []) => {
  return [...list].sort((a, b) => {
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

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / pageSize)),
);

const filteredSongs = computed(() => {
  if (!searchQuery.value.trim()) return songs.value;
  const q = searchQuery.value.toLowerCase().trim();
  return songs.value.filter(
    (s) =>
      (s.Title || "").toLowerCase().includes(q) ||
      (s.ArtistNames || "").toLowerCase().includes(q),
  );
});

const type = computed(() => route.query.type || "popular");
const genreId = computed(() => route.query.genreId || null);
const genreName = computed(() =>
  route.query.genreName ? decodeURIComponent(route.query.genreName) : null,
);

const title = computed(() => {
  if (type.value === "genre" && genreName.value) return genreName.value;
  if (type.value === "recommended") return t("home.recommended_songs");
  return t("home.popular_songs");
});

const playSong = (song) => {
  const index = songs.value.findIndex((s) => s.Id === song.Id);
  playerStore.playTrack(song, songs.value, index >= 0 ? index : 0);
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

const fetchAllPopularSongs = async () => {
  const fetchPageSize = 100;
  const maxPages = 20;

  const firstRes = await musicApi.getSongs({
    pageIndex: 1,
    pageSize: fetchPageSize,
  });
  const firstList = firstRes?.Data || firstRes || [];
  const total = parseTotalItems(firstRes, firstList.length);

  const totalPagesFromApi = Math.ceil(total / fetchPageSize);
  const pagesToFetch = Math.max(1, Math.min(totalPagesFromApi, maxPages));

  if (pagesToFetch <= 1) return firstList;

  const remainingResponses = await Promise.all(
    Array.from({ length: pagesToFetch - 1 }, (_, index) =>
      musicApi
        .getSongs({
          pageIndex: index + 2,
          pageSize: fetchPageSize,
        })
        .catch(() => null),
    ),
  );

  const remainingItems = remainingResponses
    .filter(Boolean)
    .flatMap((res) => res?.Data || res || []);

  return [...firstList, ...remainingItems];
};

const fetchSongs = async () => {
  isLoading.value = true;
  try {
    if (type.value === "genre" && genreId.value) {
      // Fetch songs filtered by genre
      const res = await musicApi.getSongs({
        genreId: genreId.value,
        pageIndex: currentPage.value,
        pageSize,
      });
      const list = res?.Data || res || [];
      songs.value = list;
      totalItems.value = parseTotalItems(res, list.length);
    } else if (type.value === "recommended" && user.value?.id) {
      if (recommendedSongsAll.value.length === 0) {
        const res = await recommendationApi.getRecommendedSongs(
          user.value.id,
          100,
        );
        const list = res?.Data || res || [];
        recommendedSongsAll.value = sortSongsByPopularity(list);
      }
      totalItems.value = recommendedSongsAll.value.length;
      const start = (currentPage.value - 1) * pageSize;
      songs.value = recommendedSongsAll.value.slice(start, start + pageSize);
    } else {
      if (popularSongsAll.value.length === 0) {
        const list = await fetchAllPopularSongs();
        popularSongsAll.value = sortSongsByPopularity(list);
      }

      totalItems.value = popularSongsAll.value.length;
      const start = (currentPage.value - 1) * pageSize;
      songs.value = popularSongsAll.value.slice(start, start + pageSize);
    }
  } catch (error) {
    console.error("Error fetching songs:", error);
    songs.value = [];
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const goToPage = (page) => {
  const safePage = Math.min(Math.max(1, page), totalPages.value);
  if (safePage === currentPage.value) return;
  currentPage.value = safePage;
  fetchSongs();
};

watch([type, genreId], () => {
  currentPage.value = 1;
  recommendedSongsAll.value = [];
  popularSongsAll.value = [];
  fetchSongs();
});

onMounted(fetchSongs);
</script>
