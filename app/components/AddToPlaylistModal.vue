<template>
  <!-- Click-outside backdrop (transparent) -->
  <Teleport to="body">
    <div class="fixed inset-0 z-[100]" @click="$emit('close')"></div>

    <!-- Popover positioned above trigger -->
    <div
      ref="popoverRef"
      class="fixed z-[101] bg-[#282828] rounded-lg w-[350px] max-h-[420px] flex flex-col shadow-2xl"
      :style="popoverStyle"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 class="text-base font-bold text-white">
          {{ t("playlist.add_to_playlist") }}
        </h3>
        <button
          class="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          @click="$emit('close')"
        >
          <UIcon name="i-lucide-x" class="size-5" />
        </button>
      </div>

      <!-- Search -->
      <div class="px-4 pb-2">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          size="sm"
          variant="outline"
          :placeholder="t('playlist.search_playlist')"
          class="w-full"
          :ui="{
            base: 'bg-[#3E3E3E] border-none text-white placeholder-neutral-400',
          }"
        />
      </div>

      <!-- Create New Playlist -->
      <div class="px-2">
        <button
          class="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          @click="createNewPlaylist"
        >
          <div
            class="w-10 h-10 bg-[#3E3E3E] rounded flex items-center justify-center shrink-0"
          >
            <UIcon name="i-lucide-plus" class="size-5 text-neutral-300" />
          </div>
          <span class="text-sm font-semibold text-white">
            {{ t("playlist.create_new") }}
          </span>
        </button>
      </div>

      <!-- Playlist List -->
      <div class="flex-1 overflow-y-auto px-2 pb-3 mt-1">
        <!-- Loading -->
        <div
          v-if="isLoading"
          class="flex items-center justify-center py-6 text-neutral-400"
        >
          <UIcon name="i-lucide-loader-2" class="size-5 animate-spin" />
        </div>

        <!-- Playlists -->
        <template v-else>
          <!-- Liked Songs row -->
          <button
            v-if="!searchQuery"
            class="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            @click="toggleLike"
          >
            <div
              class="w-10 h-10 rounded flex items-center justify-center shrink-0"
              style="background: linear-gradient(135deg, #450af5, #c4efd9)"
            >
              <UIcon name="i-lucide-heart" class="size-4 text-white" />
            </div>
            <div class="flex-1 min-w-0 text-left">
              <p class="text-sm font-medium text-white truncate">
                {{ t("sidebar.liked_songs") }}
              </p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <UIcon name="i-lucide-pin" class="size-3.5 text-primary" />
              <span
                v-if="isSongLiked"
                class="flex items-center justify-center w-5 h-5 rounded-full bg-primary"
              >
                <UIcon name="i-lucide-check" class="size-3.5 text-black" />
              </span>
              <span
                v-else
                class="flex items-center justify-center w-5 h-5 rounded-full border border-neutral-500"
              />
            </div>
          </button>

          <!-- User Playlists -->
          <button
            v-for="playlist in filteredPlaylists"
            :key="playlist.PlaylistId || playlist.Id"
            class="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            @click="togglePlaylist(playlist)"
          >
            <div
              class="w-10 h-10 bg-[#3E3E3E] rounded flex items-center justify-center shrink-0 overflow-hidden"
            >
              <img
                v-if="getPlaylistThumb(playlist)"
                :src="getPlaylistThumb(playlist)"
                :alt="playlist.Title"
                class="w-full h-full object-cover"
              />
              <UIcon
                v-else
                name="i-lucide-music"
                class="size-4 text-neutral-400"
              />
            </div>
            <div class="flex-1 min-w-0 text-left">
              <p class="text-sm font-medium text-white truncate">
                {{ playlist.Title || playlist.Name }}
              </p>
              <p class="text-xs text-neutral-400">
                {{ t("playlist.playlist_label") }}
              </p>
            </div>
            <!-- Green check if song is in this playlist -->
            <span
              v-if="
                addedPlaylistIds.has(String(playlist.PlaylistId || playlist.Id))
              "
              class="flex items-center justify-center w-5 h-5 rounded-full bg-primary shrink-0"
            >
              <UIcon name="i-lucide-check" class="size-3.5 text-black" />
            </span>
            <span
              v-else
              class="flex items-center justify-center w-5 h-5 rounded-full border border-neutral-500 shrink-0"
            />
          </button>

          <!-- Empty State -->
          <p
            v-if="filteredPlaylists.length === 0 && !isLoading"
            class="text-sm text-neutral-400 text-center py-6"
          >
            {{ t("playlist.no_playlists") }}
          </p>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import interactionApi from "~/api/interactionApi";
import musicApi from "~/api/musicApi";
import { useLikedSongsStore } from "~/stores/useLikedSongsStore";

const props = defineProps({
  songId: { type: [String, Number], required: true },
  songTitle: { type: String, default: "" },
  triggerRect: { type: Object, default: null },
});

const emit = defineEmits(["close"]);
const { t } = useI18n();
const toast = useToast();
const likedSongsStore = useLikedSongsStore();
const popoverRef = ref(null);

// Sidebar refresh signal
const sidebarRefreshKey = useState("sidebarRefreshKey", () => 0);

// Thumbnail overrides (shared with sidebar)
const playlistThumbnailOverrides = useState(
  "playlistThumbnailOverrides",
  () => ({}),
);

const searchQuery = ref("");
const playlists = ref([]);
const isLoading = ref(true);

// Track which playlists the song was added to (shows green check)
const addedPlaylistIds = ref(new Set());

// Position popover above the trigger, left-aligned (extends to right)
const popoverStyle = computed(() => {
  if (props.triggerRect) {
    const popoverW = 350;
    // Left-align with trigger button
    let left = props.triggerRect.left;
    let bottom = window.innerHeight - props.triggerRect.top + 8;

    // Clamp to viewport
    if (left < 8) left = 8;
    if (left + popoverW > window.innerWidth - 8)
      left = window.innerWidth - popoverW - 8;

    return {
      left: `${left}px`,
      bottom: `${bottom}px`,
    };
  }
  // Fallback: above the player bar
  return {
    left: "16px",
    bottom: "100px",
  };
});

const isSongLiked = computed(() => likedSongsStore.isLiked(props.songId));

const getPlaylistThumb = (playlist) => {
  const id = playlist?.PlaylistId || playlist?.Id;
  if (id && playlistThumbnailOverrides.value[id]) {
    return playlistThumbnailOverrides.value[id];
  }
  const thumb = playlist?.Thumbnail;
  if (!thumb) return null;
  if (thumb.includes("dicebear")) return null;
  return thumb;
};

const filteredPlaylists = computed(() => {
  if (!searchQuery.value) return playlists.value;
  const q = searchQuery.value.toLowerCase();
  return playlists.value.filter((p) =>
    (p.Title || p.Name || "").toLowerCase().includes(q),
  );
});

const fetchPlaylists = async () => {
  isLoading.value = true;
  try {
    const res = await musicApi.getMyPlaylists({
      pageIndex: 1,
      pageSize: 50,
    });
    playlists.value = res.Data || res || [];

    // Pre-check which playlists already contain the song
    await checkExistingSong();
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

// Check which playlists already contain the current song
const checkExistingSong = async () => {
  const checks = playlists.value.map(async (playlist) => {
    try {
      const id = playlist.PlaylistId || playlist.Id;
      const res = await interactionApi.getPlaylistDetails(id, {
        pageIndex: 1,
        pageSize: 200,
      });
      const songs = res?.Songs?.Data || res?.songs?.data || [];
      const found = songs.some(
        (s) => String(s.Id || s.SongId) === String(props.songId),
      );
      if (found) {
        addedPlaylistIds.value.add(String(id));
      }
    } catch (e) {
      // Ignore errors for individual playlists
    }
  });
  await Promise.all(checks);
};

const toggleLike = async () => {
  await likedSongsStore.toggleLike(props.songId);
  if (likedSongsStore.isLiked(props.songId)) {
    toast.add({
      title: t("notify.success"),
      description: t("song.add_to_liked"),
      color: "green",
    });
  } else {
    toast.add({
      title: t("notify.success"),
      description: t("song.remove_from_liked"),
      color: "green",
    });
  }
  sidebarRefreshKey.value++;
};

// Toggle song in a playlist (add if not present, remove if present)
const togglePlaylist = async (playlist) => {
  const playlistId = String(playlist.PlaylistId || playlist.Id);

  if (addedPlaylistIds.value.has(playlistId)) {
    // Already in playlist → remove
    try {
      await interactionApi.removeSongFromPlaylist(playlistId, props.songId);
      addedPlaylistIds.value.delete(playlistId);
      // Force reactivity update
      addedPlaylistIds.value = new Set(addedPlaylistIds.value);
      toast.add({
        title: t("notify.success"),
        description: t("playlist.song_removed"),
        color: "green",
      });
      sidebarRefreshKey.value++;
    } catch (error) {
      toast.add({
        title: t("notify.error"),
        description: t("playlist.remove_error"),
        color: "red",
      });
    }
  } else {
    // Not in playlist → add
    try {
      await interactionApi.addSongToPlaylist({
        playlistId,
        songId: props.songId,
      });
      addedPlaylistIds.value.add(playlistId);
      // Force reactivity update
      addedPlaylistIds.value = new Set(addedPlaylistIds.value);
      toast.add({
        title: t("notify.success"),
        description: t("playlist.song_added", {
          playlist: playlist.Title || playlist.Name,
        }),
        color: "green",
      });
      sidebarRefreshKey.value++;
    } catch (error) {
      toast.add({
        title: t("notify.error"),
        description: t("playlist.add_error"),
        color: "red",
      });
    }
  }
};

const createNewPlaylist = async () => {
  try {
    const res = await interactionApi.createPlaylist({
      Title: props.songTitle
        ? `${t("playlist.my_playlist")} #${playlists.value.length + 1}`
        : `${t("playlist.my_playlist")} #${playlists.value.length + 1}`,
    });

    const newPlaylist = res.Data || res;
    const playlistId = newPlaylist.PlaylistId || newPlaylist.Id;

    if (playlistId) {
      await interactionApi.addSongToPlaylist({
        playlistId,
        songId: props.songId,
      });
    }

    toast.add({
      title: t("notify.success"),
      description: t("playlist.created_and_added"),
      color: "green",
    });
    sidebarRefreshKey.value++;
    emit("close");
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: t("playlist.create_error"),
      color: "red",
    });
  }
};

onMounted(() => {
  fetchPlaylists();
});
</script>
