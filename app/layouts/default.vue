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

    <UDashboardGroup class="mt-16 bg-[#121212] mx-2 rounded-lg">
      <UDashboardSidebar
        collapsible
        resizable
        v-model:collapsed="collapsed"
        :min-size="18"
        :max-size="25"
        :collapsed-size="5"
        class="group mx-2 border-none group"
      >
        <template #header>
          <div class="flex justify-between items-center w-full py-4">
            <div
              class="flex justify-center items-center gap-2 group cursor-pointer"
            >
              <div @click="collapsed = !collapsed" class="flex items-center">
                <UIcon
                  :name="
                    collapsed
                      ? 'i-lucide-panel-left-open'
                      : 'i-lucide-panel-right-open'
                  "
                  :class="
                    !collapsed
                      ? 'size-5 text-zinc-400 transition-all duration-300 ease-out opacity-0 -translate-x-3 w-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:w-5'
                      : 'size-7 text-zinc-400'
                  "
                  class="hover:text-white"
                />
              </div>

              <span
                v-if="!collapsed"
                class="text-md font-semibold transition-all"
              >
                {{ t("sidebar.library") }}
              </span>
            </div>

            <UTooltip
              :text="t('sidebar.create_playlist')"
              arrow
              :ui="{ content: 'bg-[#282828]' }"
            >
              <div
                class="p-1.5 bg-[#1F1F1F] rounded-full flex items-center justify-center hover:bg-neutral-700 cursor-pointer"
                :class="collapsed ? 'mx-auto mt-1' : ''"
                @click="handleCreatePlaylist"
              >
                <UIcon
                  name="i-lucide-plus"
                  class="size-5 text-zinc-400 hover:text-white"
                />
              </div>
            </UTooltip>
          </div>
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
        <div class="flex-1 overflow-y-auto px-2 pb-4">
          <!-- COLLAPSED STATE: Show icons only -->
          <template v-if="collapsed">
            <!-- Liked Songs Icon (collapsed) -->
            <UTooltip
              v-if="likedSongsStore.totalCount > 0"
              :text="t('sidebar.liked_songs')"
              arrow
              :ui="{ content: 'bg-[#282828]' }"
              :side="'right'"
            >
              <NuxtLink
                to="/user/liked-songs"
                class="flex items-center justify-center py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer mt-2"
              >
                <div
                  class="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
                  style="background: linear-gradient(135deg, #450af5, #c4efd9)"
                >
                  <UIcon name="i-lucide-heart" class="size-5 text-white" />
                </div>
              </NuxtLink>
            </UTooltip>

            <!-- Playlist Icons (collapsed) -->
            <UTooltip
              v-for="playlist in userPlaylists"
              :key="playlist.PlaylistId || playlist.Id"
              :text="playlist.Title || playlist.Name"
              arrow
              :ui="{ content: 'bg-[#282828]' }"
              :side="'right'"
            >
              <NuxtLink
                :to="`/user/my-albums/${playlist.PlaylistId || playlist.Id}`"
                class="flex items-center justify-center py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div
                  class="w-12 h-12 bg-[#282828] rounded-md flex items-center justify-center shrink-0 overflow-hidden"
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
              </NuxtLink>
            </UTooltip>
          </template>

          <!-- EXPANDED STATE: Full entries -->
          <template v-else>
            <!-- Liked Songs Entry -->
            <NuxtLink
              v-if="likedSongsStore.totalCount > 0"
              to="/user/liked-songs"
              class="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer group mt-2"
            >
              <div
                class="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
                style="background: linear-gradient(135deg, #450af5, #c4efd9)"
              >
                <UIcon name="i-lucide-heart" class="size-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-white truncate">
                  {{ t("sidebar.liked_songs") }}
                </p>
                <p class="text-xs text-neutral-400 flex items-center gap-1">
                  <UIcon name="i-lucide-pin" class="size-3" />
                  {{ t("sidebar.playlist_label") }} ·
                  {{ likedSongsStore.totalCount }}
                  {{ t("sidebar.songs_label") }}
                </p>
              </div>
            </NuxtLink>

            <!-- User Playlists -->
            <NuxtLink
              v-for="playlist in userPlaylists"
              :key="playlist.PlaylistId || playlist.Id"
              :to="`/user/my-albums/${playlist.PlaylistId || playlist.Id}`"
              class="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div
                class="w-12 h-12 bg-[#282828] rounded-md flex items-center justify-center shrink-0 overflow-hidden"
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
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-white truncate">
                  {{ playlist.Title || playlist.Name }}
                </p>
                <p class="text-xs text-neutral-400">
                  {{ t("sidebar.playlist_label") }}
                </p>
              </div>
            </NuxtLink>
          </template>
        </div>
      </UDashboardSidebar>

      <div class="flex-1 overflow-y-auto bg-black px-4 pb-28">
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
import { ref, onMounted, computed } from "vue";

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

// Handle create new playlist
const handleCreatePlaylist = async () => {
  try {
    const playlistCount = userPlaylists.value.length + 1;
    const name = `${t("playlist.my_playlist")} #${playlistCount}`;
    const res = await interactionApi.createPlaylist({ name, description: "" });
    toast.add({
      title: t("notify.success"),
      description: t("sidebar.playlist_created"),
      color: "green",
    });
    // Refresh playlists
    await fetchUserPlaylists();
  } catch (error) {
    console.error("Error creating playlist:", error);
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
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

onMounted(() => {
  fetchUserData();
  fetchUserPlaylists();
  // Load liked songs count for sidebar
  if (!likedSongsStore.isLoaded) {
    likedSongsStore.fetchLikedSongs();
  }
});

const fetchUserPlaylists = async () => {
  try {
    const res = await musicApi.getMyPlaylists({ pageIndex: 1, pageSize: 50 });
    userPlaylists.value = res.Data || res || [];
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
};
</script>
