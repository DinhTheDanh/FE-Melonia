<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-[100] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/70" @click="$emit('close')"></div>

    <!-- Modal -->
    <div
      class="relative bg-[#282828] rounded-lg w-[350px] max-h-[480px] flex flex-col shadow-2xl z-10"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 class="text-lg font-bold text-white">
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
      <div class="px-5 pb-3">
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
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          @click="createNewPlaylist"
        >
          <div
            class="w-12 h-12 bg-[#3E3E3E] rounded-md flex items-center justify-center shrink-0"
          >
            <UIcon name="i-lucide-plus" class="size-6 text-neutral-300" />
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
          class="flex items-center justify-center py-8 text-neutral-400"
        >
          <UIcon name="i-lucide-loader-2" class="size-5 animate-spin" />
        </div>

        <!-- Playlists -->
        <template v-else>
          <button
            v-for="playlist in filteredPlaylists"
            :key="playlist.PlaylistId || playlist.Id"
            class="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            @click="addToPlaylist(playlist)"
          >
            <div
              class="w-12 h-12 bg-[#3E3E3E] rounded-md flex items-center justify-center shrink-0 overflow-hidden"
            >
              <img
                v-if="playlist.Thumbnail"
                :src="playlist.Thumbnail"
                :alt="playlist.Title"
                class="w-full h-full object-cover"
              />
              <UIcon
                v-else
                name="i-lucide-music"
                class="size-5 text-neutral-400"
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
  </div>
</template>

<script setup>
import interactionApi from "~/api/interactionApi";
import musicApi from "~/api/musicApi";

const props = defineProps({
  songId: { type: [String, Number], required: true },
  songTitle: { type: String, default: "" },
});

const emit = defineEmits(["close"]);
const { t } = useI18n();
const toast = useToast();

const searchQuery = ref("");
const playlists = ref([]);
const isLoading = ref(true);

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
  } catch (error) {
    console.error("Error fetching playlists:", error);
  } finally {
    isLoading.value = false;
  }
};

const addToPlaylist = async (playlist) => {
  try {
    const playlistId = playlist.PlaylistId || playlist.Id;
    await interactionApi.addSongToPlaylist({
      playlistId,
      songId: props.songId,
    });
    toast.add({
      title: t("notify.success"),
      description: t("playlist.song_added", {
        playlist: playlist.Title || playlist.Name,
      }),
      color: "green",
    });
    emit("close");
  } catch (error) {
    console.error("Error adding to playlist:", error);
    toast.add({
      title: t("notify.error"),
      description: t("playlist.add_error"),
      color: "red",
    });
  }
};

const createNewPlaylist = async () => {
  try {
    const res = await interactionApi.createPlaylist({
      Title: props.songTitle
        ? `${t("playlist.my_playlist")} #${playlists.value.length + 1}`
        : `${t("playlist.my_playlist")} #${playlists.value.length + 1}`,
    });

    // After creating, add the song to it
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
    emit("close");
  } catch (error) {
    console.error("Error creating playlist:", error);
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
