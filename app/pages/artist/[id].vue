<template>
  <div class="min-h-screen pb-8">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-32">
      <UIcon
        name="i-lucide-loader-2"
        class="size-8 text-neutral-400 animate-spin"
      />
    </div>

    <!-- Artist Content -->
    <template v-else>
      <!-- Sticky Header (appears when scrolled past cover) -->
      <div
        v-show="showStickyHeader"
        class="sticky top-0 z-30 px-6 py-3 flex items-center gap-4 transition-all duration-300"
        :style="{
          background: `linear-gradient(180deg, ${artistColorDark} 0%, ${artistColorDarker} 100%)`,
        }"
      >
        <button
          class="w-12 h-12 bg-primary-500 hover:bg-primary-400 hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-lg shadow-black/40 cursor-pointer"
          :disabled="songs.length === 0"
          @click="togglePlayAll"
        >
          <UIcon
            v-if="isPlayingArtist"
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
          {{
            artist?.FullName || artist?.ArtistName || $t("home.unknown_artist")
          }}
        </h2>
      </div>

      <!-- Header with gradient -->
      <div
        class="relative -mx-4 -mt-4 px-8 pt-16 pb-8"
        :style="{
          background: `linear-gradient(180deg, ${artistColorDark} 0%, ${artistColorDarker} 60%, #121212 100%)`,
        }"
      >
        <div class="flex items-end gap-6">
          <!-- Artist Avatar -->
          <div
            class="w-48 h-48 md:w-56 md:h-56 rounded-full shadow-2xl overflow-hidden shrink-0 bg-[#282828]"
          >
            <img
              v-if="artist?.Avatar || artist?.Thumbnail"
              :src="artist.Avatar || artist.Thumbnail"
              :alt="artist.FullName || artist.ArtistName"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-user" class="size-20 text-neutral-500" />
            </div>
          </div>

          <!-- Artist Info -->
          <div class="flex-1 min-w-0 pb-2">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-badge-check" class="size-6 text-blue-400" />
              <span class="text-sm font-medium text-white">{{
                $t("artist.verified_artist")
              }}</span>
            </div>
            <h1
              class="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-4"
            >
              {{
                artist?.FullName ||
                artist?.ArtistName ||
                $t("home.unknown_artist")
              }}
            </h1>
            <p v-if="songs.length > 0" class="text-sm text-neutral-300">
              {{ artist?.SongCount || songs.length }}
              {{ $t("liked_songs.songs_count") }}
            </p>
            <div class="flex items-center gap-4 mt-2 text-sm text-neutral-400">
              <span
                v-if="artist?.FollowerCount != null"
                class="flex items-center gap-1"
              >
                <UIcon name="i-lucide-users" class="size-4" />
                {{ formatNumber(artist.FollowerCount) }}
                {{ $t("artist.followers") }}
              </span>
              <span v-if="artist?.TotalListens" class="flex items-center gap-1">
                <UIcon name="i-lucide-headphones" class="size-4" />
                {{ formatNumber(artist.TotalListens) }}
                {{ $t("artist.total_listens") }}
              </span>
              <span v-if="artist?.TotalLikes" class="flex items-center gap-1">
                <UIcon name="i-lucide-heart" class="size-4" />
                {{ formatNumber(artist.TotalLikes) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sentinel for sticky header detection -->
      <div ref="headerSentinel" class="h-px w-full"></div>

      <!-- Action Bar -->
      <div class="flex items-center gap-6 px-8 py-4">
        <!-- Play Button -->
        <button
          class="w-14 h-14 bg-primary-500 hover:bg-primary-400 hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-lg shadow-black/40 cursor-pointer"
          :disabled="songs.length === 0"
          @click="togglePlayAll"
        >
          <UIcon
            v-if="isPlayingArtist"
            name="i-fa6-solid-pause"
            class="size-6 text-white"
          />
          <UIcon
            v-else
            name="i-fa6-solid-play"
            class="size-6 text-white ml-1"
          />
        </button>

        <!-- Shuffle -->
        <UTooltip :text="$t('player.shuffle_off')" arrow>
          <button
            class="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            @click="shufflePlay"
          >
            <UIcon name="i-lucide-shuffle" class="size-7" />
          </button>
        </UTooltip>

        <!-- Follow Button -->
        <button
          class="px-8 py-1.5 text-sm font-bold border rounded-full transition-all cursor-pointer"
          :class="
            isFollowing
              ? 'border-white/30 text-white hover:border-white hover:scale-105'
              : 'border-white/30 text-white hover:border-white hover:scale-105'
          "
          @click="toggleFollow"
        >
          {{ isFollowing ? $t("artist.following") : $t("artist.follow") }}
        </button>
      </div>

      <!-- Popular Songs -->
      <div class="px-8">
        <h2 class="text-xl font-bold text-white mb-4">
          {{ $t("artist.popular") }}
        </h2>

        <!-- Song Rows -->
        <div
          v-for="(song, index) in displayedSongs"
          :key="song.Id || song.SongId"
          class="group grid grid-cols-[40px_1fr_minmax(60px,120px)_100px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors items-center cursor-pointer"
          @click="playSong(song, index)"
        >
          <!-- Index / Play -->
          <div class="flex items-center justify-center w-5 h-5">
            <template v-if="isCurrentTrack(song)">
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
              <span class="text-neutral-400 text-sm group-hover:hidden">
                {{ index + 1 }}
              </span>
            </template>

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
                :class="
                  isCurrentTrack(song) ? 'text-primary-500' : 'text-white'
                "
              >
                {{ song.Title }}
              </p>
              <p class="text-xs text-neutral-400 truncate">
                {{
                  song.ArtistNames?.trim() ||
                  song.ArtistName?.trim() ||
                  artist?.FullName ||
                  artist?.ArtistName ||
                  $t("home.unknown_artist")
                }}
              </p>
            </div>
          </div>

          <!-- Play Count -->
          <div class="min-w-0 text-right">
            <span
              v-if="song.PlayCount || song.ListenCount"
              class="text-sm text-neutral-400 tabular-nums"
            >
              {{ formatPlayCount(song.PlayCount || song.ListenCount || 0) }}
            </span>
          </div>

          <!-- Duration + Actions -->
          <div class="flex items-center justify-end gap-2">
            <SongContextMenu
              :song="song"
              :show-go-to-artist="false"
              :show-go-to-album="!!song.AlbumId"
            />
            <span class="text-sm text-neutral-400 tabular-nums">
              {{ formatDuration(song.Duration) }}
            </span>
          </div>
        </div>

        <!-- Show More / Show Less -->
        <div v-if="songs.length > 5" class="mt-4 px-4">
          <button
            class="text-sm font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            @click="showAllSongs = !showAllSongs"
          >
            {{ showAllSongs ? $t("artist.show_less") : $t("artist.show_more") }}
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-if="!isLoading && songs.length === 0"
          class="flex flex-col items-center justify-center py-20 text-center"
        >
          <UIcon name="i-lucide-music" class="size-16 text-neutral-600 mb-4" />
          <h3 class="text-xl font-bold text-white mb-2">
            {{ $t("artist.no_songs") }}
          </h3>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import artistApi from "~/api/artistApi";
import interactionApi from "~/api/interactionApi";
import { usePlayerStore } from "~/stores/usePlayerStore";
import { formatNumber } from "~/utils/formatNumber";

const route = useRoute();
const playerStore = usePlayerStore();
const { user } = useAuth();

const artist = ref(null);
const songs = ref([]);
const isLoading = ref(true);
const showAllSongs = ref(false);
const isFollowing = ref(false);

// Sticky header via composable
const { showStickyHeader, headerSentinel } = useStickyHeader();

// Dynamic color from avatar
const avatarUrl = computed(
  () => artist.value?.Avatar || artist.value?.Thumbnail || null,
);
const { dominantColor } = useDominantColor(avatarUrl);

const artistColorDark = computed(() => {
  const c = dominantColor.value;
  if (!c || !c.startsWith("rgb")) return "#2a1a2a";
  const match = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return "#2a1a2a";
  const r = Math.floor(parseInt(match[1]) * 0.35);
  const g = Math.floor(parseInt(match[2]) * 0.35);
  const b = Math.floor(parseInt(match[3]) * 0.35);
  return `rgb(${r}, ${g}, ${b})`;
});

const artistColorDarker = computed(() => {
  const c = dominantColor.value;
  if (!c || !c.startsWith("rgb")) return "#1a1020";
  const match = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return "#1a1020";
  const r = Math.floor(parseInt(match[1]) * 0.15);
  const g = Math.floor(parseInt(match[2]) * 0.15);
  const b = Math.floor(parseInt(match[3]) * 0.15);
  return `rgb(${r}, ${g}, ${b})`;
});

const displayedSongs = computed(() =>
  showAllSongs.value ? songs.value : songs.value.slice(0, 5),
);

const isPlayingArtist = computed(() => {
  if (!playerStore.currentTrack || !playerStore.isPlaying) return false;
  const currentId =
    playerStore.currentTrack.Id || playerStore.currentTrack.SongId;
  return songs.value.some((s) => (s.Id || s.SongId) === currentId);
});

const isCurrentTrack = (song) => {
  if (!playerStore.currentTrack) return false;
  const songId = song.Id || song.SongId;
  return (
    playerStore.currentTrack.Id === songId ||
    playerStore.currentTrack.SongId === songId
  );
};

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatPlayCount = (count) => {
  if (!count) return "";
  return Number(count).toLocaleString("vi-VN");
};

const playSong = (song, index) => {
  playerStore.playTrack(song, songs.value, index);
};

const togglePlaySong = (song, index) => {
  if (isCurrentTrack(song)) {
    playerStore.togglePlay();
  } else {
    playerStore.playTrack(song, songs.value, index);
  }
};

const togglePlayAll = () => {
  if (isPlayingArtist.value) {
    playerStore.togglePlay();
  } else if (songs.value.length > 0) {
    playerStore.playTrack(songs.value[0], songs.value, 0);
  }
};

const shufflePlay = () => {
  if (songs.value.length > 0) {
    playerStore.isShuffle = true;
    const randomIndex = Math.floor(Math.random() * songs.value.length);
    playerStore.playTrack(songs.value[randomIndex], songs.value, randomIndex);
  }
};

// Follow / Unfollow
const toggleFollow = async () => {
  const artistId = route.params.id;
  try {
    await interactionApi.followArtist(artistId);
    isFollowing.value = !isFollowing.value;
  } catch (error) {
    console.error("Error toggling follow:", error);
  }
};

const checkFollowStatus = async () => {
  try {
    const res = await interactionApi.getFollowedArtists({
      pageIndex: 1,
      pageSize: 200,
    });
    const list = res?.Data || res || [];
    const artistId = String(route.params.id);
    isFollowing.value = list.some(
      (a) => String(a.Id || a.ArtistId || a.FollowedUserId) === artistId,
    );
  } catch {
    isFollowing.value = false;
  }
};

const fetchArtistData = async () => {
  const artistId = route.params.id;
  isLoading.value = true;

  try {
    // Fetch artist's songs
    const songsRes = await artistApi.getSongsByArtistId(artistId, {
      pageIndex: 1,
      pageSize: 20,
    });
    songs.value = songsRes?.Data || songsRes?.Items || songsRes || [];

    // Try to get artist info from the first song or from artists list
    if (songs.value.length > 0) {
      const firstSong = songs.value[0];
      artist.value = {
        Id: artistId,
        FullName:
          firstSong.ArtistNames?.split(",")[0]?.trim() ||
          firstSong.ArtistName ||
          "",
        Avatar: firstSong.ArtistAvatar || firstSong.ArtistThumbnail || null,
      };
    }

    // Try fetching from artists list for more info
    try {
      const artistsRes = await artistApi.getArtists({
        pageIndex: 1,
        pageSize: 100,
      });
      const allArtists = artistsRes?.Data || artistsRes || [];
      const found = allArtists.find(
        (a) => String(a.UserId || a.Id || a.ArtistId) === String(artistId),
      );
      if (found) {
        artist.value = {
          ...artist.value,
          ...found,
          FullName:
            found.FullName || found.ArtistName || artist.value?.FullName,
          Avatar: found.Avatar || found.Thumbnail || artist.value?.Avatar,
        };
      }
    } catch {
      // Artist list not available, use info from songs
    }
  } catch (error) {
    console.error("Error fetching artist data:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchArtistData();
  if (user.value?.id) {
    checkFollowStatus();
  }
});

// Watch for route changes
watch(
  () => route.params.id,
  () => {
    if (route.params.id) {
      fetchArtistData();
      if (user.value?.id) {
        checkFollowStatus();
      }
    }
  },
);
</script>

<style scoped>
.equalizer {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}
.equalizer-bar {
  width: 3px;
  background: currentColor;
  border-radius: 1px;
  animation: equalize 0.6s ease-in-out infinite alternate;
}
.equalizer-bar:nth-child(1) {
  animation-delay: 0s;
  height: 40%;
  color: #a855f7;
}
.equalizer-bar:nth-child(2) {
  animation-delay: 0.2s;
  height: 70%;
  color: #a855f7;
}
.equalizer-bar:nth-child(3) {
  animation-delay: 0.4s;
  height: 50%;
  color: #a855f7;
}
.equalizer-bar:nth-child(4) {
  animation-delay: 0.1s;
  height: 60%;
  color: #a855f7;
}
.equalizer.paused .equalizer-bar {
  animation: none;
  height: 30%;
}
@keyframes equalize {
  0% {
    height: 20%;
  }
  100% {
    height: 100%;
  }
}
</style>
