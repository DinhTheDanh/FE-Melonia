<template>
  <div class="min-h-screen pb-8">
    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col gap-6 px-8 pt-16">
      <div class="flex items-end gap-6">
        <div
          class="w-56 h-56 rounded-lg bg-neutral-700 animate-pulse shrink-0"
        ></div>
        <div class="flex flex-col gap-3 pb-2 flex-1">
          <div class="w-20 h-4 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="w-64 h-10 bg-neutral-700 rounded animate-pulse"></div>
          <div
            class="w-40 h-4 bg-neutral-700/50 rounded animate-pulse mt-4"
          ></div>
        </div>
      </div>
      <div class="space-y-2 mt-6">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 py-3">
          <div class="w-4 h-4 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="w-10 h-10 bg-neutral-700 rounded animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div
              class="h-4 bg-neutral-700 rounded animate-pulse"
              :style="{ width: `${30 + Math.random() * 30}%` }"
            ></div>
            <div class="w-24 h-3 bg-neutral-700/50 rounded animate-pulse"></div>
          </div>
          <div class="w-12 h-4 bg-neutral-700/50 rounded animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Playlist Content -->
    <template v-else-if="playlist">
      <!-- Sticky Header (shows when scrolled past cover) -->
      <div
        v-show="showStickyHeader"
        class="sticky top-0 z-30 px-6 py-3 flex items-center gap-4 transition-all duration-300"
        :style="{
          background: `linear-gradient(180deg, ${playlistColor} 0%, ${playlistColorDark} 100%)`,
        }"
      >
        <button
          class="w-12 h-12 bg-primary-500 hover:bg-primary-400 hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer"
          :disabled="songs.length === 0"
          @click="togglePlayAll"
        >
          <UIcon
            v-if="isPlayingThisPlaylist"
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
          {{ playlist.Title }}
        </h2>
      </div>

      <!-- Header -->
      <div
        ref="headerRef"
        class="relative -mx-4 -mt-4 px-8 pt-16 pb-8"
        :style="{
          background: `linear-gradient(180deg, ${playlistColor} 0%, ${playlistColorDark} 40%, #121212 100%)`,
        }"
      >
        <div class="flex items-end gap-6">
          <!-- Playlist Cover -->
          <div
            class="w-56 h-56 rounded-lg shadow-2xl overflow-hidden shrink-0 bg-[#282828] cursor-pointer group relative"
            @click="openEditModal"
          >
            <div
              v-if="!playlist.Thumbnail"
              class="w-full h-full flex items-center justify-center"
              style="background: #282828"
            >
              <UIcon name="i-lucide-music" class="size-20 text-white/80" />
            </div>
            <img
              v-else
              :src="playlist.Thumbnail"
              :alt="playlist.Title"
              class="w-full h-full object-cover"
            />
            <!-- Edit overlay on hover -->
            <div
              class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
            >
              <UIcon name="i-lucide-pencil" class="size-12 text-white" />
              <span class="text-sm font-semibold text-white">{{
                t("playlist.choose_photo")
              }}</span>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0 pb-2">
            <p
              class="text-xs font-bold text-white uppercase tracking-wider mb-2"
            >
              {{
                isPublic
                  ? t("playlist.public_playlist")
                  : t("playlist.private_playlist")
              }}
            </p>
            <h1
              class="text-5xl font-black text-white leading-tight mb-4 cursor-pointer hover:underline"
              @click="openEditModal"
            >
              {{ playlist.Title }}
            </h1>
            <p
              v-if="playlist.Description"
              class="text-sm text-neutral-300 mb-2"
            >
              {{ playlist.Description }}
            </p>
            <div class="flex items-center gap-2 text-sm text-neutral-200">
              <NuxtLink
                to="/user/profile"
                class="font-semibold hover:underline cursor-pointer"
              >
                {{ playlist.CreatedBy || t("home.unknown_artist") }}
              </NuxtLink>
              <span class="text-neutral-400">·</span>
              <span>{{ songs.length }} {{ t("liked_songs.songs_count") }}</span>
              <span v-if="totalDuration" class="text-neutral-400"
                >· {{ totalDuration }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="flex items-center gap-6 px-8 py-4">
        <!-- Play Button -->
        <button
          class="w-14 h-14 bg-primary-500 hover:bg-primary-400 hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="songs.length === 0"
          @click="togglePlayAll"
        >
          <UIcon
            v-if="isPlayingThisPlaylist"
            name="i-fa6-solid-pause"
            class="size-6 text-white"
          />
          <UIcon
            v-else
            name="i-fa6-solid-play"
            class="size-6 text-white ml-0.5"
          />
        </button>

        <!-- Shuffle -->
        <button
          class="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          @click="shufflePlay"
        >
          <UIcon name="i-lucide-shuffle" class="size-7" />
        </button>

        <!-- More Options Dropdown -->
        <UDropdownMenu
          :items="playlistMenuItems"
          :ui="{
            content: 'w-52 bg-[#282828] border-none shadow-xl p-1',
            item: 'flex items-center gap-2 px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white rounded-sm cursor-pointer',
          }"
        >
          <button
            class="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <UIcon name="i-lucide-more-horizontal" class="size-7" />
          </button>
        </UDropdownMenu>

        <!-- View toggle (right side) -->
        <div class="flex-1"></div>
        <div class="flex items-center gap-2 text-neutral-400">
          <span class="text-sm">{{ t("playlist.list_view") }}</span>
          <UIcon name="i-lucide-list" class="size-5" />
        </div>
      </div>

      <!-- Sentinel for sticky header detection -->
      <div ref="headerSentinel" class="h-px w-full"></div>

      <!-- Songs Table -->
      <div class="px-4">
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

        <!-- Song Rows (Drag & Drop) -->
        <div
          v-for="(song, index) in songs"
          :key="song.Id || song.SongId"
          class="group grid grid-cols-[40px_1fr_1fr_100px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors items-center cursor-pointer"
          :class="{
            'bg-white/5': dragOverIdx === index,
            'opacity-50': dragIdx === index,
          }"
          draggable="true"
          @dragstart="onSongDragStart($event, index)"
          @dragover.prevent="onSongDragOver($event, index)"
          @dragenter.prevent="dragOverIdx = index"
          @dragleave="dragOverIdx = null"
          @drop.prevent="onSongDrop($event, index)"
          @dragend="onSongDragEnd"
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
                  t("home.unknown_artist")
                }}
              </p>
            </div>
          </div>

          <!-- Album -->
          <div class="min-w-0">
            <p class="text-sm text-neutral-400 truncate">
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
              :playlist-id="playlist?.PlaylistId || playlist?.Id"
              :show-remove-from-playlist="isOwner"
              :show-go-to-album="!!song.AlbumId"
              @removed-from-playlist="handleSongRemoved"
            />
            <span class="text-sm text-neutral-400 tabular-nums">
              {{ formatDuration(song.Duration) }}
            </span>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="songs.length === 0"
          class="flex flex-col items-center justify-center py-20 text-center"
        >
          <UIcon name="i-lucide-music" class="size-16 text-neutral-600 mb-4" />
          <h3 class="text-xl font-bold text-white mb-2">
            {{ t("playlist.empty_title") }}
          </h3>
          <p class="text-neutral-400">{{ t("playlist.empty_description") }}</p>
        </div>
      </div>

      <!-- Recommendation Section -->
      <div
        v-if="songs.length > 0 && recommendedSongs.length > 0"
        class="px-4 mt-8 mb-8"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-white">
              {{ t("playlist.recommendation_title") }}
            </h2>
            <p class="text-sm text-neutral-400 mt-1">
              {{ t("playlist.recommendation_desc") }}
            </p>
          </div>
          <button
            class="text-sm font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            @click="refreshRecommendations"
          >
            {{ t("playlist.find_more") }}
          </button>
        </div>

        <div
          v-for="song in recommendedSongs"
          :key="song.Id"
          class="group grid grid-cols-[1fr_1fr_80px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors items-center"
        >
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
              <p class="text-sm font-medium text-white truncate">
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
            <p class="text-sm text-neutral-400 truncate">
              {{ song.AlbumTitle || "-" }}
            </p>
          </div>

          <!-- Add Button -->
          <div class="flex items-center justify-end">
            <button
              class="px-4 py-1.5 border border-neutral-500 rounded-full text-sm font-semibold text-white hover:border-white hover:scale-105 transition-all cursor-pointer"
              @click="addRecommendedSong(song)"
            >
              {{ t("playlist.add_button") }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="flex flex-col items-center justify-center h-screen">
      <UIcon name="i-lucide-list-music" class="size-20 text-neutral-600 mb-4" />
      <p class="text-xl text-neutral-400 mb-6">{{ t("playlist.not_found") }}</p>
      <NuxtLink to="/">
        <button
          class="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-bold py-3 px-8 rounded-full transition-colors cursor-pointer"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
          {{ t("playlist.go_home") }}
        </button>
      </NuxtLink>
    </div>

    <!-- Delete Confirm Modal -->
    <Transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click="showDeleteConfirm = false"
      >
        <div
          class="bg-[#282828] rounded-lg p-6 max-w-md w-full mx-4"
          @click.stop
        >
          <h2 class="text-xl font-bold mb-4">{{ t("song.confirm_delete") }}</h2>
          <p class="text-neutral-400 mb-6">
            {{ t("song.delete_playlist_confirmation") }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-6 py-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              @click="showDeleteConfirm = false"
            >
              {{ t("song.cancel") }}
            </button>
            <button
              class="px-6 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full transition-colors cursor-pointer"
              :disabled="isDeleting"
              @click="confirmDelete"
            >
              <span v-if="isDeleting" class="flex items-center gap-2">
                <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
              </span>
              <span v-else>{{ t("song.confirm") }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Edit Playlist Modal -->
    <Transition name="fade">
      <div
        v-if="showEditModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click="showEditModal = false"
      >
        <div
          class="bg-[#282828] rounded-lg p-6 max-w-lg w-full mx-4"
          @click.stop
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">
              {{ t("playlist.edit_details") }}
            </h2>
            <button
              class="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              @click="showEditModal = false"
            >
              <UIcon name="i-lucide-x" class="size-6" />
            </button>
          </div>

          <div class="flex gap-4 items-center">
            <!-- Thumbnail -->
            <div
              class="w-44 h-44 rounded-md bg-[#3e3e3e] flex items-center justify-center shrink-0 cursor-pointer group relative overflow-hidden"
              @click="triggerImageUpload"
            >
              <div
                v-if="!editThumbnailPreview && !playlist.Thumbnail"
                class="w-full h-full flex items-center justify-center"
                style="background: #3e3e3e"
              >
                <UIcon name="i-lucide-music" class="size-16 text-white/80" />
              </div>
              <img
                v-else
                :src="editThumbnailPreview || playlist.Thumbnail"
                :alt="playlist.Title"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
              >
                <UIcon
                  v-if="isUploadingImage"
                  name="i-lucide-loader-2"
                  class="size-10 text-white animate-spin"
                />
                <template v-else>
                  <UIcon name="i-lucide-pencil" class="size-10 text-white" />
                  <span class="text-xs text-white">{{
                    t("playlist.choose_photo")
                  }}</span>
                </template>
              </div>
              <input
                ref="imageInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
            </div>

            <!-- Form -->
            <div class="flex-1 flex flex-col gap-4">
              <div>
                <label class="block text-xs text-neutral-400 mb-1">{{
                  t("playlist.name")
                }}</label>
                <input
                  v-model="editTitle"
                  type="text"
                  class="w-full bg-[#3e3e3e] border-none rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  :placeholder="t('playlist.name_placeholder')"
                />
              </div>
              <div class="flex-1">
                <label class="block text-xs text-neutral-400 mb-1">{{
                  t("playlist.description")
                }}</label>
                <textarea
                  v-model="editDescription"
                  class="w-full h-24 bg-[#3e3e3e] border-none rounded-md px-3 py-2 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
                  :placeholder="t('playlist.description_placeholder')"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              class="px-8 py-3 bg-white hover:bg-neutral-200 hover:scale-105 text-black font-bold rounded-full transition-all cursor-pointer disabled:opacity-50"
              :disabled="isUpdating || !editTitle.trim()"
              @click="handleUpdatePlaylist"
            >
              <span v-if="isUpdating" class="flex items-center gap-2">
                <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
              </span>
              <span v-else>{{ t("playlist.save") }}</span>
            </button>
          </div>

          <p class="text-[10px] text-neutral-500 mt-4">
            {{ t("playlist.terms_notice") }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import interactionApi from "~/api/interactionApi";
import musicApi from "~/api/musicApi";
import recommendationApi from "~/api/recommendationApi";
import fileApi from "~/api/fileApi";
import { usePlayerStore } from "~/stores/usePlayerStore";
import { useDebounceFn } from "@vueuse/core";
import { formatNumber } from "~/utils/formatNumber";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const playerStore = usePlayerStore();

// State
const playlist = ref(null);
const songs = ref([]);
const isLoading = ref(true);
const isDeleting = ref(false);
const showDeleteConfirm = ref(false);
const isPublic = ref(true);

// Edit Modal State
const showEditModal = ref(false);
const editTitle = ref("");
const editDescription = ref("");
const isUpdating = ref(false);

// Image upload
const imageInputRef = ref(null);
const editThumbnailFile = ref(null);
const editThumbnailPreview = ref(null);
const isUploadingImage = ref(false);

// Sidebar refresh signal
const sidebarRefreshKey = useState("sidebarRefreshKey", () => 0);
// Shared thumbnail overrides for sidebar (when BE doesn't persist thumbnail)
const playlistThumbnailOverrides = useState(
  "playlistThumbnailOverrides",
  () => ({}),
);

// Search State
const showSearch = ref(true);
const searchQuery = ref("");
const searchResults = ref([]);
const isSearching = ref(false);
const addingSongId = ref(null);

// Drag & drop
const dragIdx = ref(null);
const dragOverIdx = ref(null);

// Sticky header
const headerSentinel = ref(null);
const showStickyHeader = ref(false);
let stickyObserver = null;

// Recommendations
const recommendedSongs = ref([]);

// Playlist header gradient color based on thumbnail
const playlistColor = ref("#535353");
const playlistColorDark = ref("#333333");

const extractColor = (thumbnail) => {
  if (!thumbnail) {
    playlistColor.value = "#535353";
    playlistColorDark.value = "#333333";
    return;
  }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      playlistColor.value = `rgb(${r}, ${g}, ${b})`;
      playlistColorDark.value = `rgb(${Math.floor(r * 0.4)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.4)})`;
    } catch {
      playlistColor.value = "#535353";
      playlistColorDark.value = "#333333";
    }
  };
  img.src = thumbnail;
};

const totalDuration = computed(() => {
  const total = songs.value.reduce((acc, s) => acc + (s.Duration || 0), 0);
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours} hr ${mins} min`;
  return `${mins} min`;
});

// Check if currently playing a song from this playlist
const isPlayingThisPlaylist = computed(() => {
  if (!playerStore.currentTrack || !playerStore.isPlaying) return false;
  const currentId =
    playerStore.currentTrack.Id || playerStore.currentTrack.SongId;
  return songs.value.some((s) => (s.Id || s.SongId) === currentId);
});

const isCurrentTrack = (song) => {
  if (!playerStore.currentTrack) return false;
  return (
    playerStore.currentTrack.Id === (song.Id || song.SongId) ||
    playerStore.currentTrack.SongId === (song.Id || song.SongId)
  );
};

// Check if current user is owner of playlist
const isOwner = computed(() => {
  // For now, assume user owns all their playlists
  // In real app, check playlist.UserId === currentUser.id
  return true;
});

// Handle song removed from playlist via context menu
const handleSongRemoved = (song) => {
  const songId = song.Id || song.SongId;
  songs.value = songs.value.filter((s) => (s.Id || s.SongId) !== songId);
};

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const fetchPlaylist = async () => {
  isLoading.value = true;
  try {
    const res = await interactionApi.getPlaylistDetails(route.params.id, {
      pageIndex: 1,
      pageSize: 200,
    });

    if (res && res.Playlist) {
      playlist.value = res.Playlist;
      songs.value = res.Songs?.Data || [];
    } else if (res && res.playlist) {
      playlist.value = res.playlist;
      songs.value = res.songs?.data || res.songs?.Data || [];
    } else {
      // Maybe flat response
      playlist.value = res;
      songs.value = [];
    }

    // Read IsPublic from playlist data
    isPublic.value = playlist.value?.IsPublic !== false;

    // Extract dominant color from playlist thumbnail
    if (playlist.value?.Thumbnail) {
      extractColor(playlist.value.Thumbnail);
    }
  } catch (error) {
    console.error("Error fetching playlist:", error);
    playlist.value = null;
  } finally {
    isLoading.value = false;
  }
};

const playAll = () => {
  if (songs.value.length === 0) return;
  const queue = songs.value.map((s) => ({
    Id: s.Id || s.SongId,
    SongId: s.SongId || s.Id,
    Title: s.Title,
    ArtistNames: s.ArtistNames || "",
    Thumbnail: s.Thumbnail,
    FileUrl: s.FileUrl,
    Duration: s.Duration,
  }));
  playerStore.playTrack(queue[0], queue, 0);
};

const togglePlayAll = () => {
  if (isPlayingThisPlaylist.value) {
    playerStore.togglePlay();
  } else {
    playAll();
  }
};

const shufflePlay = () => {
  if (songs.value.length === 0) return;
  playerStore.isShuffle = true;
  const queue = songs.value.map((s) => ({
    Id: s.Id || s.SongId,
    SongId: s.SongId || s.Id,
    Title: s.Title,
    ArtistNames: s.ArtistNames || "",
    Thumbnail: s.Thumbnail,
    FileUrl: s.FileUrl,
    Duration: s.Duration,
  }));
  const randomIndex = Math.floor(Math.random() * queue.length);
  playerStore.playTrack(queue[randomIndex], queue, randomIndex);
};

const playSong = (song, index) => {
  const queue = songs.value.map((s) => ({
    Id: s.Id || s.SongId,
    SongId: s.SongId || s.Id,
    Title: s.Title,
    ArtistNames: s.ArtistNames || "",
    Thumbnail: s.Thumbnail,
    FileUrl: s.FileUrl,
    Duration: s.Duration,
  }));
  playerStore.playTrack(queue[index], queue, index);
};

const togglePlaySong = (song, index) => {
  if (isCurrentTrack(song)) {
    // Toggle play/pause for current track
    playerStore.togglePlay();
  } else {
    // Play this song
    playSong(song, index);
  }
};

const removeSong = async (song) => {
  const songId = song.Id || song.SongId;
  const playlistId = route.params.id;
  try {
    await interactionApi.removeSongFromPlaylist(playlistId, songId);
    songs.value = songs.value.filter((s) => (s.Id || s.SongId) !== songId);
    toast.add({
      title: t("notify.success"),
      description: t("playlist.song_removed"),
      color: "green",
    });
  } catch (error) {
    console.error("Error removing song:", error);
    toast.add({
      title: t("notify.error"),
      description: t("playlist.remove_error"),
      color: "red",
    });
  }
};

const confirmDelete = async () => {
  isDeleting.value = true;
  try {
    await interactionApi.deletePlaylist(route.params.id);
    sidebarRefreshKey.value++;
    toast.add({
      title: t("notify.success"),
      description: t("song.delete_success"),
      color: "green",
    });
    await navigateTo("/");
  } catch (error) {
    console.error("Error deleting playlist:", error);
    toast.add({
      title: t("notify.error"),
      description: t("song.delete_error"),
      color: "red",
    });
  } finally {
    isDeleting.value = false;
  }
};

// Song drag & drop reorder (visual only, no backend reorder)
const onSongDragStart = (e, index) => {
  dragIdx.value = index;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", index.toString());
};

const onSongDragOver = (e, index) => {
  e.dataTransfer.dropEffect = "move";
};

const onSongDrop = (e, toIndex) => {
  const fromIndex = dragIdx.value;
  if (fromIndex !== null && fromIndex !== toIndex) {
    const [item] = songs.value.splice(fromIndex, 1);
    songs.value.splice(toIndex, 0, item);
  }
  dragIdx.value = null;
  dragOverIdx.value = null;
};

const onSongDragEnd = () => {
  dragIdx.value = null;
  dragOverIdx.value = null;
};

// Edit Playlist
const openEditModal = () => {
  editTitle.value = playlist.value?.Title || "";
  editDescription.value = playlist.value?.Description || "";
  editThumbnailFile.value = null;
  editThumbnailPreview.value = null;
  showEditModal.value = true;
};

const triggerImageUpload = () => {
  imageInputRef.value?.click();
};

const handleImageSelect = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  editThumbnailFile.value = file;
  editThumbnailPreview.value = URL.createObjectURL(file);
};

const handleUpdatePlaylist = async () => {
  if (!editTitle.value.trim()) return;
  isUpdating.value = true;
  try {
    let thumbnailUrl = null;

    // Upload image if selected
    if (editThumbnailFile.value) {
      isUploadingImage.value = true;
      try {
        const uploadRes = await fileApi.uploadImage(editThumbnailFile.value);
        thumbnailUrl = uploadRes.Url || uploadRes.url;
      } finally {
        isUploadingImage.value = false;
      }
    }

    const updateData = {
      Title: editTitle.value.trim(),
      Description: editDescription.value.trim(),
    };
    if (thumbnailUrl) {
      updateData.Thumbnail = thumbnailUrl;
    }

    await interactionApi.updatePlaylist(route.params.id, updateData);
    playlist.value.Title = editTitle.value.trim();
    playlist.value.Description = editDescription.value.trim();
    if (thumbnailUrl) {
      playlist.value.Thumbnail = thumbnailUrl;
      extractColor(thumbnailUrl);
      // Store override so sidebar shows updated thumbnail (even if BE doesn't persist it)
      playlistThumbnailOverrides.value[route.params.id] = thumbnailUrl;
    }
    showEditModal.value = false;

    // Signal sidebar to refresh
    sidebarRefreshKey.value++;

    toast.add({
      title: t("notify.success"),
      description: t("playlist.updated_success"),
      color: "green",
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    toast.add({
      title: t("notify.error"),
      description: t("playlist.update_error"),
      color: "red",
    });
  } finally {
    isUpdating.value = false;
  }
};

// Search & Add Songs
const handleSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  isSearching.value = true;
  try {
    const res = await musicApi.getSongs({
      keyword: searchQuery.value.trim(),
      pageIndex: 1,
      pageSize: 10,
    });
    const data = res?.data || res?.Data || res || [];
    // Filter out songs already in playlist
    const existingIds = new Set(songs.value.map((s) => s.Id || s.SongId));
    searchResults.value = (Array.isArray(data) ? data : []).filter(
      (song) => !existingIds.has(song.Id),
    );
  } catch (error) {
    console.error("Error searching songs:", error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}, 400);

const addSongToPlaylist = async (song) => {
  addingSongId.value = song.Id;
  try {
    await interactionApi.addSongToPlaylist(route.params.id, song.Id);
    songs.value.push({
      ...song,
      SongId: song.Id,
    });
    // Remove from search results
    searchResults.value = searchResults.value.filter((s) => s.Id !== song.Id);
    toast.add({
      title: t("notify.success"),
      description: t("playlist.song_added"),
      color: "green",
    });
  } catch (error) {
    console.error("Error adding song:", error);
    toast.add({
      title: t("notify.error"),
      description: t("playlist.add_error"),
      color: "red",
    });
  } finally {
    addingSongId.value = null;
  }
};

const closeSearch = () => {
  showSearch.value = false;
  searchQuery.value = "";
  searchResults.value = [];
};

// Recommendations
const fetchRecommendations = async () => {
  try {
    const userInfo = await import("~/api/userApi").then((m) =>
      m.default.getUserInfo(),
    );
    const userId = userInfo?.Id || userInfo?.id;
    if (!userId) return;

    const res = await recommendationApi.getRecommendedSongs(userId, 10);
    const allSongs = Array.isArray(res) ? res : res?.data || res?.Data || [];
    // Filter out songs already in playlist
    const existingIds = new Set(songs.value.map((s) => s.Id || s.SongId));
    recommendedSongs.value = allSongs.filter((s) => !existingIds.has(s.Id));
  } catch (error) {
    console.error("Error fetching recommendations:", error);
  }
};

const refreshRecommendations = () => {
  fetchRecommendations();
};

const addRecommendedSong = async (song) => {
  try {
    await interactionApi.addSongToPlaylist({
      playlistId: route.params.id,
      songId: song.Id,
    });
    songs.value.push({ ...song, SongId: song.Id });
    // Remove from recommendations
    recommendedSongs.value = recommendedSongs.value.filter(
      (s) => s.Id !== song.Id,
    );
    toast.add({
      title: t("notify.success"),
      description: t("playlist.song_added", {
        playlist: playlist.value?.Title,
      }),
      color: "green",
    });
  } catch (error) {
    console.error("Error adding recommended song:", error);
    toast.add({
      title: t("notify.error"),
      description: t("playlist.add_error"),
      color: "red",
    });
  }
};

// Setup sticky header observer
const setupStickyObserver = () => {
  if (stickyObserver) stickyObserver.disconnect();

  // Find the scroll container (parent with overflow-y-auto)
  const scrollContainer =
    headerSentinel.value?.closest(".overflow-y-auto") || null;

  stickyObserver = new IntersectionObserver(
    ([entry]) => {
      showStickyHeader.value = !entry.isIntersecting;
    },
    {
      root: scrollContainer,
      threshold: 0,
      rootMargin: "0px",
    },
  );

  if (headerSentinel.value) {
    stickyObserver.observe(headerSentinel.value);
  }
};

// Toggle playlist visibility
const toggleVisibility = async () => {
  try {
    const res = await interactionApi.togglePlaylistVisibility(route.params.id);
    isPublic.value = res?.IsPublic ?? !isPublic.value;
    toast.add({
      title: t("notify.success"),
      description: isPublic.value
        ? t("playlist.now_public")
        : t("playlist.now_private"),
      color: "green",
    });
  } catch (error) {
    console.error("Error toggling visibility:", error);
    toast.add({
      title: t("notify.error"),
      description: t("playlist.update_error"),
      color: "red",
    });
  }
};

// Menu items
const playlistMenuItems = computed(() => [
  [
    {
      label: t("playlist.add_to_queue"),
      icon: "i-lucide-list-plus",
      onSelect: () => {
        songs.value.forEach((song) => {
          playerStore.addToQueue({
            Id: song.Id || song.SongId,
            SongId: song.SongId || song.Id,
            Title: song.Title,
            ArtistNames: song.ArtistNames || "",
            Thumbnail: song.Thumbnail,
            FileUrl: song.FileUrl,
            Duration: song.Duration,
          });
        });
        toast.add({
          title: t("notify.success"),
          description: t("playlist.added_to_queue"),
          color: "green",
        });
      },
    },
    {
      label: isPublic.value
        ? t("playlist.make_private")
        : t("playlist.make_public"),
      icon: isPublic.value ? "i-lucide-lock" : "i-lucide-globe",
      onSelect: toggleVisibility,
    },
    {
      label: t("playlist.edit_details"),
      icon: "i-lucide-pencil",
      onSelect: openEditModal,
    },
    {
      label: t("song.delete"),
      icon: "i-lucide-trash-2",
      onSelect: () => {
        showDeleteConfirm.value = true;
      },
    },
  ],
]);

onMounted(() => {
  fetchPlaylist().then(() => {
    fetchRecommendations();
    nextTick(() => setupStickyObserver());
  });
});

onUnmounted(() => {
  if (stickyObserver) stickyObserver.disconnect();
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      showStickyHeader.value = false;
      fetchPlaylist().then(() => {
        fetchRecommendations();
        nextTick(() => setupStickyObserver());
      });
    }
  },
  { immediate: false },
);

// Re-fetch playlist when songs are added/removed from other components (popover, context menu)
watch(sidebarRefreshKey, () => {
  if (route.params.id) fetchPlaylist();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
