<template>
  <div ref="containerRef" class="relative inline-block">
    <!-- Trigger Button -->
    <slot :toggle="toggleMenu">
      <button
        class="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        @click.stop="toggleMenu"
      >
        <UIcon name="i-lucide-more-horizontal" class="size-5" />
      </button>
    </slot>

    <!-- Dropdown Menu -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          ref="menuRef"
          class="fixed w-64 bg-[#282828] border border-white/5 shadow-xl rounded-md py-1 z-[9999]"
          :style="menuStyle"
          @click.stop
        >
          <!-- Add to Playlist - with submenu -->
          <div
            v-if="showAddToPlaylist"
            class="relative"
            @mouseenter="showPlaylistSubmenu = true"
            @mouseleave="showPlaylistSubmenu = false"
          >
            <button
              class="flex items-center justify-between w-full px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-plus" class="size-4 text-gray-400" />
                <span>{{ t("playlist.add_to_playlist") }}</span>
              </div>
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4 text-gray-400"
              />
            </button>

            <!-- Submenu for playlists -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="showPlaylistSubmenu"
                class="absolute right-full top-0 mr-1 w-64 bg-[#282828] border border-white/5 rounded-md shadow-xl py-1 z-[10000]"
              >
                <!-- Search in submenu -->
                <div class="px-3 py-2">
                  <UInput
                    v-model="playlistSearch"
                    icon="i-lucide-search"
                    size="sm"
                    :placeholder="t('playlist.search_playlist')"
                    class="w-full"
                    :ui="{
                      base: 'bg-[#3E3E3E] border-none text-white placeholder-neutral-400 text-sm',
                    }"
                    @click.stop
                  />
                </div>

                <!-- Create New Playlist -->
                <button
                  class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  @click.stop="createNewPlaylistAndAdd"
                >
                  <UIcon name="i-lucide-plus" class="size-4 text-gray-400" />
                  <span>{{ t("playlist.create_new") }}</span>
                </button>

                <div class="h-px bg-white/10 my-1"></div>

                <!-- Playlist List -->
                <div class="max-h-48 overflow-y-auto">
                  <div
                    v-if="isLoadingPlaylists"
                    class="flex items-center justify-center py-4"
                  >
                    <UIcon
                      name="i-lucide-loader-2"
                      class="size-4 text-gray-400 animate-spin"
                    />
                  </div>
                  <template v-else>
                    <button
                      v-for="playlist in filteredPlaylists"
                      :key="playlist.PlaylistId || playlist.Id"
                      class="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      @click.stop="addToPlaylist(playlist)"
                    >
                      <div
                        class="w-8 h-8 bg-[#3E3E3E] rounded flex items-center justify-center shrink-0 overflow-hidden"
                      >
                        <img
                          v-if="getSubmenuThumb(playlist)"
                          :src="getSubmenuThumb(playlist)"
                          class="w-full h-full object-cover"
                        />
                        <UIcon
                          v-else
                          name="i-lucide-music"
                          class="size-4 text-neutral-400"
                        />
                      </div>
                      <span class="truncate">{{
                        playlist.Title || playlist.Name
                      }}</span>
                    </button>
                    <p
                      v-if="filteredPlaylists.length === 0"
                      class="text-xs text-neutral-400 text-center py-3"
                    >
                      {{ t("playlist.no_playlists") }}
                    </p>
                  </template>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Save to Liked Songs -->
          <button
            v-if="showLikeOption"
            class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            @click.stop="handleToggleLike"
          >
            <UIcon
              :name="isLiked ? 'i-lucide-heart-off' : 'i-lucide-heart'"
              class="size-4 text-gray-400"
            />
            <span>{{
              isLiked ? t("song.remove_from_liked") : t("song.add_to_liked")
            }}</span>
          </button>

          <!-- Add to / Remove from Queue -->
          <button
            v-if="showAddToQueue"
            class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            @click.stop="isInQueue ? handleRemoveFromQueue() : addToQueue()"
          >
            <UIcon
              :name="isInQueue ? 'i-lucide-list-minus' : 'i-lucide-list-plus'"
              class="size-4 text-gray-400"
            />
            <span>{{
              isInQueue
                ? t("playlist.remove_from_queue")
                : t("playlist.add_to_queue")
            }}</span>
          </button>

          <div class="h-px bg-white/10 my-1"></div>

          <!-- Go to Artist - with submenu if multiple artists -->
          <div
            v-if="showGoToArtist && hasArtist"
            class="relative"
            @mouseenter="showArtistSubmenu = true"
            @mouseleave="showArtistSubmenu = false"
          >
            <button
              class="flex items-center justify-between w-full px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              @click.stop="artistList.length === 1 && goToArtist(artistList[0])"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-user" class="size-4 text-gray-400" />
                <span>{{ t("song.go_to_artist") }}</span>
              </div>
              <UIcon
                v-if="artistList.length > 1"
                name="i-lucide-chevron-right"
                class="size-4 text-gray-400"
              />
            </button>

            <!-- Submenu for multiple artists -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="showArtistSubmenu && artistList.length > 1"
                class="absolute right-full top-0 mr-1 w-48 bg-[#282828] border border-white/5 rounded-md shadow-xl py-1 z-[10000]"
              >
                <button
                  v-for="artist in artistList"
                  :key="artist.id"
                  class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  @click.stop="goToArtist(artist)"
                >
                  <span class="truncate">{{ artist.name }}</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Go to Album -->
          <button
            v-if="showGoToAlbum && hasAlbum"
            class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            @click.stop="goToAlbum"
          >
            <UIcon name="i-lucide-disc" class="size-4 text-gray-400" />
            <span>{{ t("song.go_to_album") }}</span>
          </button>

          <!-- View Credits -->
          <button
            v-if="showViewCredits"
            class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            @click.stop="viewCredits"
          >
            <UIcon name="i-lucide-scroll-text" class="size-4 text-gray-400" />
            <span>{{ t("song.view_credits") }}</span>
          </button>

          <!-- Separator before owner actions -->
          <template v-if="isOwner && (showEdit || showDelete)">
            <div class="h-px bg-white/10 my-1"></div>

            <!-- Edit Song -->
            <button
              v-if="showEdit"
              class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              @click.stop="editSong"
            >
              <UIcon name="i-lucide-pencil" class="size-4 text-gray-400" />
              <span>{{ t("song.edit") }}</span>
            </button>

            <!-- Delete Song -->
            <button
              v-if="showDelete"
              class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors cursor-pointer"
              @click.stop="deleteSong"
            >
              <UIcon name="i-lucide-trash-2" class="size-4" />
              <span>{{ t("song.delete") }}</span>
            </button>
          </template>

          <!-- Remove from playlist (for playlist page) -->
          <template v-if="showRemoveFromPlaylist">
            <div class="h-px bg-white/10 my-1"></div>
            <button
              class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors cursor-pointer"
              @click.stop="removeFromPlaylist"
            >
              <UIcon name="i-lucide-x-circle" class="size-4" />
              <span>{{ t("playlist.remove_from_playlist") }}</span>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { useLikedSongsStore } from "~/stores/useLikedSongsStore";
import { usePlayerStore } from "~/stores/usePlayerStore";
import musicApi from "~/api/musicApi";
import interactionApi from "~/api/interactionApi";

const props = defineProps({
  song: { type: Object, required: true },
  // Feature flags
  showAddToPlaylist: { type: Boolean, default: true },
  showLikeOption: { type: Boolean, default: true },
  showAddToQueue: { type: Boolean, default: true },
  showGoToArtist: { type: Boolean, default: true },
  showGoToAlbum: { type: Boolean, default: true },
  showViewCredits: { type: Boolean, default: false },

  showEdit: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
  showRemoveFromPlaylist: { type: Boolean, default: false },
  // Context
  playlistId: { type: [String, Number], default: null },
  // Owner check
  isOwner: { type: Boolean, default: false },
});

const emit = defineEmits([
  "unlike",
  "edit",
  "delete",
  "removed-from-playlist",
  "added-to-queue",
]);

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const likedSongsStore = useLikedSongsStore();
const playerStore = usePlayerStore();

// Refs
const containerRef = ref(null);
const menuRef = ref(null);

// State
const isOpen = ref(false);
const menuStyle = ref({});
const showPlaylistSubmenu = ref(false);
const showArtistSubmenu = ref(false);

const playlistSearch = ref("");
const playlists = ref([]);
const isLoadingPlaylists = ref(false);
const songInPlaylistIds = ref(new Set());

// Toggle menu & position calculation
const toggleMenu = () => {
  if (isOpen.value) {
    closeMenu();
    return;
  }
  calculatePosition();
  isOpen.value = true;
};

const calculatePosition = () => {
  if (!containerRef.value) return;
  const trigger =
    containerRef.value.querySelector("button") || containerRef.value;
  const rect = trigger.getBoundingClientRect();
  const menuWidth = 256; // w-64 = 16rem = 256px
  const menuHeight = 300; // approximate max height
  const padding = 4;

  let top = rect.bottom + padding;
  let left = rect.left;

  // If menu would overflow bottom, show above the trigger
  if (top + menuHeight > window.innerHeight) {
    top = Math.max(padding, rect.top - menuHeight - padding);
  }
  // Clamp to viewport
  if (top < padding) top = padding;
  if (top + menuHeight > window.innerHeight) {
    top = window.innerHeight - menuHeight - padding;
  }

  // If menu would overflow right
  if (left + menuWidth > window.innerWidth) {
    left = window.innerWidth - menuWidth - padding;
  }
  // If menu would overflow left
  if (left < 0) left = padding;

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
};

const closeMenu = () => {
  isOpen.value = false;
  showPlaylistSubmenu.value = false;
  showArtistSubmenu.value = false;
  playlistSearch.value = "";
  // Reset so next open re-checks song membership
  songInPlaylistIds.value = new Set();
  playlists.value = [];
};

// Click outside to close
const handleClickOutside = (e) => {
  if (!isOpen.value) return;
  if (containerRef.value?.contains(e.target)) return;
  if (menuRef.value?.contains(e.target)) return;
  closeMenu();
};

// Escape to close
const handleEscape = (e) => {
  if (e.key === "Escape" && isOpen.value) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside, true);
  document.removeEventListener("keydown", handleEscape);
});

// Computed
const songId = computed(() => props.song?.Id || props.song?.SongId);
const songTitle = computed(() => props.song?.Title || "");

const isLiked = computed(() => likedSongsStore.isLiked(songId.value));

const hasAlbum = computed(() => !!props.song?.AlbumId);

const isInQueue = computed(() => {
  const id = songId.value;
  if (!id) return false;
  return playerStore.queue.some(
    (t, idx) =>
      idx !== playerStore.queueIndex && (t.Id === id || t.SongId === id),
  );
});

const hasArtist = computed(() => props.song?.ArtistId || props.song?.ArtistIds);

const artistList = computed(() => {
  const artists = [];

  // Single artist
  if (props.song?.ArtistId) {
    artists.push({
      id: props.song.ArtistId,
      name:
        props.song.ArtistName ||
        (Array.isArray(props.song.ArtistNames)
          ? props.song.ArtistNames[0]
          : props.song.ArtistNames?.split(",")[0]?.trim()) ||
        "Artist",
    });
  }

  // Multiple artists from ArtistIds
  if (props.song?.ArtistIds) {
    const rawIds = props.song.ArtistIds;
    const ids = Array.isArray(rawIds) ? rawIds : String(rawIds).split(",");
    const rawNames = props.song.ArtistNames || "";
    const names = Array.isArray(rawNames)
      ? rawNames
      : String(rawNames).split(",");
    ids.forEach((id, idx) => {
      const idStr = String(id).trim();
      if (!artists.find((a) => String(a.id) === idStr)) {
        artists.push({
          id: idStr,
          name:
            (Array.isArray(rawNames) ? names[idx] : names[idx]?.trim()) ||
            "Artist",
        });
      }
    });
  }

  return artists;
});

const filteredPlaylists = computed(() => {
  let list = playlists.value.filter(
    (p) => !songInPlaylistIds.value.has(String(p.PlaylistId || p.Id)),
  );
  if (playlistSearch.value) {
    const q = playlistSearch.value.toLowerCase();
    list = list.filter((p) =>
      (p.Title || p.Name || "").toLowerCase().includes(q),
    );
  }
  return list;
});

// Methods
// Sidebar refresh signal
const sidebarRefreshKey = useState("sidebarRefreshKey", () => 0);

// Thumbnail overrides (shared with sidebar)
const playlistThumbnailOverrides = useState(
  "playlistThumbnailOverrides",
  () => ({}),
);

// Filter dicebear thumbnails in submenu
const getSubmenuThumb = (playlist) => {
  const id = playlist?.PlaylistId || playlist?.Id;
  if (id && playlistThumbnailOverrides.value[id]) {
    return playlistThumbnailOverrides.value[id];
  }
  const thumb = playlist?.Thumbnail;
  if (!thumb) return null;
  if (thumb.includes("dicebear")) return null;
  return thumb;
};

const fetchPlaylists = async () => {
  if (playlists.value.length > 0) {
    // Already fetched, just re-check song membership
    await checkSongInPlaylists();
    return;
  }
  isLoadingPlaylists.value = true;
  try {
    const res = await musicApi.getMyPlaylists({ pageIndex: 1, pageSize: 50 });
    playlists.value = res.Data || res || [];
    await checkSongInPlaylists();
  } catch (error) {
    console.error("Failed to fetch playlists:", error);
  } finally {
    isLoadingPlaylists.value = false;
  }
};

// Check which playlists already contain the current song
const checkSongInPlaylists = async () => {
  const currentSongId = String(songId.value);
  const ids = new Set();
  const checks = playlists.value.map(async (playlist) => {
    try {
      const id = playlist.PlaylistId || playlist.Id;
      const res = await interactionApi.getPlaylistDetails(id, {
        pageIndex: 1,
        pageSize: 200,
      });
      const songs = res?.Songs?.Data || res?.songs?.data || res?.Data || [];
      const found = songs.some(
        (s) => String(s.Id || s.SongId) === currentSongId,
      );
      if (found) {
        ids.add(String(id));
      }
    } catch (e) {
      // Ignore
    }
  });
  await Promise.all(checks);
  songInPlaylistIds.value = ids;
};

const addToPlaylist = async (playlist) => {
  try {
    const playlistId = playlist.PlaylistId || playlist.Id;
    await interactionApi.addSongToPlaylist({
      playlistId,
      songId: songId.value,
    });
    // Mark this playlist as containing the song so it's filtered out
    songInPlaylistIds.value.add(String(playlistId));
    songInPlaylistIds.value = new Set(songInPlaylistIds.value);
    toast.add({
      title: t("notify.success"),
      description: t("playlist.song_added", {
        playlist: playlist.Title || playlist.Name,
      }),
      color: "green",
    });
    sidebarRefreshKey.value++;
    closeMenu();
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: t("playlist.add_error"),
      color: "red",
    });
  }
};

const createNewPlaylistAndAdd = async () => {
  try {
    const res = await interactionApi.createPlaylist({
      Title: `${t("playlist.my_playlist")} #${playlists.value.length + 1}`,
    });
    const newPlaylist = res.Data || res;
    const playlistId = newPlaylist.PlaylistId || newPlaylist.Id;

    if (playlistId) {
      await interactionApi.addSongToPlaylist({
        playlistId,
        songId: songId.value,
      });
    }

    toast.add({
      title: t("notify.success"),
      description: t("playlist.created_and_added"),
      color: "green",
    });
    sidebarRefreshKey.value++;
    closeMenu();
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: t("playlist.create_error"),
      color: "red",
    });
  }
};

const handleToggleLike = async () => {
  const wasLiked = isLiked.value;
  const success = await likedSongsStore.toggleLike(songId.value);
  if (success) {
    toast.add({
      title: t("notify.success"),
      description: wasLiked
        ? t("song.removed_from_liked")
        : t("song.added_to_liked"),
      color: "green",
    });
    if (wasLiked) {
      emit("unlike", props.song);
    }
  }
  closeMenu();
};

const addToQueue = () => {
  playerStore.addToQueue(props.song);
  toast.add({
    title: t("notify.success"),
    description: t("playlist.added_to_queue"),
    color: "green",
  });
  emit("added-to-queue", props.song);
  closeMenu();
};

const handleRemoveFromQueue = () => {
  const id = songId.value;
  const idx = playerStore.queue.findIndex(
    (t, i) => i !== playerStore.queueIndex && (t.Id === id || t.SongId === id),
  );
  if (idx !== -1) {
    playerStore.removeFromQueue(idx);
    toast.add({
      title: t("notify.success"),
      description: t("playlist.removed_from_queue"),
      color: "green",
    });
  }
  closeMenu();
};

const goToArtist = (artist) => {
  if (artist?.id) {
    router.push(`/artist/${artist.id}`);
  }
  closeMenu();
};

const goToAlbum = () => {
  if (props.song?.AlbumId) {
    router.push(`/user/my-albums/${props.song.AlbumId}`);
  }
  closeMenu();
};

const viewCredits = () => {
  // Emit event to show credits modal
  closeMenu();
};

const editSong = () => {
  emit("edit", props.song);
  closeMenu();
};

const deleteSong = () => {
  emit("delete", props.song);
  closeMenu();
};

const removeFromPlaylist = async () => {
  if (!props.playlistId) return;
  try {
    await interactionApi.removeSongFromPlaylist({
      playlistId: props.playlistId,
      songId: songId.value,
    });
    toast.add({
      title: t("notify.success"),
      description: t("playlist.song_removed"),
      color: "green",
    });
    emit("removed-from-playlist", props.song);
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: t("playlist.remove_error"),
      color: "red",
    });
  }
  closeMenu();
};

// Watch for submenu open to fetch playlists
watch(showPlaylistSubmenu, (val) => {
  if (val) {
    fetchPlaylists();
  }
});
</script>
