<template>
  <div class="min-h-screen bg-[#121212] text-white">
    <section class="relative overflow-hidden">
      <div
        class="absolute inset-0"
        :style="{
          backgroundImage: heroBackground,
        }"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#121212]"
      ></div>

      <div class="relative max-w-6xl mx-auto px-6 pt-12 pb-10">
        <div
          v-if="isLoading"
          class="animate-pulse flex flex-col md:flex-row gap-6"
        >
          <div class="w-48 h-48 rounded-xl bg-white/10"></div>
          <div class="flex-1 space-y-4 pt-4">
            <div class="h-3 w-24 rounded bg-white/10"></div>
            <div class="h-10 w-4/5 rounded bg-white/10"></div>
            <div class="h-4 w-1/2 rounded bg-white/10"></div>
            <div class="h-4 w-1/3 rounded bg-white/10"></div>
          </div>
        </div>

        <div
          v-else-if="song"
          class="flex flex-col md:flex-row gap-6 items-start"
        >
          <div
            class="w-48 h-48 rounded-xl overflow-hidden shadow-2xl shadow-black/50 shrink-0"
          >
            <img
              v-if="safeThumbnail"
              :src="safeThumbnail"
              :alt="song.Title"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-[#232323] flex items-center justify-center"
            >
              <UIcon name="i-lucide-music" class="size-16 text-neutral-500" />
            </div>
          </div>

          <div class="min-w-0 flex-1 pt-1">
            <p
              class="text-xs font-bold uppercase tracking-[0.16em] text-white/80 mb-3"
            >
              {{ t("song.detail_type") }}
            </p>
            <h1
              class="text-4xl md:text-6xl font-black leading-tight break-words"
            >
              {{ song.Title || t("song.detail_untitled") }}
            </h1>
            <div
              class="mt-4 text-sm text-neutral-200 flex flex-wrap items-center gap-x-2 gap-y-1"
            >
              <span
                v-if="artistLinks.length > 0"
                class="text-white font-semibold"
              >
                <template
                  v-for="(artist, index) in artistLinks"
                  :key="`${artist.id || artist.name}-${index}`"
                >
                  <NuxtLink
                    v-if="artist.id"
                    :to="`/artist/${artist.id}`"
                    class="hover:underline"
                  >
                    {{ artist.name }}
                  </NuxtLink>
                  <span v-else>{{ artist.name }}</span>
                  <span
                    v-if="index < artistLinks.length - 1"
                    class="text-neutral-400"
                    >,
                  </span>
                </template>
              </span>
              <span class="text-neutral-400">•</span>
              <span>{{ formatDuration(song.Duration) }}</span>
              <span class="text-neutral-400">•</span>
              <span>{{ formatDate(song.CreatedAt || song.ReleaseDate) }}</span>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <button
                class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-black font-bold hover:brightness-110 transition cursor-pointer"
                @click="playCurrentSong"
              >
                <UIcon
                  v-if="isCurrentSongPlaying"
                  name="i-fa6-solid-pause"
                  class="size-4"
                />
                <UIcon v-else name="i-fa6-solid-play" class="size-4" />
                {{
                  isCurrentSongPlaying
                    ? t("song.detail_pause")
                    : t("song.detail_play")
                }}
              </button>
              <button
                class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold transition cursor-pointer"
                @click="queueCurrentSong"
              >
                <UIcon name="i-lucide-list-plus" class="size-4" />
                {{ t("song.detail_add_to_queue") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-6 pb-14">
      <div
        v-if="errorMessage"
        class="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200"
      >
        {{ errorMessage }}
      </div>

      <div v-if="song" class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h2 class="text-xl font-bold mb-4">
              {{ t("song.detail_info_title") }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="rounded-lg bg-black/20 p-3">
                <p class="text-neutral-400 mb-1">
                  {{ t("song.detail_listens") }}
                </p>
                <p class="text-lg font-bold">
                  {{ formatNumber(song.ListenCount || 0) }}
                </p>
              </div>
              <div class="rounded-lg bg-black/20 p-3">
                <p class="text-neutral-400 mb-1">
                  {{ t("song.detail_likes") }}
                </p>
                <p class="text-lg font-bold">
                  {{ formatNumber(song.LikeCount || 0) }}
                </p>
              </div>
              <div class="rounded-lg bg-black/20 p-3">
                <p class="text-neutral-400 mb-1">
                  {{ t("song.detail_genre") }}
                </p>
                <p class="text-lg font-bold truncate">
                  {{ song.GenreName || "-" }}
                </p>
              </div>
              <div class="rounded-lg bg-black/20 p-3">
                <p class="text-neutral-400 mb-1">
                  {{ t("song.detail_album") }}
                </p>
                <p class="text-lg font-bold truncate">
                  {{ song.AlbumTitle || t("song.detail_single") }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
          >
            <h2 class="text-xl font-bold mb-4">
              {{ t("song.detail_lyrics") }}
            </h2>
            <p
              v-if="song.Lyrics"
              class="text-neutral-200 leading-7 whitespace-pre-line"
            >
              {{ song.Lyrics }}
            </p>
            <p v-else class="text-neutral-400">
              {{ t("song.detail_no_lyrics") }}
            </p>
          </div>
        </div>

        <aside class="space-y-4">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 class="text-lg font-bold mb-3">
              {{ t("song.detail_artists") }}
            </h3>
            <div class="space-y-2">
              <NuxtLink
                v-for="(artist, index) in artistLinks"
                :key="`${artist.id || artist.name}-${index}`"
                :to="artist.id ? `/artist/${artist.id}` : '/browse/artists'"
                class="block rounded-lg px-3 py-2 bg-black/20 hover:bg-white/10 transition"
              >
                {{ artist.name }}
              </NuxtLink>
              <p v-if="artistLinks.length === 0" class="text-neutral-400">
                {{ t("home.unknown_artist") }}
              </p>
            </div>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 class="text-lg font-bold mb-3">
              {{ t("song.detail_next_up") }}
            </h3>
            <div class="space-y-2">
              <button
                v-for="(item, index) in relatedSongs"
                :key="`${item.Id || item.SongId || index}`"
                class="w-full text-left rounded-lg px-3 py-2 bg-black/20 hover:bg-white/10 transition cursor-pointer"
                @click="goToSong(item)"
              >
                <p class="text-sm font-semibold truncate">{{ item.Title }}</p>
                <p class="text-xs text-neutral-400 truncate">
                  {{ item.ArtistNames || item.ArtistName || "-" }}
                </p>
              </button>
              <p v-if="relatedSongs.length === 0" class="text-neutral-400">
                {{ t("song.detail_no_related") }}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import musicApi from "~/api/musicApi";
import recommendationApi from "~/api/recommendationApi";
import { usePlayerStore } from "~/stores/usePlayerStore";
import { formatNumber } from "~/utils/formatNumber";

const route = useRoute();
const toast = useToast();
const { t } = useI18n();
const playerStore = usePlayerStore();
const auth = useAuth();

const song = ref(null);
const relatedSongs = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

const songId = computed(() => String(route.params.id || "").trim());

const normalizeMediaUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";

  // Skip malformed Nuxt asset directory requests like /_nuxt/
  if (url === "/_nuxt/" || url === "_nuxt/" || url === "/_nuxt") {
    return "";
  }

  return url;
};

const safeThumbnail = computed(() => {
  return normalizeMediaUrl(song.value?.Thumbnail);
});

const heroBackground = computed(() => {
  if (!safeThumbnail.value) {
    return "linear-gradient(135deg, rgba(34,197,94,0.35), rgba(15,15,15,0.9))";
  }

  return `linear-gradient(135deg, rgba(22,22,22,0.35), rgba(15,15,15,0.92)), url('${safeThumbnail.value}')`;
});

const parseItems = (res) => {
  if (Array.isArray(res?.Data)) return res.Data;
  if (Array.isArray(res?.Items)) return res.Items;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
};

const parseTotalPages = (res) => {
  const pages = Number(
    res?.TotalPages ||
      res?.Pagination?.TotalPages ||
      res?.Meta?.TotalPages ||
      1,
  );
  return Number.isFinite(pages) && pages > 0 ? pages : 1;
};

const getSongId = (item) => {
  return String(item?.SongId || item?.Id || item?.songId || "").trim();
};

const normalizeArtistField = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  }

  if (value === null || value === undefined) {
    return [];
  }

  return String(value)
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const artistLinks = computed(() => {
  if (!song.value) return [];

  if (Array.isArray(song.value.Artists) && song.value.Artists.length > 0) {
    const mapped = song.value.Artists.map((artist) => ({
      id: artist?.UserId || artist?.Id || artist?.ArtistId || null,
      name: artist?.FullName || artist?.Name || artist?.ArtistName || "Artist",
    })).filter((artist) => artist.name && artist.name.trim().length > 0);

    if (mapped.length > 0) return mapped;
  }

  const names = normalizeArtistField(
    song.value.ArtistNames || song.value.ArtistName,
  );
  const ids = normalizeArtistField(song.value.ArtistIds || song.value.ArtistId);

  if (ids.length === 0) return names.map((name) => ({ id: null, name }));

  return ids.map((id, index) => ({
    id,
    name: names[index] || names[0] || "Artist",
  }));
});

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(Number(seconds))) return "0:00";
  const mins = Math.floor(Number(seconds) / 60);
  const secs = Math.floor(Number(seconds) % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const isCurrentSongPlaying = computed(() => {
  const currentId = getSongId(playerStore.currentTrack);
  if (!currentId || !songId.value) return false;
  return currentId === songId.value && playerStore.isPlaying;
});

const searchSongAcrossPages = async (keyword = "") => {
  const pageSize = 100;
  let pageIndex = 1;
  let totalPages = 1;

  do {
    const res = await musicApi.getSongs({ keyword, pageIndex, pageSize });
    const items = parseItems(res);
    const found = items.find((item) => getSongId(item) === songId.value);
    if (found) return found;

    totalPages = Math.min(parseTotalPages(res), 20);
    pageIndex += 1;
  } while (pageIndex <= totalPages);

  return null;
};

const fetchSong = async () => {
  if (!songId.value) return;
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const currentTrackId = getSongId(playerStore.currentTrack);
    if (currentTrackId === songId.value && playerStore.currentTrack) {
      song.value = playerStore.currentTrack;
    }

    if (!song.value) {
      song.value = await searchSongAcrossPages();
    }

    if (!song.value) {
      const fromQueue = (playerStore.queue || []).find(
        (item) => getSongId(item) === songId.value,
      );
      if (fromQueue) {
        song.value = fromQueue;
      }
    }

    if (!song.value) {
      errorMessage.value = t("song.detail_not_found");
      return;
    }

    await fetchRelatedSongs();
  } catch (error) {
    errorMessage.value = t("song.detail_load_failed");
    toast.add({
      title: t("notify.error"),
      description: t("song.detail_load_failed"),
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const fetchRelatedSongs = async () => {
  if (!song.value) return;

  const currentUserId =
    auth.user.value?.id ||
    auth.decodeToken()?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    undefined;

  const seedKeyword =
    normalizeArtistField(song.value.ArtistNames || song.value.ArtistName)[0] ||
    "";

  try {
    const res = await recommendationApi.getRelatedSongs(songId.value, {
      limit: 6,
      userId: currentUserId,
    });

    const related = parseItems(res)
      .filter((item) => getSongId(item) && getSongId(item) !== songId.value)
      .slice(0, 6);

    if (related.length > 0) {
      relatedSongs.value = related;
      return;
    }

    const fallbackRes = await musicApi.getSongs({
      keyword: seedKeyword,
      pageIndex: 1,
      pageSize: 12,
    });

    relatedSongs.value = parseItems(fallbackRes)
      .filter((item) => getSongId(item) && getSongId(item) !== songId.value)
      .slice(0, 6);
  } catch {
    try {
      const fallbackRes = await musicApi.getSongs({
        keyword: seedKeyword,
        pageIndex: 1,
        pageSize: 12,
      });

      relatedSongs.value = parseItems(fallbackRes)
        .filter((item) => getSongId(item) && getSongId(item) !== songId.value)
        .slice(0, 6);
    } catch {
      relatedSongs.value = [];
    }
  }
};

const playCurrentSong = () => {
  if (!song.value) return;

  const currentId = getSongId(playerStore.currentTrack);
  if (currentId && currentId === songId.value) {
    playerStore.togglePlay();
    return;
  }

  const queue = [song.value, ...relatedSongs.value];
  playerStore.playTrack(song.value, queue, 0);
};

const queueCurrentSong = () => {
  if (!song.value) return;
  playerStore.addToQueue(song.value);
  toast.add({
    title: t("song.detail_added_to_queue"),
    description: song.value.Title || t("song.detail_fallback_title"),
    color: "green",
  });
};

const goToSong = async (item) => {
  const id = getSongId(item);
  if (!id) return;
  await navigateTo(`/song/${id}`);
};

watch(
  () => route.params.id,
  async () => {
    song.value = null;
    await fetchSong();
  },
);

onMounted(fetchSong);
</script>
