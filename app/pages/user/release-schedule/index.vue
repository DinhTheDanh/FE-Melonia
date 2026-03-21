<template>
  <div class="min-h-screen px-6 py-8">
    <div class="max-w-6xl mx-auto">
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <p class="text-xs uppercase tracking-widest text-neutral-400 mb-2">
            {{ $t("song.release_schedule") }}
          </p>
          <h1 class="text-4xl font-black text-white leading-tight">
            {{ $t("song.release_queue_title") }}
          </h1>
          <p class="text-sm text-neutral-400 mt-2">
            {{ $t("song.release_queue_subtitle") }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/create/song"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-black font-semibold transition-colors"
          >
            <UIcon name="i-lucide-plus" class="size-4" />
            {{ $t("song.upload_now") }}
          </NuxtLink>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
            :disabled="isLoading"
            @click="fetchAllSongs"
          >
            <UIcon name="i-lucide-refresh-cw" class="size-4" />
            {{ $t("song.refresh") }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-wider text-neutral-400 mb-2">
            {{ $t("song.pending_release") }}
          </p>
          <p class="text-3xl font-black text-white">
            {{ pendingSongs.length }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-wider text-neutral-400 mb-2">
            {{ $t("song.upcoming_release") }}
          </p>
          <p class="text-3xl font-black text-primary">
            {{ upcomingSongs.length }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-wider text-neutral-400 mb-2">
            {{ $t("song.total_records") }}
          </p>
          <p class="text-3xl font-black text-white">{{ songs.length }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 mb-5">
        <button
          class="px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors"
          :class="
            activeTab === 'pending'
              ? 'bg-primary text-black'
              : 'bg-white/10 text-neutral-300 hover:text-white'
          "
          @click="activeTab = 'pending'"
        >
          {{ $t("song.pending_release") }}
        </button>
        <button
          class="px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors"
          :class="
            activeTab === 'upcoming'
              ? 'bg-primary text-black'
              : 'bg-white/10 text-neutral-300 hover:text-white'
          "
          @click="activeTab = 'upcoming'"
        >
          {{ $t("song.upcoming_release") }}
        </button>
      </div>

      <div v-if="isLoading" class="space-y-2">
        <div
          v-for="i in 6"
          :key="i"
          class="h-16 rounded-lg bg-white/5 border border-white/5 animate-pulse"
        ></div>
      </div>

      <div
        v-else-if="filteredSongs.length === 0"
        class="rounded-xl border border-white/10 bg-white/5 p-8 text-center"
      >
        <UIcon
          name="i-lucide-calendar-search"
          class="size-10 mx-auto text-neutral-500 mb-3"
        />
        <p class="text-white font-semibold mb-1">
          {{ $t("song.no_release_queue") }}
        </p>
        <p class="text-sm text-neutral-400 mb-4">
          {{ $t("song.no_release_queue_help") }}
        </p>
        <NuxtLink
          to="/user/my-music"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white"
        >
          <UIcon name="i-lucide-music" class="size-4" />
          {{ $t("song.my_music") }}
        </NuxtLink>
      </div>

      <div v-else class="rounded-xl border border-white/10 overflow-hidden">
        <div
          class="grid grid-cols-[1fr_180px_120px_140px] gap-3 px-4 py-3 text-xs uppercase tracking-wider text-neutral-400 bg-[#1a1a1a] border-b border-white/10"
        >
          <div>{{ $t("song.song_title") }}</div>
          <div>{{ $t("song.schedule_release_time") }}</div>
          <div>{{ $t("song.status") }}</div>
          <div>{{ $t("song.time_remaining") }}</div>
        </div>

        <div class="divide-y divide-white/6">
          <div
            v-for="song in filteredSongs"
            :key="song.id"
            class="grid grid-cols-[1fr_180px_120px_140px] gap-3 px-4 py-3 items-center hover:bg-white/5 transition-colors"
          >
            <div class="min-w-0">
              <p class="text-white font-medium truncate">{{ song.title }}</p>
              <p class="text-xs text-neutral-400 truncate">{{ song.artist }}</p>
            </div>
            <div class="text-sm text-neutral-200">
              {{ formatDateTime(song.scheduleAt) }}
            </div>
            <div>
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="
                  song.status === 'upcoming'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-white/10 text-neutral-300'
                "
              >
                {{
                  song.status === "upcoming"
                    ? $t("song.upcoming_release")
                    : $t("song.pending_release")
                }}
              </span>
            </div>
            <div class="text-sm text-neutral-300">
              {{ getCountdown(song.scheduleAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import musicApi from "~/api/musicApi";

const { t } = useI18n();
const toast = useToast();
const { user } = useAuth();

const songs = ref([]);
const isLoading = ref(false);
const activeTab = ref("pending");

const canUseSchedule = computed(() => {
  const role = String(user.value?.role || "");
  const normalizedRole = role.toLowerCase();
  return normalizedRole === "artistpremium" || normalizedRole === "admin";
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

const getSongId = (song) => {
  return String(song?.SongId || song?.Id || song?.songId || "").trim();
};

const extractScheduleAt = (song) => {
  const value =
    song?.ScheduledReleaseAt ||
    song?.ScheduledAt ||
    song?.ReleaseAt ||
    song?.PublishAt ||
    null;

  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const normalizeSong = (song) => {
  const scheduleAt = extractScheduleAt(song);
  const statusRaw = String(
    song?.ReleaseStatus || song?.Status || "",
  ).toLowerCase();
  const status = statusRaw === "upcoming" ? "upcoming" : "pending";

  return {
    id: getSongId(song),
    title: song?.Title || "Untitled",
    artist: song?.ArtistNames || song?.ArtistName || "-",
    scheduleAt,
    status,
  };
};

const fetchAllSongs = async () => {
  isLoading.value = true;
  try {
    const pageSize = 100;
    let pageIndex = 1;
    let totalPages = 1;
    const merged = [];

    do {
      const res = await musicApi.getMyScheduledSongs({
        status: "all",
        pageIndex,
        pageSize,
      });
      const items = parseItems(res);
      merged.push(...items);
      totalPages = parseTotalPages(res);
      pageIndex += 1;
    } while (pageIndex <= totalPages && pageIndex <= 20);

    const dedupedMap = new Map();
    merged.forEach((song) => {
      const id = getSongId(song);
      if (!id) return;
      dedupedMap.set(id, song);
    });

    songs.value = [...dedupedMap.values()].map(normalizeSong);
  } catch (error) {
    console.error("Error fetching release queue:", error);
    toast.add({
      title: t("song.error_title"),
      description: t("song.error_message"),
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const pendingSongs = computed(() => {
  return songs.value.filter((song) => song.status === "pending");
});

const upcomingSongs = computed(() => {
  return songs.value
    .filter((song) => song.status === "upcoming" && song.scheduleAt)
    .sort(
      (a, b) =>
        new Date(a.scheduleAt).getTime() - new Date(b.scheduleAt).getTime(),
    );
});

const filteredSongs = computed(() => {
  return activeTab.value === "upcoming"
    ? upcomingSongs.value
    : pendingSongs.value;
});

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCountdown = (value) => {
  if (!value) return "-";
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return t("song.ready_for_publish");

  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

onMounted(async () => {
  if (!canUseSchedule.value) {
    await navigateTo("/");
    return;
  }

  await fetchAllSongs();
});
</script>
