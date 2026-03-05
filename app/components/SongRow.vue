<template>
  <div
    class="group grid gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors items-center cursor-pointer"
    :class="[gridCols, customClass]"
    @click="$emit('play')"
  >
    <!-- Index / Play / Pause / Equalizer Column -->
    <div class="flex items-center justify-center w-5 h-5">
      <!-- Current track: show equalizer (hide on hover via CSS) -->
      <template v-if="isCurrentTrack">
        <div
          class="equalizer group-hover:hidden!"
          :class="{ paused: !isPlaying }"
        >
          <span class="equalizer-bar"></span>
          <span class="equalizer-bar"></span>
          <span class="equalizer-bar"></span>
          <span class="equalizer-bar"></span>
        </div>
      </template>
      <!-- Not current track: show index -->
      <span v-else class="text-neutral-400 text-sm group-hover:hidden">
        {{ index + 1 }}
      </span>

      <!-- On hover: show play/pause button -->
      <button
        class="hidden group-hover:flex items-center justify-center"
        @click.stop="$emit('toggle-play')"
      >
        <UIcon
          v-if="isCurrentTrack && isPlaying"
          name="i-fa6-solid-pause"
          class="size-4 text-white"
        />
        <UIcon v-else name="i-fa6-solid-play" class="size-4 text-white" />
      </button>
    </div>

    <!-- Thumbnail + Title (NO artist below - Spotify style) -->
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
          :class="isCurrentTrack ? 'text-primary-500' : 'text-white'"
        >
          {{ song.Title }}
        </p>
        <!-- Artist name on same line, separated - Spotify style -->
        <p
          class="text-xs text-neutral-400 truncate hover:text-white hover:underline cursor-pointer"
        >
          {{ artistName }}
        </p>
      </div>
    </div>

    <!-- Extra columns slot (album, actions, etc.) -->
    <slot name="extra-columns" />

    <!-- Duration + Actions Column -->
    <div class="flex items-center justify-end gap-3">
      <slot name="actions" />
      <span class="text-sm text-neutral-400 tabular-nums">
        {{ formatDuration(song.Duration) }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  song: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isCurrentTrack: {
    type: Boolean,
    default: false,
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
  gridCols: {
    type: String,
    default: "grid-cols-[40px_1fr_1fr_100px]",
  },
  customClass: {
    type: String,
    default: "",
  },
});

defineEmits(["play", "toggle-play"]);

const { t } = useI18n();

// Computed artist name with fallbacks
const artistName = computed(() => {
  return (
    props.song.ArtistNames?.trim() ||
    props.song.ArtistName?.trim() ||
    t("home.unknown_artist")
  );
});

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
</script>
