<template>
  <div class="min-h-screen pb-8">
    <div class="px-6 pt-8">
      <div class="flex items-center gap-4 mb-6">
        <button
          class="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer flex items-center"
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
const popularArtistsAll = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = 24;
const totalItems = ref(0);
const scrollMainToTop = useMainScrollTop();

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sortArtistsByPopularity = (list = []) => {
  return [...list].sort((a, b) => {
    const aFollowers = toNumber(a?.FollowerCount);
    const bFollowers = toNumber(b?.FollowerCount);
    if (bFollowers !== aFollowers) return bFollowers - aFollowers;

    const aLikes = toNumber(a?.TotalLikes);
    const bLikes = toNumber(b?.TotalLikes);
    if (bLikes !== aLikes) return bLikes - aLikes;

    const aListens = toNumber(a?.TotalListens);
    const bListens = toNumber(b?.TotalListens);
    if (bListens !== aListens) return bListens - aListens;

    const aSongCount = toNumber(a?.SongCount);
    const bSongCount = toNumber(b?.SongCount);
    if (bSongCount !== aSongCount) return bSongCount - aSongCount;

    const aName = a?.FullName || a?.ArtistName || "";
    const bName = b?.FullName || b?.ArtistName || "";
    return String(aName).localeCompare(String(bName));
  });
};

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / pageSize)),
);

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

const fetchAllPopularArtists = async () => {
  const fetchPageSize = 100;
  const maxPages = 20;

  const firstRes = await artistApi.getArtists({
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
      artistApi
        .getArtists({
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

const fetchArtists = async () => {
  isLoading.value = true;
  try {
    if (popularArtistsAll.value.length === 0) {
      const list = await fetchAllPopularArtists();
      popularArtistsAll.value = sortArtistsByPopularity(list);
    }

    totalItems.value = popularArtistsAll.value.length;
    const start = (currentPage.value - 1) * pageSize;
    artists.value = popularArtistsAll.value.slice(start, start + pageSize);
  } catch (error) {
    console.error("Error fetching artists:", error);
    artists.value = [];
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const goToPage = (page) => {
  const safePage = Math.min(Math.max(1, page), totalPages.value);
  if (safePage === currentPage.value) return;
  currentPage.value = safePage;
  scrollMainToTop();
  fetchArtists();
};

onMounted(fetchArtists);
</script>
