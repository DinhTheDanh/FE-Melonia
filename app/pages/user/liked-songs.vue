<template>
  <div class="min-h-screen pb-8">
    <!-- Sticky Header (appears when scrolled past cover) -->
    <div
      v-show="showStickyHeader"
      class="sticky top-0 z-30 px-6 py-3 flex items-center gap-4 transition-all duration-300"
      style="background-color: #1e1344"
    >
      <button
        class="w-12 h-12 bg-primary-500 hover:bg-primary-400 hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-lg shadow-black/40 cursor-pointer"
        @click="togglePlayAllLiked"
      >
        <UIcon
          v-if="isPlayingLikedSongs"
          name="i-fa6-solid-pause"
          class="size-5 text-white"
        />
        <UIcon
          v-else
          name="i-fa6-solid-play"
          class="size-5 text-white ml-0.5"
        />
      </button>
      <h2 class="text-2xl font-bold text-white truncate">
        {{ t("liked_songs.title") }}
      </h2>
    </div>

    <!-- Spotify-style Liked Songs Header -->
    <div
      ref="headerRef"
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
            <NuxtLink
              to="/user/profile"
              class="font-semibold hover:underline cursor-pointer"
            >
              {{ userData?.FullName || t("home.unknown_artist") }}
            </NuxtLink>
            <span class="text-neutral-400">·</span>
            <span>{{ totalCount }} {{ t("liked_songs.songs_count") }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sentinel for sticky header detection -->
    <div ref="headerSentinel" class="h-px w-full"></div>

    <!-- Action Bar -->
    <div ref="actionBarRef" class="flex items-center gap-6 px-8 py-4">
      <!-- Big Play Button -->
      <button
        class="w-14 h-14 bg-primary-500 hover:bg-primary-400 hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-lg shadow-black/40 cursor-pointer"
        @click="togglePlayAllLiked"
      >
        <UIcon
          v-if="isPlayingLikedSongs"
          name="i-fa6-solid-pause"
          class="size-6 text-white"
        />
        <UIcon v-else name="i-fa6-solid-play" class="size-6 text-white ml-1" />
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
        :class="{
          'bg-white/5': likedDragOverIdx === index,
          'opacity-50': likedDragIdx === index,
        }"
        draggable="true"
        @dragstart="onLikedDragStart($event, index)"
        @dragover.prevent
        @dragenter.prevent="likedDragOverIdx = index"
        @dragleave="likedDragOverIdx = null"
        @drop.prevent="onLikedDrop($event, index)"
        @dragend="onLikedDragEnd"
        @click="playSong(song, index)"
      >
        <!-- Index / Play / Pause / Equalizer -->
        <div class="flex items-center justify-center w-5 h-5">
          <!-- When not hovering -->
          <template v-if="isCurrentTrack(song)">
            <!-- Currently playing track: show equalizer or paused bars -->
            <div
              class="equalizer group-hover:hidden!"
              :class="{ paused: !playerStore.isPlaying }"
            >
              <span class="equalizer-bar"></span>
              <span class="equalizer-bar"></span>
              <span class="equalizer-bar"></span>
              <span class="equalizer-bar"></span>
            </div>
          </template>
          <template v-else>
            <!-- Not current track: show index -->
            <span class="text-neutral-400 text-sm group-hover:hidden">
              {{ index + 1 }}
            </span>
          </template>

          <!-- When hovering: show play/pause button -->
          <button
            class="hidden group-hover:flex items-center justify-center"
            @click.stop="togglePlaySong(song, index)"
          >
            <UIcon
              v-if="isCurrentTrack(song) && playerStore.isPlaying"
              name="i-fa6-solid-pause"
              class="size-4 text-white"
            />
            <UIcon v-else name="i-fa6-solid-play" class="size-4 text-white" />
          </button>
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
              {{
                song.ArtistNames?.trim() ||
                song.ArtistName?.trim() ||
                t("home.unknown_artist")
              }}
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

        <!-- Plays -->
        <div v-if="song.ListenCount" class="hidden md:flex items-center gap-1 text-xs text-neutral-500">
          <UIcon name="i-lucide-headphones" class="size-3" />
          {{ formatNumber(song.ListenCount) }}
        </div>

        <!-- Duration + Actions -->
        <div class="flex items-center justify-end gap-2">
          <!-- Context Menu -->
          <SongContextMenu
            :song="song"
            :show-like-option="false"
            :show-go-to-album="!!song.AlbumId"
            @unlike="handleUnlike"
          />
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
import { formatNumber } from "~/utils/formatNumber";

const { t } = useI18n();
const playerStore = usePlayerStore();
const likedSongsStore = useLikedSongsStore();

const songs = ref([]);
const isLoading = ref(true);
const totalCount = ref(0);
const pageIndex = ref(1);
const pageSize = 30;
const userData = ref(null);
const actionBarRef = ref(null);
const headerRef = ref(null);

// Sticky header via composable
const { showStickyHeader, headerSentinel } = useStickyHeader();

// Drag & drop
const likedDragIdx = ref(null);
const likedDragOverIdx = ref(null);

const onLikedDragStart = (e, index) => {
  likedDragIdx.value = index;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", index.toString());
};

const onLikedDrop = (e, toIndex) => {
  const fromIndex = likedDragIdx.value;
  if (fromIndex !== null && fromIndex !== toIndex) {
    const [item] = songs.value.splice(fromIndex, 1);
    songs.value.splice(toIndex, 0, item);
  }
  likedDragIdx.value = null;
  likedDragOverIdx.value = null;
};

const onLikedDragEnd = () => {
  likedDragIdx.value = null;
  likedDragOverIdx.value = null;
};

const hasMore = computed(
  () => songs.value.length < totalCount.value && !isLoading.value,
);

// Check if currently playing a song from liked songs
const isPlayingLikedSongs = computed(() => {
  if (!playerStore.currentTrack || !playerStore.isPlaying) return false;
  const currentId =
    playerStore.currentTrack.Id || playerStore.currentTrack.SongId;
  return songs.value.some((s) => (s.Id || s.SongId) === currentId);
});

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

const togglePlaySong = (song, index) => {
  if (isCurrentTrack(song)) {
    // Toggle play/pause for current track
    playerStore.togglePlay();
  } else {
    // Play this song
    playerStore.playTrack(song, songs.value, index);
  }
};

const playAllLiked = () => {
  if (songs.value.length > 0) {
    playerStore.playTrack(songs.value[0], songs.value, 0);
  }
};

const togglePlayAllLiked = () => {
  if (isPlayingLikedSongs.value) {
    playerStore.togglePlay();
  } else {
    playAllLiked();
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

// Intersection Observer for sticky header
onMounted(() => {
  fetchLikedSongs();
  fetchUserData();

  // Also fetch store to sync liked status
  if (!likedSongsStore.isLoaded) {
    likedSongsStore.fetchLikedSongs();
  }
});

// Watch for changes in likedSongsStore (when user likes/unlikes from other pages)
watch(
  () => likedSongsStore.likedSongs,
  (newLikedSongs) => {
    if (isLoading.value) return;

    // Sync local songs list from store data
    const storeIds = new Set(
      (newLikedSongs || []).map((s) => s.Id || s.SongId).filter(Boolean),
    );

    // Remove unliked songs from local list
    const currentIds = new Set(
      songs.value.map((s) => s.Id || s.SongId).filter(Boolean),
    );

    // Filter out songs no longer liked
    songs.value = songs.value.filter((s) => storeIds.has(s.Id || s.SongId));

    // Add newly liked songs that aren't in our local list yet
    const newSongs = (newLikedSongs || []).filter(
      (s) => !currentIds.has(s.Id || s.SongId),
    );
    if (newSongs.length > 0) {
      songs.value = [...newSongs, ...songs.value];
    }

    totalCount.value = likedSongsStore.totalCount;
  },
  { deep: true },
);
</script>
