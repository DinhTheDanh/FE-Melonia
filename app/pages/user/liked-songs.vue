<template>
  <div class="min-h-screen pb-8">
    <!-- Spotify-style Liked Songs Header -->
    <div
      class="relative -mx-4 -mt-4 px-8 pt-16 pb-8"
      style="
        background: linear-gradient(
          180deg,
          #5038a0 0%,
          #29185e 60%,
          #121212 100%
        );
      "
    >
      <div class="flex items-end gap-6">
        <!-- Large Heart Icon -->
        <div
          class="w-56 h-56 rounded-md shadow-2xl flex items-center justify-center shrink-0"
          style="background: linear-gradient(135deg, #450af5, #c4efd9)"
        >
          <UIcon name="i-lucide-heart" class="size-20 text-white" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0 pb-2">
          <p class="text-sm font-semibold text-white mb-2">
            {{ t("liked_songs.playlist_label") }}
          </p>
          <h1 class="text-6xl font-black text-white mb-6 leading-tight">
            {{ t("liked_songs.title") }}
          </h1>
          <div class="flex items-center gap-2 text-sm text-neutral-200">
            <UAvatar
              v-if="userData?.Avatar"
              :src="userData?.Avatar"
              :alt="userData?.FullName"
              size="xs"
            />
            <span class="font-semibold hover:underline cursor-pointer">
              {{ userData?.FullName || t("home.unknown_artist") }}
            </span>
            <span class="text-neutral-400">·</span>
            <span>{{ totalCount }} {{ t("liked_songs.songs_count") }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Action Bar -->
    <div
      ref="actionBarRef"
      class="sticky top-0 z-20 flex items-center gap-6 px-8 py-4 transition-colors duration-300"
      :class="isScrolled ? 'bg-[#1a1040]' : 'bg-transparent'"
    >
      <!-- Big Play Button -->
      <button
        class="w-14 h-14 bg-primary-500 hover:bg-primary-400 hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-lg shadow-black/40 cursor-pointer"
        @click="playAllLiked"
      >
        <UIcon name="i-fa6-solid-play" class="size-6 text-white ml-1" />
      </button>

      <!-- Shuffle Button -->
      <UTooltip :text="t('player.shuffle_off')" arrow>
        <button
          class="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          @click="shuffleAllLiked"
        >
          <UIcon name="i-lucide-shuffle" class="size-7" />
        </button>
      </UTooltip>
    </div>

    <!-- Songs Table -->
    <div class="px-4 mt-2">
      <!-- Table Header -->
      <div
        class="grid grid-cols-[40px_1fr_1fr_100px] gap-4 px-4 py-2 border-b border-white/10 text-neutral-400 text-sm"
      >
        <span class="text-center">#</span>
        <span>{{ t("liked_songs.col_title") }}</span>
        <span>{{ t("liked_songs.col_album") }}</span>
        <span class="text-right">
          <UIcon name="i-lucide-clock" class="size-4" />
        </span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 text-neutral-400 animate-spin"
        />
      </div>

      <!-- Song Rows -->
      <div
        v-for="(song, index) in songs"
        :key="song.Id || song.SongId"
        class="group grid grid-cols-[40px_1fr_1fr_100px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors items-center cursor-pointer"
        @click="playSong(song, index)"
      >
        <!-- Index / Play icon -->
        <div class="flex items-center justify-center">
          <span class="text-neutral-400 text-sm group-hover:hidden">
            {{ index + 1 }}
          </span>
          <UIcon
            name="i-fa6-solid-play"
            class="size-3 text-white hidden group-hover:block"
          />
        </div>

        <!-- Title & Artist -->
        <div class="flex items-center gap-3 min-w-0">
          <img
            v-if="song.Thumbnail"
            :src="song.Thumbnail"
            :alt="song.Title"
            class="w-10 h-10 rounded object-cover shrink-0"
          />
          <div
            v-else
            class="w-10 h-10 rounded bg-[#282828] flex items-center justify-center shrink-0"
          >
            <UIcon name="i-lucide-music" class="size-4 text-neutral-500" />
          </div>
          <div class="min-w-0 flex-1">
            <p
              class="text-sm font-medium truncate"
              :class="isCurrentTrack(song) ? 'text-primary-500' : 'text-white'"
            >
              {{ song.Title }}
            </p>
            <p class="text-xs text-neutral-400 truncate">
              {{ song.ArtistNames || t("home.unknown_artist") }}
            </p>
          </div>
        </div>

        <!-- Album -->
        <div class="min-w-0">
          <p
            class="text-sm text-neutral-400 truncate hover:text-white hover:underline cursor-pointer"
          >
            {{ song.AlbumTitle || "-" }}
          </p>
        </div>

        <!-- Duration + Actions -->
        <div class="flex items-center justify-end gap-3">
          <!-- Unlike button -->
          <button
            class="p-1 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary-400"
            @click.stop="handleUnlike(song)"
          >
            <UIcon name="i-lucide-heart" class="size-4 fill-current" />
          </button>
          <span class="text-sm text-neutral-400 tabular-nums">
            {{ formatDuration(song.Duration) }}
          </span>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && songs.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <UIcon name="i-lucide-music" class="size-16 text-neutral-600 mb-4" />
        <h3 class="text-xl font-bold text-white mb-2">
          {{ t("liked_songs.empty_title") }}
        </h3>
        <p class="text-neutral-400">
          {{ t("liked_songs.empty_description") }}
        </p>
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="flex justify-center py-6">
        <button
          class="px-6 py-2 text-sm font-semibold text-white border border-white/20 rounded-full hover:border-white hover:scale-105 transition-all cursor-pointer"
          @click="loadMore"
        >
          {{ t("liked_songs.load_more") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import interactionApi from "~/api/interactionApi";
import userApi from "~/api/userApi";
import { usePlayerStore } from "~/stores/usePlayerStore";
import { useLikedSongsStore } from "~/stores/useLikedSongsStore";

const { t } = useI18n();
const playerStore = usePlayerStore();
const likedSongsStore = useLikedSongsStore();

const songs = ref([]);
const isLoading = ref(true);
const totalCount = ref(0);
const pageIndex = ref(1);
const pageSize = 30;
const userData = ref(null);
const isScrolled = ref(false);
const actionBarRef = ref(null);

const hasMore = computed(
  () => songs.value.length < totalCount.value && !isLoading.value,
);

const isCurrentTrack = (song) => {
  if (!playerStore.currentTrack) return false;
  return (
    playerStore.currentTrack.Id === song.Id ||
    playerStore.currentTrack.Id === song.SongId
  );
};

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const playSong = (song, index) => {
  playerStore.playTrack(song, songs.value, index);
};

const playAllLiked = () => {
  if (songs.value.length > 0) {
    playerStore.playTrack(songs.value[0], songs.value, 0);
  }
};

const shuffleAllLiked = () => {
  if (songs.value.length > 0) {
    playerStore.isShuffle = true;
    const randomIndex = Math.floor(Math.random() * songs.value.length);
    playerStore.playTrack(songs.value[randomIndex], songs.value, randomIndex);
  }
};

const handleUnlike = async (song) => {
  const songId = song.Id || song.SongId;
  const success = await likedSongsStore.toggleLike(songId);
  if (success) {
    songs.value = songs.value.filter((s) => (s.Id || s.SongId) !== songId);
    totalCount.value = Math.max(0, totalCount.value - 1);
  }
};

const fetchLikedSongs = async () => {
  isLoading.value = true;
  try {
    const res = await interactionApi.getLikedSongs({
      pageIndex: pageIndex.value,
      pageSize,
    });
    const data = res.Data || res || [];
    songs.value = pageIndex.value === 1 ? data : [...songs.value, ...data];
    totalCount.value = res.TotalRecords || res.Total || data.length;
  } catch (error) {
    console.error("Error fetching liked songs:", error);
  } finally {
    isLoading.value = false;
  }
};

const loadMore = () => {
  pageIndex.value++;
  fetchLikedSongs();
};

const fetchUserData = async () => {
  try {
    const res = await userApi.getUserInfo();
    userData.value = res;
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

// Scroll detection for sticky bar
const handleScroll = () => {
  const scrollContainer = document.querySelector(".flex-1.overflow-y-auto");
  if (scrollContainer) {
    isScrolled.value = scrollContainer.scrollTop > 300;
  }
};

onMounted(() => {
  fetchLikedSongs();
  fetchUserData();

  nextTick(() => {
    const scrollContainer = document.querySelector(".flex-1.overflow-y-auto");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }
  });
});

onUnmounted(() => {
  const scrollContainer = document.querySelector(".flex-1.overflow-y-auto");
  if (scrollContainer) {
    scrollContainer.removeEventListener("scroll", handleScroll);
  }
});
</script>
