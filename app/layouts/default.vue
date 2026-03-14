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
        <div
          class="flex items-center rounded-full w-100 transition-all duration-200 border-2"
          :class="
            isSearchFocused
              ? 'bg-[#2A2A2A] border-white/30'
              : 'bg-[#1F1F1F] border-transparent hover:border-white/10'
          "
        >
          <UInput
            v-model="headerSearchQuery"
            icon="i-lucide-search"
            size="md"
            variant="ghost"
            class="w-full"
            :ui="{ base: 'hover:bg-transparent focus:bg-transparent' }"
            :placeholder="t('header.search_placeholder')"
            @keyup.enter="navigateToSearch"
            @input="debouncedSearch"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
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
        <!-- Notification Bell -->
        <div class="relative" ref="notifDropdownRef">
          <button
            class="relative p-2 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer group"
            @click="toggleNotifDropdown"
          >
            <UIcon
              name="i-lucide-bell"
              class="size-5 text-neutral-300 group-hover:text-white transition-colors"
            />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-5 h-5 flex items-center justify-center bg-[#1DB954] text-black text-[10px] font-extrabold rounded-full px-1 ring-2 ring-black"
            >
              {{ unreadCount > 99 ? "99+" : unreadCount }}
            </span>
          </button>
          <!-- Notification Dropdown -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="showNotifDropdown"
              class="absolute right-0 top-full mt-2.5 w-96 bg-[#1e1e1e] rounded-2xl shadow-2xl shadow-black/50 border border-white/8 overflow-hidden z-50"
            >
              <!-- Header -->
              <div
                class="flex items-center justify-between px-5 py-3.5 bg-[#252525]"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-bell" class="size-4 text-white" />
                  <h3 class="text-sm font-bold text-white">
                    {{ t("notification.title") }}
                  </h3>
                  <span
                    v-if="unreadCount > 0"
                    class="px-1.5 py-0.5 text-[10px] font-bold bg-[#1DB954] text-black rounded-full"
                  >
                    {{ unreadCount }}
                  </span>
                </div>
                <button
                  v-if="unreadCount > 0"
                  class="text-xs text-[#1DB954] hover:text-[#1ed760] cursor-pointer transition-colors font-medium"
                  @click="handleMarkAllRead"
                >
                  {{ t("notification.mark_all_read") }}
                </button>
              </div>
              <!-- Notification List -->
              <div
                class="max-h-100 overflow-y-auto scrollbar-hide divide-y divide-white/4"
              >
                <div
                  v-if="notifications.length === 0"
                  class="px-6 py-12 text-center"
                >
                  <div
                    class="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3"
                  >
                    <UIcon
                      name="i-lucide-bell-off"
                      class="size-7 text-neutral-600"
                    />
                  </div>
                  <p class="text-sm text-neutral-500 font-medium">
                    {{ t("notification.no_notifications") }}
                  </p>
                </div>
                <div
                  v-for="notif in notifications"
                  :key="notif.Id || notif.NotificationId"
                  class="px-5 py-3.5 hover:bg-white/4 transition-all duration-150 cursor-pointer"
                  :class="{ 'bg-white/2': !notif.IsRead }"
                  @click="handleNotifClick(notif)"
                >
                  <div class="flex items-start gap-3.5">
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      :class="getNotifIconBg(notif.Type)"
                    >
                      <UIcon :name="getNotifIcon(notif.Type)" class="size-5" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p
                          class="text-[13px] text-white leading-tight"
                          :class="
                            !notif.IsRead ? 'font-semibold' : 'font-medium'
                          "
                        >
                          {{ notif.Title }}
                        </p>
                        <span
                          v-if="!notif.IsRead"
                          class="w-2 h-2 rounded-full bg-[#1DB954] shrink-0"
                        ></span>
                      </div>
                      <p
                        class="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed"
                      >
                        {{ notif.Message }}
                      </p>
                      <p
                        class="text-[11px] text-neutral-600 mt-1.5 font-medium"
                      >
                        {{ formatTimeAgo(notif.CreatedAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
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
        :min-size="18"
        :max-size="20"
        :collapsed-size="5"
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
        id="main-scroll-container"
        class="flex-1 overflow-y-auto bg-[#121212] rounded-lg h-full scrollbar-hide"
      >
        <slot />
        <AppFooter />
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
import notificationApi from "~/api/notificationApi";
import authApi from "~/api/authApi";
import { useLikedSongsStore } from "~/stores/useLikedSongsStore";
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";

const route = useRoute();
const data = ref(null);
const toast = useToast();
const { t } = useI18n();
const { logout, user, saveTokens } = useAuth();
const likedSongsStore = useLikedSongsStore();

// Sidebar playlists
const userPlaylists = ref([]);

// ========================
// Notification System
// ========================
const notifications = ref([]);
const unreadCount = ref(0);
const showNotifDropdown = ref(false);
const notifDropdownRef = ref(null);
let notifPollTimer = null;

const toggleNotifDropdown = () => {
  showNotifDropdown.value = !showNotifDropdown.value;
  if (showNotifDropdown.value) fetchNotifications();
};

// Close dropdown on outside click
const handleClickOutside = (e) => {
  if (notifDropdownRef.value && !notifDropdownRef.value.contains(e.target)) {
    showNotifDropdown.value = false;
  }
};

const fetchNotifications = async () => {
  try {
    const res = await notificationApi.getNotifications({
      pageIndex: 1,
      pageSize: 20,
    });
    notifications.value =
      res?.Data || res?.Items || (Array.isArray(res) ? res : []);
  } catch {
    notifications.value = [];
  }
};

const fetchUnreadCount = async () => {
  try {
    const res = await notificationApi.getUnreadCount();
    unreadCount.value =
      typeof res === "number" ? res : res?.Count || res?.UnreadCount || 0;
  } catch {
    /* ignore */
  }
};

const handleNotifClick = async (notif) => {
  if (!notif.IsRead) {
    try {
      await notificationApi.markAsRead(notif.Id || notif.NotificationId);
      notif.IsRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch {
      /* ignore */
    }
  }
};

const handleMarkAllRead = async () => {
  try {
    await notificationApi.markAllAsRead();
    notifications.value.forEach((n) => (n.IsRead = true));
    unreadCount.value = 0;
  } catch {
    /* ignore */
  }
};

const getNotifIcon = (type) => {
  switch (type) {
    case "payment":
      return "i-lucide-credit-card";
    case "role_update":
      return "i-lucide-shield-check";
    case "subscription":
      return "i-lucide-crown";
    case "admin":
      return "i-lucide-megaphone";
    default:
      return "i-lucide-bell";
  }
};

const getNotifIconBg = (type) => {
  switch (type) {
    case "payment":
      return "bg-emerald-500/15 text-emerald-400";
    case "role_update":
      return "bg-blue-500/15 text-blue-400";
    case "subscription":
      return "bg-amber-500/15 text-amber-400";
    case "admin":
      return "bg-purple-500/15 text-purple-400";
    default:
      return "bg-neutral-500/15 text-neutral-400";
  }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("notification.just_now") || "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

// Header search
const headerSearchQuery = useState("headerSearchQuery", () => "");
const isSearchFocused = ref(false);
let searchDebounceTimer = null;

const navigateToSearch = () => {
  navigateTo({
    path: "/search",
    query: headerSearchQuery.value ? { q: headerSearchQuery.value } : {},
  });
};

const debouncedSearch = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    if (headerSearchQuery.value?.trim()) {
      navigateTo({
        path: "/search",
        query: { q: headerSearchQuery.value },
        replace: route.path === "/search",
      });
    } else if (route.path === "/search") {
      navigateTo({ path: "/search", replace: true });
    }
  }, 400);
};

// Sync search query from route when on search page
watch(
  () => route.query.q,
  (q) => {
    if (route.path === "/search" && typeof q === "string") {
      headerSearchQuery.value = q;
    }
  },
);

// Lấy độ rộng của sidebar trong storage
const { width } = useSidebarState();

// Check if user has artist/admin role (check both JWT and profile API)
const userRole = computed(() => {
  return data.value?.Role || user.value?.role || "User";
});
const isArtistOrAdmin = computed(() => {
  const role = userRole.value;
  return role && role !== "User";
});
const isAdmin = computed(() => userRole.value === "Admin");

const navigateToMyMusic = () => {
  navigateTo("/user/my-music");
};

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
  const items = [
    {
      label: t("header.profile"),
      to: "/user/profile",
      icon: "i-lucide-user",
    },
  ];

  // Artist/Admin content creation items
  if (isArtistOrAdmin.value) {
    items.push(
      { type: "separator" },
      {
        label: t("song.my_music"),
        to: "/user/my-music",
        icon: "i-lucide-music",
        onSelect: navigateToMyMusic,
      },
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

  // Admin panel
  if (isAdmin.value) {
    items.push(
      { type: "separator" },
      {
        label: t("header.admin"),
        to: "/admin",
        icon: "i-lucide-shield",
      },
    );
  }

  // Common items
  items.push(
    { type: "separator" },
    {
      label: t("header.pricing"),
      to: "/pricing",
      icon: "i-lucide-crown",
    },
    { type: "separator" },
    {
      label: t("header.logout"),
      icon: "i-lucide-log-out",
      onSelect: handleLogout,
    },
  );

  return items;
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
    const res = await interactionApi.createPlaylist({
      Title: title,
      IsPublic: true,
    });

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
    // If profile role differs from JWT role, refresh the token
    const profileRole = response?.Role;
    const jwtRole = user.value?.role;
    if (profileRole && jwtRole && profileRole !== jwtRole) {
      try {
        const refreshRes = await authApi.refreshToken();
        const token = refreshRes?.Token || refreshRes?.token;
        if (token) saveTokens(refreshRes);
      } catch {
        /* non-critical */
      }
    }
  } catch (error) {}
};

onMounted(() => {
  fetchUserData();
  fetchUserPlaylists();
  // Load liked songs count for sidebar
  if (!likedSongsStore.isLoaded) {
    likedSongsStore.fetchLikedSongs();
  }
  // Notification system
  fetchUnreadCount();
  notifPollTimer = setInterval(fetchUnreadCount, 30000);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  clearInterval(notifPollTimer);
  document.removeEventListener("click", handleClickOutside);
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
    const res = await musicApi.getMyPlaylists({ pageIndex: 1, pageSize: 20 });
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
