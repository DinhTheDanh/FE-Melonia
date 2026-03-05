<template>
  <!-- Music Player Footer - Spotify Style -->
  <div
    class="fixed bottom-0 left-0 right-0 h-[90px] bg-black z-50 border-t border-white/5 select-none"
  >
    <div class="h-full grid grid-cols-3 items-center px-4">
      <!-- Left: Now Playing Info -->
      <div class="flex items-center gap-3 min-w-0">
        <template v-if="playerStore.currentTrack">
          <!-- Album Art -->
          <UTooltip
            :text="t('player.expand')"
            arrow
            :ui="{ content: 'bg-[#282828]' }"
          >
            <div
              class="relative w-14 h-14 rounded overflow-hidden shrink-0 group cursor-pointer"
              @click="playerStore.toggleExpanded"
            >
              <img
                v-if="playerStore.currentTrack.Thumbnail"
                :src="playerStore.currentTrack.Thumbnail"
                :alt="playerStore.currentTrack.Title"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-[#282828] flex items-center justify-center"
              >
                <UIcon name="i-lucide-music" class="size-6 text-neutral-500" />
              </div>
              <!-- Expand icon on hover -->
              <div
                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <UIcon name="i-lucide-chevron-up" class="size-5 text-white" />
              </div>
            </div>
          </UTooltip>

          <!-- Track Info -->
          <div class="min-w-0">
            <p
              class="text-sm text-white font-medium truncate hover:underline cursor-pointer"
            >
              {{ playerStore.currentTrack.Title }}
            </p>
            <p
              class="text-xs text-neutral-400 truncate hover:text-white hover:underline cursor-pointer"
            >
              {{
                playerStore.currentTrack.ArtistNames?.trim() ||
                playerStore.currentTrack.ArtistName?.trim() ||
                t("home.unknown_artist")
              }}
            </p>
          </div>

          <!-- Like / Add to playlist Button  -->
          <UTooltip
            :text="
              currentTrackLiked
                ? t('player.added_to_library')
                : t('player.like')
            "
            arrow
            :ui="{ content: 'bg-[#282828]' }"
          >
            <button
              ref="likeButtonRef"
              class="shrink-0 cursor-pointer transition-all"
              @click="handleLikeClick"
            >
              <!-- Liked state: green filled circle with white check -->
              <span
                v-if="currentTrackLiked"
                class="flex items-center justify-center w-5 h-5 rounded-full bg-primary hover:scale-110 transition-all"
              >
                <UIcon name="i-lucide-check" class="size-3.5 text-black" />
              </span>
              <!-- Not liked state: subtle plus circle -->
              <span
                v-else
                class="flex items-center justify-center text-neutral-400 hover:text-white hover:scale-110 transition-all"
              >
                <UIcon name="i-lucide-plus-circle" class="size-5" />
              </span>
            </button>
          </UTooltip>
        </template>

        <!-- Empty State -->
        <template v-else>
          <div class="w-14 h-14 rounded bg-[#282828]"></div>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-neutral-500">-</p>
            <p class="text-xs text-neutral-600">-</p>
          </div>
        </template>
      </div>

      <!-- Center: Playback Controls -->
      <div class="flex flex-col items-center gap-1">
        <!-- Control Buttons -->
        <div class="flex items-center gap-4">
          <!-- Shuffle -->
          <UTooltip
            :text="
              playerStore.isShuffle
                ? t('player.shuffle_on')
                : t('player.shuffle_off')
            "
            arrow
            :ui="{ content: 'bg-[#282828]' }"
          >
            <button
              class="p-1.5 transition-colors cursor-pointer relative"
              :class="
                playerStore.isShuffle
                  ? 'text-purple-500'
                  : 'text-neutral-400 hover:text-white'
              "
              @click="playerStore.toggleShuffle"
            >
              <UIcon name="i-lucide-shuffle" class="size-4" />
              <!-- Active dot indicator -->
              <span
                v-if="playerStore.isShuffle"
                class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500"
              ></span>
            </button>
          </UTooltip>

          <!-- Previous -->
          <UTooltip
            :text="t('player.previous')"
            arrow
            :ui="{ content: 'bg-[#282828]' }"
          >
            <button
              class="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              @click="playerStore.previousTrack"
            >
              <UIcon name="i-lucide-skip-back" class="size-5" />
            </button>
          </UTooltip>

          <!-- Play/Pause -->
          <UTooltip
            :text="playerStore.isPlaying ? t('player.pause') : t('player.play')"
            arrow
            :ui="{ content: 'bg-[#282828]' }"
          >
            <button
              class="w-9 h-9 bg-white hover:scale-105 rounded-full flex items-center justify-center transition-transform cursor-pointer"
              @click="handlePlayPause"
            >
              <UIcon
                v-if="playerStore.isLoading"
                name="i-lucide-loader-2"
                class="size-5 text-black animate-spin"
              />
              <UIcon
                v-else-if="playerStore.isPlaying"
                name="i-fa6-solid-pause"
                class="size-4 text-black"
              />
              <UIcon
                v-else
                name="i-fa6-solid-play"
                class="size-4 text-black ml-0.5"
              />
            </button>
          </UTooltip>

          <!-- Next -->
          <UTooltip
            :text="t('player.next')"
            arrow
            :ui="{ content: 'bg-[#282828]' }"
          >
            <button
              class="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              @click="playerStore.nextTrack"
            >
              <UIcon name="i-lucide-skip-forward" class="size-5" />
            </button>
          </UTooltip>

          <!-- Repeat -->
          <UTooltip
            :text="repeatTooltip"
            arrow
            :ui="{ content: 'bg-[#282828]' }"
          >
            <button
              class="p-1.5 transition-colors cursor-pointer relative"
              :class="
                playerStore.repeatMode !== 'off'
                  ? 'text-purple-500'
                  : 'text-neutral-400 hover:text-white'
              "
              @click="playerStore.cycleRepeatMode"
            >
              <UIcon
                :name="
                  playerStore.repeatMode === 'one'
                    ? 'i-lucide-repeat-1'
                    : 'i-lucide-repeat'
                "
                class="size-4"
              />
              <!-- Active dot indicator -->
              <span
                v-if="playerStore.repeatMode !== 'off'"
                class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500"
              ></span>
            </button>
          </UTooltip>
        </div>

        <!-- Progress Bar -->
        <div class="flex items-center gap-2 w-full max-w-[600px]">
          <span class="text-xs text-neutral-400 w-10 text-right tabular-nums">
            {{ formatTime(playerStore.currentTime) }}
          </span>

          <!-- Progress Slider -->
          <div
            ref="progressRef"
            class="progress-container flex-1 group relative h-3 flex items-center cursor-pointer"
            @click="handleProgressClick"
            @mousedown="startProgressDrag"
          >
            <!-- Track Background -->
            <div class="w-full h-1 bg-[#4D4D4D] rounded-full relative">
              <!-- Progress Fill -->
              <div
                class="h-full bg-white group-hover:bg-purple-500 transition-colors rounded-full"
                :style="{ width: `${playerStore.progress}%` }"
              ></div>
              <!-- Thumb - Spotify style circle -->
              <div
                class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                :class="{ 'opacity-100': isDraggingProgress }"
                :style="{ left: `calc(${playerStore.progress}% - 6px)` }"
              ></div>
            </div>
          </div>

          <span class="text-xs text-neutral-400 w-10 tabular-nums">
            {{ formatTime(playerStore.duration) }}
          </span>
        </div>
      </div>

      <!-- Right: Volume & Extra Controls -->
      <div class="flex items-center justify-end gap-3">
        <!-- Now Playing View (Queue) -->
        <UTooltip
          :text="t('player.queue')"
          arrow
          :ui="{ content: 'bg-[#282828]' }"
        >
          <button
            class="p-1.5 transition-colors cursor-pointer"
            :class="
              showQueue
                ? 'text-purple-500'
                : 'text-neutral-400 hover:text-white'
            "
            @click="showQueue = !showQueue"
          >
            <UIcon name="i-lucide-list-music" class="size-4" />
          </button>
        </UTooltip>

        <!-- Volume Control -->
        <div class="flex items-center gap-1 group/volume">
          <UTooltip
            :text="playerStore.isMuted ? t('player.unmute') : t('player.mute')"
            arrow
            :ui="{ content: 'bg-[#282828]' }"
          >
            <button
              class="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              @click="playerStore.toggleMute"
            >
              <UIcon :name="volumeIcon" class="size-4" />
            </button>
          </UTooltip>

          <!-- Volume Slider -->
          <div
            ref="volumeRef"
            class="volume-container w-24 h-3 flex items-center cursor-pointer"
            @click="handleVolumeClick"
            @mousedown="startVolumeDrag"
          >
            <div class="w-full h-1 bg-[#4D4D4D] rounded-full relative">
              <div
                class="h-full bg-white group-hover/volume:bg-purple-500 transition-colors rounded-full"
                :style="{ width: `${playerStore.volumePercent}%` }"
              ></div>
              <!-- Thumb - Spotify style circle -->
              <div
                class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/volume:opacity-100 transition-opacity pointer-events-none"
                :class="{ 'opacity-100': isDraggingVolume }"
                :style="{ left: `calc(${playerStore.volumePercent}% - 6px)` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Fullscreen / Mini Player -->
        <UTooltip
          :text="t('player.fullscreen')"
          arrow
          :ui="{ content: 'bg-[#282828]' }"
        >
          <button
            class="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            @click="playerStore.toggleExpanded"
          >
            <UIcon name="i-lucide-maximize-2" class="size-4" />
          </button>
        </UTooltip>
      </div>
    </div>

    <!-- Hidden Audio Element -->
    <audio
      ref="audioRef"
      :src="audioSrc"
      preload="auto"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @playing="onPlaying"
      @pause="onPause"
      @waiting="onWaiting"
      @canplay="onCanPlay"
      @error="onError"
    ></audio>

    <!-- Add to Playlist Popover -->
    <AddToPlaylistModal
      v-if="showAddToPlaylist && playerStore.currentTrack"
      :song-id="playerStore.currentTrack.Id || playerStore.currentTrack.SongId"
      :song-title="playerStore.currentTrack.Title"
      :trigger-rect="likeButtonRect"
      @close="showAddToPlaylist = false"
    />

    <!-- Queue Panel (Spotify-style slide-up) -->
    <Transition name="queue-slide">
      <div
        v-if="showQueue"
        class="fixed right-2 bottom-24 w-95 max-h-[calc(100vh-180px)] bg-[#282828] rounded-lg shadow-2xl z-60 flex flex-col overflow-hidden"
      >
        <!-- Queue Header -->
        <div class="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 class="text-base font-bold text-white">
            {{ t("player.queue") }}
          </h3>
          <button
            class="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            @click="showQueue = false"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </div>

        <!-- Now Playing -->
        <div v-if="playerStore.currentTrack" class="px-3 pb-2">
          <p class="text-xs font-bold text-white px-2 mb-1">
            {{ t("player.now_playing") }}
          </p>
          <div class="flex items-center gap-3 px-2 py-2 rounded-md bg-white/5">
            <img
              v-if="playerStore.currentTrack.Thumbnail"
              :src="playerStore.currentTrack.Thumbnail"
              class="w-10 h-10 rounded object-cover shrink-0"
            />
            <div
              v-else
              class="w-10 h-10 rounded bg-[#3E3E3E] flex items-center justify-center shrink-0"
            >
              <UIcon name="i-lucide-music" class="size-4 text-neutral-500" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-white truncate">
                {{ playerStore.currentTrack.Title }}
              </p>
              <p class="text-xs text-neutral-400 truncate">
                {{
                  playerStore.currentTrack.ArtistNames?.trim() ||
                  playerStore.currentTrack.ArtistName?.trim() ||
                  t("home.unknown_artist")
                }}
              </p>
            </div>
            <div class="flex items-center">
              <div class="flex gap-0.5">
                <span
                  v-for="i in 3"
                  :key="i"
                  class="w-0.5 bg-purple-500 rounded-full animate-pulse"
                  :style="{
                    height: `${8 + Math.random() * 8}px`,
                    animationDelay: `${i * 0.15}s`,
                  }"
                ></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Up -->
        <div v-if="upcomingTracks.length > 0" class="px-3 pt-1 pb-1">
          <div class="flex items-center justify-between px-2 mb-1">
            <p class="text-xs font-bold text-white">
              {{ t("player.next_up") }}
            </p>
            <button
              v-if="upcomingTracks.length > 1"
              class="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              @click="playerStore.clearQueue()"
            >
              {{ t("player.clear_queue") }}
            </button>
          </div>
        </div>

        <!-- Queue List (drag & drop) -->
        <div class="flex-1 overflow-y-auto px-3 pb-3" ref="queueListRef">
          <div
            v-for="(track, idx) in upcomingTracks"
            :key="`${track.Id || track.SongId}-${idx}`"
            class="group flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            :class="{
              'bg-white/5': dragOverIndex === getQueueRealIndex(idx),
              'opacity-50': dragIndex === getQueueRealIndex(idx),
            }"
            draggable="true"
            @dragstart="onDragStart($event, getQueueRealIndex(idx))"
            @dragover.prevent="onDragOver($event, getQueueRealIndex(idx))"
            @dragenter.prevent="onDragEnter(getQueueRealIndex(idx))"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop($event, getQueueRealIndex(idx))"
            @dragend="onDragEnd"
            @click="playerStore.playFromQueue(getQueueRealIndex(idx))"
          >
            <!-- Drag Handle -->
            <div
              class="text-neutral-600 group-hover:text-neutral-400 cursor-grab active:cursor-grabbing shrink-0"
            >
              <UIcon name="i-lucide-grip-vertical" class="size-4" />
            </div>

            <!-- Thumbnail -->
            <img
              v-if="track.Thumbnail"
              :src="track.Thumbnail"
              class="w-10 h-10 rounded object-cover shrink-0"
            />
            <div
              v-else
              class="w-10 h-10 rounded bg-[#3E3E3E] flex items-center justify-center shrink-0"
            >
              <UIcon name="i-lucide-music" class="size-4 text-neutral-500" />
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-white truncate">
                {{ track.Title }}
              </p>
              <p class="text-xs text-neutral-400 truncate">
                {{
                  track.ArtistNames?.trim() ||
                  track.ArtistName?.trim() ||
                  t("home.unknown_artist")
                }}
              </p>
            </div>

            <!-- Remove button -->
            <button
              class="p-1 text-neutral-500 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer shrink-0"
              @click.stop="playerStore.removeFromQueue(getQueueRealIndex(idx))"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </div>

          <!-- Empty queue -->
          <div
            v-if="upcomingTracks.length === 0"
            class="flex flex-col items-center justify-center py-10 text-center"
          >
            <UIcon
              name="i-lucide-list-music"
              class="size-10 text-neutral-600 mb-3"
            />
            <p class="text-sm text-neutral-400">
              {{ t("player.queue_empty") }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { usePlayerStore } from "~/stores/usePlayerStore";
import { useLikedSongsStore } from "~/stores/useLikedSongsStore";

const playerStore = usePlayerStore();
const likedSongsStore = useLikedSongsStore();
const { t } = useI18n();
const audioRef = ref(null);
const progressRef = ref(null);
const volumeRef = ref(null);

// Drag states
const isDraggingProgress = ref(false);
const isDraggingVolume = ref(false);

// Add to playlist popup
const showAddToPlaylist = ref(false);
const likeButtonRef = ref(null);
const likeButtonRect = ref(null);

// Queue panel
const showQueue = ref(false);
const queueListRef = ref(null);

// Drag & drop for queue
const dragIndex = ref(null);
const dragOverIndex = ref(null);

// Upcoming tracks (everything after current)
const upcomingTracks = computed(() => {
  if (
    !playerStore.queue.length ||
    playerStore.queueIndex >= playerStore.queue.length - 1
  )
    return [];
  return playerStore.queue.slice(playerStore.queueIndex + 1);
});

// Get the real queue index from the upcoming list index
const getQueueRealIndex = (upcomingIdx) => {
  return playerStore.queueIndex + 1 + upcomingIdx;
};

// Drag & drop handlers
const onDragStart = (e, index) => {
  dragIndex.value = index;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", index.toString());
};

const onDragOver = (e, index) => {
  e.dataTransfer.dropEffect = "move";
};

const onDragEnter = (index) => {
  dragOverIndex.value = index;
};

const onDragLeave = () => {
  // Don't clear immediately, let dragenter of next element handle it
};

const onDrop = (e, toIndex) => {
  const fromIndex = dragIndex.value;
  if (fromIndex !== null && fromIndex !== toIndex) {
    playerStore.moveInQueue(fromIndex, toIndex);
  }
  dragIndex.value = null;
  dragOverIndex.value = null;
};

const onDragEnd = () => {
  dragIndex.value = null;
  dragOverIndex.value = null;
};

// Track if we've initialized from restored state
const hasInitialized = ref(false);
// Track if audio is ready to play after restore
const audioReady = ref(false);
// Flag to prevent competing play/load calls
const isLoadingAudio = ref(false);

// Check if current track is liked
const currentTrackLiked = computed(() => {
  if (!playerStore.currentTrack) return false;
  const songId = playerStore.currentTrack.Id || playerStore.currentTrack.SongId;
  return likedSongsStore.isLiked(songId);
});

// Handle like/+ button click
const handleLikeClick = async () => {
  if (!playerStore.currentTrack) return;
  const songId = playerStore.currentTrack.Id || playerStore.currentTrack.SongId;

  if (currentTrackLiked.value) {
    // Already liked → show add to playlist popover above button
    if (likeButtonRef.value) {
      likeButtonRect.value = likeButtonRef.value.getBoundingClientRect();
    }
    showAddToPlaylist.value = true;
  } else {
    // Not liked → toggle like (add to library)
    await likedSongsStore.toggleLike(songId);
  }
};

// Compute audio source URL - check all possible field names
const audioSrc = computed(() => {
  const track = playerStore.currentTrack;
  if (!track) return null;

  // Try different field names that API might return
  return (
    track.FileUrl ||
    track.FilePath ||
    track.AudioUrl ||
    track.Url ||
    track.AudioPath ||
    track.audioUrl ||
    track.url ||
    track.filePath ||
    track.fileUrl
  );
});

// Repeat mode tooltip
const repeatTooltip = computed(() => {
  switch (playerStore.repeatMode) {
    case "off":
      return t("player.repeat_off");
    case "all":
      return t("player.repeat_all");
    case "one":
      return t("player.repeat_one");
    default:
      return t("player.repeat_off");
  }
});

// Volume icon based on state
const volumeIcon = computed(() => {
  if (playerStore.isMuted || playerStore.volume === 0) {
    return "i-lucide-volume-x";
  } else if (playerStore.volume < 0.3) {
    return "i-lucide-volume";
  } else if (playerStore.volume < 0.7) {
    return "i-lucide-volume-1";
  } else {
    return "i-lucide-volume-2";
  }
});

// Format time in mm:ss
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Handle play/pause - simply toggle the store state, let the watcher handle audio
const handlePlayPause = () => {
  if (!playerStore.currentTrack) return;
  playerStore.togglePlay();
};

// Helper: safely load and play audio without race conditions
const safeLoadAndPlay = (src, seekTo = 0) => {
  if (!audioRef.value || !src) return;

  isLoadingAudio.value = true;
  playerStore.setLoading(true);

  // Set src and load
  audioRef.value.src = src;
  audioRef.value.load();

  const onReady = () => {
    if (!audioRef.value) return;
    isLoadingAudio.value = false;
    playerStore.setLoading(false);

    // Seek if needed
    if (seekTo > 0) {
      audioRef.value.currentTime = seekTo;
    }

    // Play if store says we should be playing
    if (playerStore.isPlaying) {
      audioRef.value.play().catch((err) => {
        playerStore.pause();
      });
    }
  };

  audioRef.value.addEventListener("canplay", onReady, { once: true });

  // Timeout fallback
  setTimeout(() => {
    if (isLoadingAudio.value) {
      isLoadingAudio.value = false;
      playerStore.setLoading(false);
    }
  }, 10000);
};

// Initialize player from restored state (after page refresh)
onMounted(async () => {
  // Wait for next tick to ensure Pinia has hydrated from localStorage
  await nextTick();

  // Load liked songs if not yet loaded
  if (!likedSongsStore.isLoaded) {
    likedSongsStore.fetchLikedSongs();
  }

  if (audioRef.value && playerStore.currentTrack && !hasInitialized.value) {
    hasInitialized.value = true;

    // Set volume
    audioRef.value.volume = playerStore.volume;
    audioRef.value.muted = playerStore.isMuted;

    // Ensure isPlaying is false on restore (user must click play)
    playerStore.pause();

    // Pre-load the audio source so it's ready when user clicks play
    if (audioSrc.value) {
      safeLoadAndPlay(audioSrc.value, playerStore.currentTime);
    }
  }
});

// Audio element event handlers
const onLoadedMetadata = () => {
  if (audioRef.value) {
    playerStore.updateDuration(audioRef.value.duration);
  }
};

const onTimeUpdate = () => {
  if (audioRef.value && !isDraggingProgress.value) {
    playerStore.updateTime(audioRef.value.currentTime);
  }
};

const onEnded = () => {
  playerStore.onTrackEnd();
};

const onPlaying = () => {
  playerStore.setLoading(false);
};

const onPause = () => {};

const onWaiting = () => {
  playerStore.setLoading(true);
};

const onCanPlay = () => {
  if (!isLoadingAudio.value) {
    playerStore.setLoading(false);
  }
};

const onError = (e) => {
  playerStore.setLoading(false);
};

watch(
  () => playerStore.isPlaying,
  (isPlaying) => {
    if (!audioRef.value || !audioSrc.value) return;
    if (isLoadingAudio.value) return;

    if (isPlaying) {
      if (audioRef.value.readyState >= 2) {
        audioRef.value.play().catch((err) => {
          playerStore.pause();
        });
      } else {
        safeLoadAndPlay(audioSrc.value, playerStore.currentTime);
      }
    } else {
      audioRef.value.pause();
    }
  },
);

// Watch for volume changes
watch(
  () => playerStore.volume,
  (volume) => {
    if (audioRef.value) {
      audioRef.value.volume = volume;
    }
  },
);

// Watch for mute changes
watch(
  () => playerStore.isMuted,
  (isMuted) => {
    if (audioRef.value) {
      audioRef.value.muted = isMuted;
    }
  },
);

// Watch for seek changes
watch(
  () => playerStore.currentTime,
  (time) => {
    if (audioRef.value && Math.abs(audioRef.value.currentTime - time) > 1) {
      audioRef.value.currentTime = time;
    }
  },
);

// Watch for track changes (including auto-next) - SINGLE source of truth for loading new tracks
watch(
  () => playerStore.currentTrack,
  async (newTrack, oldTrack) => {
    if (!audioRef.value || !newTrack) return;

    // Skip initial mount (handled by onMounted)
    if (!oldTrack && hasInitialized.value) return;

    // Repeat one: just restart
    if (
      oldTrack &&
      (newTrack.Id || newTrack.SongId) === (oldTrack.Id || oldTrack.SongId) &&
      playerStore.repeatMode === "one"
    ) {
      audioRef.value.currentTime = 0;
      if (playerStore.isPlaying) {
        audioRef.value.play().catch(() => {});
      }
      return;
    }

    // Reset time
    playerStore.updateTime(0);
    playerStore.updateDuration(newTrack.Duration || 0);

    // Wait for next tick so audioSrc computed updates
    await nextTick();

    if (audioSrc.value) {
      safeLoadAndPlay(audioSrc.value, 0);
    }
  },
);

// Progress bar drag handling
const handleProgressClick = (e) => {
  if (!playerStore.hasTrack) return;
  const rect =
    progressRef.value?.getBoundingClientRect() ||
    e.currentTarget.getBoundingClientRect();
  const percent = ((e.clientX - rect.left) / rect.width) * 100;
  playerStore.seek(Math.max(0, Math.min(100, percent)));

  // Also update audio element directly for immediate feedback
  if (audioRef.value && playerStore.duration) {
    audioRef.value.currentTime = (percent / 100) * playerStore.duration;
  }
};

const startProgressDrag = (e) => {
  if (!playerStore.hasTrack) return;
  isDraggingProgress.value = true;
  handleProgressClick(e);

  const onMove = (moveEvent) => {
    if (progressRef.value) {
      const rect = progressRef.value.getBoundingClientRect();
      const percent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const clampedPercent = Math.max(0, Math.min(100, percent));
      playerStore.seek(clampedPercent);

      if (audioRef.value && playerStore.duration) {
        audioRef.value.currentTime =
          (clampedPercent / 100) * playerStore.duration;
      }
    }
  };

  const onUp = () => {
    isDraggingProgress.value = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
};

// Volume slider handling
const handleVolumeClick = (e) => {
  const rect =
    volumeRef.value?.getBoundingClientRect() ||
    e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  playerStore.setVolume(Math.max(0, Math.min(1, percent)));
};

const startVolumeDrag = (e) => {
  isDraggingVolume.value = true;
  handleVolumeClick(e);

  const onMove = (moveEvent) => {
    if (volumeRef.value) {
      const rect = volumeRef.value.getBoundingClientRect();
      const percent = (moveEvent.clientX - rect.left) / rect.width;
      playerStore.setVolume(Math.max(0, Math.min(1, percent)));
    }
  };

  const onUp = () => {
    isDraggingVolume.value = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
};
</script>

<style scoped>
.queue-slide-enter-active,
.queue-slide-leave-active {
  transition: all 0.2s ease;
}
.queue-slide-enter-from,
.queue-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
