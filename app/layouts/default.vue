<template>
  <div class="flex h-screen bg-black text-white overflow-hidden">
    <header
      class="fixed top-0 right-0 left-0 h-16 flex items-center bg-black justify-between px-8 z-50"
    >
      <div class="flex items-center justify-center gap-2">
        <!-- <img
          src="../assets/image/logo-cropped.svg"
          alt="logo"
          class="bg-no-repeat h-8 w-20"
        /> -->
        <NuxtLink
          to="/"
          class="p-2.5 bg-[#1F1F1F] rounded-full flex items-center justify-center hover:bg-neutral-700 cursor-pointer"
        >
          <UIcon
            :name="
              route.path == '/' ? 'i-fa6-solid-house' : 'i-fa6-solid-house'
            "
            class="size-6"
          />
        </NuxtLink>
        <div class="flex items-center bg-[#1F1F1F] rounded-full w-100">
          <UInput
            icon="i-lucide-search"
            size="md"
            variant="ghost"
            class="w-full"
            :ui="{ base: 'hover:bg-transparent focus:bg-transparent' }"
            :placeholder="t('header.search_placeholder')"
          />
          <USeparator orientation="vertical" size="xs" class="h-7" />
          <NuxtLink
            to="/search"
            class="p-2.5 flex items-center justify-center cursor-pointer"
          >
            <UIcon
              :name="
                route.path == '/search'
                  ? 'i-fa6-solid-box-archive'
                  : 'i-lucide-archive'
              "
              class="size-6"
            />
          </NuxtLink>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <UIcon
          name="i-lucide-bell"
          class="size-5 cursor-pointer hover:text-white/80"
        />
        <UDropdownMenu
          :arrow="true"
          :trigger="'click'"
          :placement="'bottom-end'"
          :items="dropdownItems"
          :ui="{
            content: 'w-52 bg-[#282828] border-none shadow-xl p-1',
            item: 'flex items-center gap-2 px-3 py-2.5 text-sm text-gray-200 hover:bg-white/10 hover:text-white rounded-sm cursor-pointer transition-colors',
            itemLeadingIcon: 'size-4 text-gray-400 shrink-0',
          }"
        >
          <UTooltip
            arrow
            :text="data?.FullName"
            :ui="{ content: 'bg-[#1F1F1F]' }"
          >
            <UAvatar
              :src="data?.Avatar"
              :alt="data?.FullName"
              size="md"
              class="cursor-pointer ring-2 ring-transparent hover:ring-white/20 transition-all"
            />
          </UTooltip>
        </UDropdownMenu>
      </div>
    </header>

    <UDashboardGroup
      class="flex-1 bg-black mx-2 rounded-lg mt-16 mb-[90px] h-[calc(100vh-64px-90px)] gap-2"
    >
      <UDashboardSidebar
        collapsible
        resizable
        v-model:collapsed="collapsed"
        :min-size="22"
        :max-size="23"
        :collapsed-size="7"
        class="group border-none bg-[#121212] rounded-lg h-full"
      >
        <template #header>
          <div class="!h-0 !min-h-0 !p-0 !m-0 overflow-hidden"></div>
        </template>

        <template #resize-handle="{ onMouseDown, onTouchStart, onDoubleClick }">
          <UDashboardResizeHandle
            class="after:absolute after:inset-y-0 after:right-0 after:w-px hover:after:bg-(--ui-border-accented) after:transition"
            @mousedown="onMouseDown"
            @touchstart="onTouchStart"
            @dblclick="onDoubleClick"
          />
        </template>

        <!-- Sidebar Content -->
        <div class="flex flex-col h-full overflow-hidden">
          <template v-if="collapsed">
            <div class="flex flex-col items-center pt-3 px-1 gap-2">
              <!-- Library icon -->
              <button
                class="p-1.5 transition-colors cursor-pointer text-zinc-400 hover:text-white"
                @click="collapsed = false"
              >
                <UIcon name="i-lucide-library-big" class="size-8" />
              </button>
              <!-- Plus button -->
              <button
                class="p-1.5 transition-colors flex items-center justify-center rounded-full cursor-pointer text-zinc-400 hover:text-white hover:bg-white/10 bg-white/7"
                @click="handleCreatePlaylist"
              >
                <UIcon name="i-lucide-plus" class="size-7" />
              </button>
            </div>

            <!-- Collapsed items list -->
            <div
              class="flex-1 overflow-y-auto flex flex-col items-center gap-0.5 px-1 pt-3 scrollbar-hide"
            >
              <!-- Liked Songs -->
              <UTooltip
                v-if="likedSongsStore.totalCount > 0"
                :text="t('sidebar.liked_songs')"
                arrow
                :ui="{ content: 'bg-[#282828]' }"
                :side="'right'"
              >
                <NuxtLink
                  to="/user/liked-songs"
                  class="block p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  :class="{ 'bg-white/10': route.path === '/user/liked-songs' }"
                >
                  <div
                    class="w-12 h-12 rounded flex items-center justify-center"
                    style="
                      background: linear-gradient(135deg, #450af5, #c4efd9);
                    "
                  >
                    <UIcon name="i-lucide-heart" class="size-3.5 text-white" />
                  </div>
                </NuxtLink>
              </UTooltip>

              <!-- Playlists -->
              <UTooltip
                v-for="playlist in userPlaylists"
                :key="playlist.PlaylistId || playlist.Id"
                :text="playlist.Title || playlist.Name"
                arrow
                :ui="{ content: 'bg-[#282828]' }"
                :side="'right'"
              >
                <NuxtLink
                  :to="`/playlist/${playlist.PlaylistId || playlist.Id}`"
                  class="block p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  :class="{
                    'bg-white/10':
                      route.path ===
                      `/playlist/${playlist.PlaylistId || playlist.Id}`,
                  }"
                >
                  <div
                    class="w-12 h-12 bg-[#282828] rounded flex items-center justify-center overflow-hidden"
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
                      class="size-5 text-neutral-400"
                    />
                  </div>
                </NuxtLink>
              </UTooltip>
            </div>
          </template>

          <template v-else>
            <!-- Library Header Row -->
            <div class="flex items-center justify-between px-4 pt-2 pb-1">
              <button
                class="flex items-center gap-2 cursor-pointer group/lib"
                @click="collapsed = true"
              >
                <UIcon
                  name="i-lucide-library-big"
                  class="size-6 text-zinc-400 group-hover/lib:text-white transition-colors"
                />
                <span
                  class="text-base font-bold text-zinc-400 group-hover/lib:text-white transition-colors"
                >
                  {{ t("sidebar.library") }}
                </span>
              </button>
              <div class="flex items-center gap-1">
                <UTooltip
                  :text="t('sidebar.create_playlist')"
                  arrow
                  :ui="{ content: 'bg-[#282828]' }"
                >
                  <button
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/7 hover:bg-white/15 cursor-pointer text-white text-sm font-semibold transition-colors"
                    @click.stop="handleCreatePlaylist"
                  >
                    <UIcon name="i-lucide-plus" class="size-4" />
                    {{ t("sidebar.create") }}
                  </button>
                </UTooltip>
              </div>
            </div>

            <!-- Scrollable Playlist List -->
            <div
              class="flex-1 overflow-y-auto px-2 pb-2 scrollbar-hide mt-4 gap-1 flex flex-col"
            >
              <!-- Liked Songs -->
              <NuxtLink
                v-if="
                  likedSongsStore.totalCount > 0 &&
                  (sidebarFilter === 'all' || sidebarFilter === 'playlists')
                "
                to="/user/liked-songs"
                class="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                :class="{ 'bg-white/10': route.path === '/user/liked-songs' }"
              >
                <div
                  class="w-12 h-12 rounded-sm flex items-center justify-center shrink-0"
                  style="background: linear-gradient(135deg, #450af5, #c4efd9)"
                >
                  <UIcon name="i-lucide-heart" class="size-4 text-white" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-white truncate">
                    {{ t("sidebar.liked_songs") }}
                  </p>
                  <p class="text-xs text-neutral-400 flex items-center gap-1">
                    <UIcon name="i-lucide-pin" class="size-3 text-green-500" />
                    {{ t("sidebar.playlist_label") }} ·
                    {{ likedSongsStore.totalCount }}
                    {{ t("sidebar.songs_label") }}
                  </p>
                </div>
              </NuxtLink>

              <!-- User Playlists -->
              <NuxtLink
                v-for="playlist in filteredPlaylists"
                :key="playlist.PlaylistId || playlist.Id"
                :to="`/playlist/${playlist.PlaylistId || playlist.Id}`"
                class="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer group/pl"
                :class="{
                  'bg-white/10':
                    route.path ===
                    `/playlist/${playlist.PlaylistId || playlist.Id}`,
                }"
              >
                <div
                  class="w-12 h-12 bg-[#282828] rounded flex items-center justify-center shrink-0 overflow-hidden"
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
                    class="size-5 text-neutral-400"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate text-white">
                    {{ playlist.Title || playlist.Name }}
                  </p>
                  <p
                    class="text-xs text-neutral-400 truncate flex items-center gap-1"
                  >
                    {{ t("sidebar.playlist_label") }} ·
                    {{ playlist.OwnerName || data?.FullName || "" }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </template>
        </div>
      </UDashboardSidebar>

      <div
        class="flex-1 overflow-y-auto bg-[#121212] rounded-lg h-full scrollbar-hide"
      >
        <slot />
      </div>
    </UDashboardGroup>

    <!-- Music Player Footer -->
    <MusicPlayer />
  </div>
</template>

<script setup>
import userApi from "~/api/userApi";
import musicApi from "~/api/musicApi";
import interactionApi from "~/api/interactionApi";
import { useLikedSongsStore } from "~/stores/useLikedSongsStore";
import { ref, onMounted, computed, watch } from "vue";

const route = useRoute();
const data = ref(null);
const toast = useToast();
const { t } = useI18n();
const { logout, user } = useAuth();
const likedSongsStore = useLikedSongsStore();

// Sidebar playlists
const userPlaylists = ref([]);

// Lấy độ rộng của sidebar trong storage
const { width } = useSidebarState();

// Check if user has artist/admin role
const isArtistOrAdmin = computed(() => {
  const role = user.value?.role;
  return role && role !== "User";
});

// Handle logout
const handleLogout = async () => {
  toast.add({
    title: t("notify.success"),
    description: t("notify.logout_success"),
    color: "green",
  });
  await logout();
};

// Dữ liệu của dropdown user (computed để reactive với role)
const dropdownItems = computed(() => {
  const baseItems = [
    {
      label: t("header.profile"),
      to: "/user/profile",
      icon: "i-lucide-user",
    },
    {
      label: t("song.my_music"),
      to: "/user/my-music",
      icon: "i-lucide-music",
    },
  ];

  // Only show these for artists/admins
  if (isArtistOrAdmin.value) {
    baseItems.push(
      {
        label: t("song.my_albums"),
        to: "/user/my-albums",
        icon: "i-lucide-disc",
      },
      {
        label: t("header.create_song"),
        to: "/create/song",
        icon: "i-lucide-plus-circle",
      },
    );
  }

  // Separator and common items
  baseItems.push(
    {
      type: "separator",
    },
    {
      label: t("header.settings"),
      to: "/user/settings",
      icon: "i-lucide-settings",
    },
    {
      type: "separator",
    },
    {
      label: t("header.logout"),
      icon: "i-lucide-log-out",
      onSelect: handleLogout,
    },
  );

  return baseItems;
});
const collapsed = ref(false); // trạng thái thu gọn sidebar
const sidebarFilter = ref("all"); // 'all' | 'playlists'
const sidebarSearch = ref(false);
const sidebarSearchQuery = ref("");
const sidebarSortOrder = ref("recent"); // 'recent' | 'alpha'

// Toggle sort order
const toggleSortOrder = () => {
  sidebarSortOrder.value =
    sidebarSortOrder.value === "recent" ? "alpha" : "recent";
};

// Filtered playlists based on search and filter
const filteredPlaylists = computed(() => {
  let list = userPlaylists.value;
  if (sidebarSearchQuery.value) {
    const q = sidebarSearchQuery.value.toLowerCase();
    list = list.filter((p) =>
      (p.Title || p.Name || "").toLowerCase().includes(q),
    );
  }
  if (sidebarSortOrder.value === "alpha") {
    list = [...list].sort((a, b) =>
      (a.Title || a.Name || "").localeCompare(b.Title || b.Name || ""),
    );
  }
  return list;
});

// Handle create new playlist
const handleCreatePlaylist = async () => {
  try {
    const playlistCount = userPlaylists.value.length + 1;
    const title = `${t("playlist.my_playlist")} #${playlistCount}`;
    const res = await interactionApi.createPlaylist({ Title: title });

    // Get the new playlist ID from response
    const newPlaylistId =
      res?.PlaylistId || res?.Id || res?.data?.PlaylistId || res?.data?.Id;

    toast.add({
      title: t("notify.success"),
      description: t("sidebar.playlist_created"),
      color: "green",
    });

    // Refresh playlists
    await fetchUserPlaylists();

    // Navigate to the new playlist page
    if (newPlaylistId) {
      await navigateTo(`/playlist/${newPlaylistId}`);
    }
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: t("playlist.create_error"),
      color: "red",
    });
  }
};

// Lấy dữ liệu user
const fetchUserData = async () => {
  try {
    const response = await userApi.getUserInfo();
    data.value = response;
  } catch (error) {}
};

onMounted(() => {
  fetchUserData();
  fetchUserPlaylists();
  // Load liked songs count for sidebar
  if (!likedSongsStore.isLoaded) {
    likedSongsStore.fetchLikedSongs();
  }
});

// Watch for sidebar refresh signal from playlist edit page
const sidebarRefreshKey = useState("sidebarRefreshKey", () => 0);
watch(sidebarRefreshKey, () => {
  fetchUserPlaylists();
});

// Shared state for locally updated thumbnails (when BE doesn't persist them)
const playlistThumbnailOverrides = useState(
  "playlistThumbnailOverrides",
  () => ({}),
);

// Helper: get real thumbnail (check local overrides first, filter dicebear)
const getPlaylistThumb = (playlist) => {
  const id = playlist?.PlaylistId || playlist?.Id;
  // Check local overrides first (from playlist edit page)
  if (id && playlistThumbnailOverrides.value[id]) {
    return playlistThumbnailOverrides.value[id];
  }
  const thumb = playlist?.Thumbnail;
  if (!thumb) return null;
  if (thumb.includes("dicebear")) return null;
  return thumb;
};

const fetchUserPlaylists = async () => {
  try {
    const res = await musicApi.getMyPlaylists({ pageIndex: 1, pageSize: 50 });
    userPlaylists.value = res.Data || res || [];
  } catch (error) {}
};
</script>

<style scoped>
/* Remove sidebar header height so content starts at top */
:deep([data-slot="header"]) {
  height: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  overflow: hidden;
}
</style>
