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
          <div class="min-w-0 flex-1">
            <p
              class="text-sm text-white font-medium truncate hover:underline cursor-pointer"
            >
              {{ playerStore.currentTrack.Title }}
            </p>
            <p
              class="text-xs text-neutral-400 truncate hover:text-white hover:underline cursor-pointer"
            >
              {{
                playerStore.currentTrack.ArtistNames || t("home.unknown_artist")
              }}
            </p>
          </div>

          <!-- Like / Add to playlist Button -->
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
              class="p-2 transition-colors cursor-pointer shrink-0"
              :class="
                currentTrackLiked
                  ? 'text-primary-500 hover:text-primary-400'
                  : 'text-neutral-400 hover:text-white'
              "
              @click="handleLikeClick"
            >
              <UIcon
                :name="
                  currentTrackLiked
                    ? 'i-lucide-check-circle'
                    : 'i-lucide-plus-circle'
                "
                class="size-5"
              />
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
              class="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!playerStore.hasTrack"
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
              class="w-9 h-9 bg-white hover:scale-105 rounded-full flex items-center justify-center transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!playerStore.hasTrack"
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
              class="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!playerStore.hasTrack"
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
            class="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <UIcon name="i-lucide-list-music" class="size-4" />
          </button>
        </UTooltip>

        <!-- Device -->
        <UTooltip
          :text="t('player.devices')"
          arrow
          :ui="{ content: 'bg-[#282828]' }"
        >
          <button
            class="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <UIcon name="i-lucide-monitor-speaker" class="size-4" />
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

    <!-- Add to Playlist Modal -->
    <AddToPlaylistModal
      v-if="showAddToPlaylist && playerStore.currentTrack"
      :song-id="playerStore.currentTrack.Id || playerStore.currentTrack.SongId"
      :song-title="playerStore.currentTrack.Title"
      @close="showAddToPlaylist = false"
    />
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

// Track if we've initialized from restored state
const hasInitialized = ref(false);
// Track if audio is ready to play after restore
const audioReady = ref(false);

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
    // Already liked → show add to playlist popup
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

// Handle play/pause with proper audio loading after refresh
const handlePlayPause = async () => {
  if (!playerStore.currentTrack) return;

  if (playerStore.isPlaying) {
    playerStore.pause();
    return;
  }

  // If audio is not ready yet (after restore/refresh), load it first
  if (audioRef.value && audioSrc.value) {
    if (audioRef.value.readyState < 2) {
      playerStore.setLoading(true);
      audioRef.value.load();

      // Wait for canplay before playing
      await new Promise((resolve) => {
        const onReady = () => {
          audioRef.value?.removeEventListener("canplay", onReady);
          resolve();
        };
        audioRef.value.addEventListener("canplay", onReady);

        // Timeout fallback
        setTimeout(resolve, 5000);
      });

      // Restore position if available
      if (playerStore.currentTime > 0 && audioRef.value) {
        audioRef.value.currentTime = playerStore.currentTime;
      }
    }

    playerStore.play();

    // Ensure audio actually starts playing
    try {
      await audioRef.value.play();
    } catch (err) {
      console.error("Play failed:", err);
      playerStore.pause();
    }
  } else {
    playerStore.togglePlay();
  }
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
      audioRef.value.preload = "auto";
      audioRef.value.load();

      // Listen for when audio is ready
      audioRef.value.addEventListener(
        "canplay",
        () => {
          audioReady.value = true;
          // Restore position
          if (playerStore.currentTime > 0) {
            audioRef.value.currentTime = playerStore.currentTime;
          }
        },
        { once: true },
      );
    }
  }
});

// Watch audioSrc to load audio when it becomes available (important for restore)
watch(
  audioSrc,
  (newSrc) => {
    if (newSrc && audioRef.value && hasInitialized.value) {
      audioRef.value.load();

      // Restore position after audio loads
      audioRef.value.addEventListener(
        "loadedmetadata",
        () => {
          if (playerStore.currentTime > 0 && !playerStore.isPlaying) {
            audioRef.value.currentTime = playerStore.currentTime;
          }
          audioReady.value = true;
        },
        { once: true },
      );
    }
  },
  { immediate: true },
);

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

const onPause = () => {
  // Audio paused
};

const onWaiting = () => {
  playerStore.setLoading(true);
};

const onCanPlay = () => {
  playerStore.setLoading(false);
};

const onError = (e) => {
  console.error("Audio error:", e);
  console.error("Audio element error:", audioRef.value?.error);
  playerStore.setLoading(false);
};

// Watch for play/pause state changes
watch(
  () => playerStore.isPlaying,
  (isPlaying) => {
    if (!audioRef.value || !audioSrc.value) return;

    if (isPlaying) {
      // Make sure audio is loaded before playing
      if (audioRef.value.readyState >= 2) {
        audioRef.value.play().catch((err) => {
          console.error("Play failed:", err);
          playerStore.pause();
        });
      } else {
        // Audio not ready, load it first
        playerStore.setLoading(true);
        audioRef.value.load();
        audioRef.value.addEventListener(
          "canplay",
          () => {
            if (playerStore.isPlaying) {
              // Restore position if needed
              if (
                playerStore.currentTime > 0 &&
                Math.abs(audioRef.value.currentTime - playerStore.currentTime) >
                  1
              ) {
                audioRef.value.currentTime = playerStore.currentTime;
              }
              audioRef.value.play().catch((err) => {
                console.error("Play after load failed:", err);
                playerStore.pause();
              });
            }
          },
          { once: true },
        );
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

// Watch for track changes (including auto-next)
watch(
  () => playerStore.currentTrack,
  async (newTrack, oldTrack) => {
    if (!audioRef.value || !newTrack) return;
    // Only react to actual track changes (not initial mount)
    if (
      oldTrack &&
      newTrack.Id === oldTrack.Id &&
      playerStore.repeatMode === "one"
    ) {
      // Repeat one: just restart
      audioRef.value.currentTime = 0;
      audioRef.value.play().catch(() => {});
      return;
    }

    // Reset time
    playerStore.updateTime(0);
    playerStore.updateDuration(newTrack.Duration || 0);

    // Wait for next tick so audioSrc computed updates
    await nextTick();

    if (audioSrc.value) {
      audioRef.value.src = audioSrc.value;
      audioRef.value.load();

      // Use canplay event to ensure audio is ready before playing
      const playWhenReady = () => {
        if (playerStore.isPlaying && audioRef.value) {
          audioRef.value.play().catch((err) => {
            console.error("Autoplay on track change failed:", err);
          });
        }
      };

      audioRef.value.addEventListener("canplay", playWhenReady, { once: true });
    }
  },
);

// Watch for audioSrc changes (handles when FileUrl is loaded async - but not during track changes)
watch(audioSrc, async (newSrc, oldSrc) => {
  if (newSrc && newSrc !== oldSrc && audioRef.value && playerStore.isPlaying) {
    await nextTick();
    // Only load if the src actually changed and isn't handled by track watcher
    if (audioRef.value.src !== newSrc) {
      audioRef.value.src = newSrc;
      audioRef.value.load();
      audioRef.value.addEventListener(
        "canplay",
        () => {
          if (playerStore.isPlaying) {
            audioRef.value?.play().catch(() => {});
          }
        },
        { once: true },
      );
    }
  }
});

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
