<template>
  <div class="pb-8">
    <!-- Profile Header + Gradient background that extends through action bar -->
    <div
      class="relative rounded-t-lg overflow-hidden"
      :style="{
        background: `linear-gradient(180deg, ${profileColorDark} 0%, ${profileColorDarker} 50%, #121212 100%)`,
      }"
    >
      <!-- Header Content -->
      <div class="flex p-6 pb-8 gap-6 items-end">
        <div class="relative z-10 flex items-end gap-6 w-full">
          <!-- Avatar -->
          <div
            class="relative group cursor-pointer shrink-0"
            @click="openEditModal"
          >
            <UAvatar
              :src="data?.Avatar"
              :alt="data?.FullName"
              :ui="{
                root: 'w-48 h-48 md:w-56 md:h-56 shadow-2xl bg-neutral-800 rounded-full',
              }"
            />
            <div
              class="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div class="flex flex-col items-center text-white">
                <UIcon name="i-lucide-pencil" class="size-8 mb-1" />
                <span class="text-sm font-medium">{{
                  $t("profile.choose_image")
                }}</span>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="flex flex-col justify-end text-white drop-shadow-md">
            <span class="text-sm font-medium mb-2">{{
              $t("header.profile")
            }}</span>
            <h1
              class="text-6xl md:text-8xl font-black tracking-tight leading-none mb-3"
            >
              {{ data?.FullName }}
            </h1>
            <div
              v-if="userPlaylists.length > 0"
              class="flex items-center gap-1 text-sm text-neutral-300"
            >
              <span>{{
                $t("profile.playlist_count", { count: userPlaylists.length })
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Bar (inside gradient) -->
      <div class="flex items-center gap-4 px-6 py-4">
        <button
          class="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          @click="openEditModal"
        >
          <UIcon name="i-lucide-settings" class="size-7" />
        </button>
        <UDropdownMenu
          :items="profileMenuItems"
          :ui="{
            content: 'bg-[#282828] border-none shadow-xl min-w-[200px] p-1',
            item: 'text-neutral-300 hover:text-white hover:bg-white/10 rounded px-3 py-2.5 text-sm cursor-pointer',
          }"
        >
          <button
            class="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <UIcon name="i-lucide-ellipsis" class="size-8" />
          </button>
        </UDropdownMenu>
      </div>
    </div>

    <!-- Public Playlists Section -->
    <div v-if="userPlaylists.length > 0" class="px-6 mt-6">
      <h2 class="text-xl font-bold text-white mb-4">
        {{ $t("profile.public_playlists") }}
      </h2>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      >
        <NuxtLink
          v-for="playlist in userPlaylists"
          :key="playlist.Id || playlist.PlaylistId"
          :to="`/playlist/${playlist.Id || playlist.PlaylistId}`"
          class="group bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-all duration-300 cursor-pointer"
        >
          <div class="relative mb-4">
            <img
              v-if="playlist.Thumbnail"
              :src="playlist.Thumbnail"
              :alt="playlist.Title"
              class="w-full aspect-square object-cover rounded-md shadow-lg shadow-black/40"
            />
            <div
              v-else
              class="w-full aspect-square bg-[#282828] rounded-md shadow-lg shadow-black/40 flex items-center justify-center"
            >
              <UIcon name="i-lucide-music" class="size-12 text-neutral-500" />
            </div>
            <!-- Play Button Overlay -->
            <button
              @click.prevent="playPlaylist(playlist)"
              class="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center shadow-xl shadow-black/50 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <UIcon name="i-lucide-play" class="size-5 text-white ml-0.5" />
            </button>
          </div>
          <p class="text-white font-semibold text-sm truncate mb-1">
            {{ playlist.Title }}
          </p>
          <p class="text-neutral-400 text-xs truncate">
            {{ $t("sidebar.playlist_label") }} • {{ data?.FullName }}
          </p>
        </NuxtLink>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      class="fixed top-0 left-0 right-0 bottom-0 z-999 w-full flex items-center justify-center bg-black/10 backdrop-blur-sm"
      v-if="isOpen"
    >
      <div>
        <div class="p-6 bg-[#282828] rounded-lg w-96">
          <h3 class="text-xl font-bold mb-4 text-white">
            {{ $t("profile.detail_profile") }}
          </h3>

          <input
            type="file"
            ref="fileInputRef"
            class="hidden"
            accept="image/*"
            @change="onFileSelected"
          />

          <div class="flex items-center gap-6">
            <div
              class="relative group cursor-pointer shrink-0"
              @click="triggerFileInput"
            >
              <UAvatar
                :src="previewUrl || data?.Avatar"
                size="3xl"
                class="w-32 h-32 ring-4 ring-neutral-800 shadow-xl object-cover"
              />
              <div
                class="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <UIcon name="i-lucide-camera" class="size-8 text-white" />
              </div>
            </div>

            <div class="flex-1 space-y-4">
              <div class="space-y-1">
                <UInput
                  v-model="editName"
                  size="lg"
                  color="white"
                  variant="outline"
                  :ui="{
                    base: 'bg-[#3E3E3E] text-white ring-gray-700 focus:ring-gray-500',
                  }"
                >
                </UInput>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton
              color="gray"
              variant="ghost"
              @click="isOpen = false"
              class="cursor-pointer"
            >
              {{ $t("profile.cancel") }}
            </UButton>
            <UButton
              color="secondary"
              :loading="isLoading"
              @click="handleSaveAvatar"
              class="cursor-pointer bg-white hover:bg-gray-200"
            >
              {{ $t("profile.save") }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import userApi from "~/api/userApi";
import musicApi from "~/api/musicApi";
import interactionApi from "~/api/interactionApi";
import fileApi from "~/api/fileApi";

const { t } = useI18n();
const data = ref(null);
const toast = useToast();
const userPlaylists = ref([]);
const playerStore = usePlayerStore();

// Dynamic color from avatar
const avatarUrl = ref(null);
const { dominantColor } = useDominantColor(avatarUrl);

// Darken the dominant color for profile gradient
const profileColorDark = computed(() => {
  const c = dominantColor.value;
  if (!c || !c.startsWith("rgb")) return "#2a1a1a";
  const match = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return "#2a1a1a";
  const r = Math.floor(parseInt(match[1]) * 0.35);
  const g = Math.floor(parseInt(match[2]) * 0.35);
  const b = Math.floor(parseInt(match[3]) * 0.35);
  return `rgb(${r}, ${g}, ${b})`;
});

const profileColorDarker = computed(() => {
  const c = dominantColor.value;
  if (!c || !c.startsWith("rgb")) return "#1a1010";
  const match = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return "#1a1010";
  const r = Math.floor(parseInt(match[1]) * 0.15);
  const g = Math.floor(parseInt(match[2]) * 0.15);
  const b = Math.floor(parseInt(match[3]) * 0.15);
  return `rgb(${r}, ${g}, ${b})`;
});

const isOpen = ref(false);
const fileInputRef = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);
const isLoading = ref(false);
const editName = ref("");

const profileMenuItems = computed(() => [
  [
    {
      label: t("profile.edit_profile"),
      icon: "i-lucide-pencil",
      onSelect: () => openEditModal(),
    },
  ],
]);

const openEditModal = () => {
  previewUrl.value = null;
  selectedFile.value = null;
  editName.value = data.value?.FullName;
  isOpen.value = true;
};

const triggerFileInput = () => {
  fileInputRef.value.click();
};

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match("image.*")) {
    toast.add({
      title: t("notify.error"),
      description: "Vui lòng chọn file hình ảnh",
      color: "red",
    });
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const handleSaveAvatar = async () => {
  try {
    isLoading.value = true;

    let newAvatarUrl = data.value?.Avatar;

    if (selectedFile.value) {
      const uploadRes = await fileApi.uploadImage(selectedFile.value);
      newAvatarUrl = uploadRes.Url || uploadRes.url;
    }

    const updatePayload = {
      ...data.value,
      Avatar: newAvatarUrl,
      FullName: editName.value,
    };

    await userApi.updateProfile(updatePayload);

    data.value.Avatar = newAvatarUrl;
    data.value.FullName = editName.value;
    avatarUrl.value = newAvatarUrl;
    toast.add({
      title: t("notify.success"),
      description: t("song.update_success"),
      color: "green",
    });
    isOpen.value = false;
  } catch (error) {
    console.error(error);
    toast.add({
      title: t("notify.error"),
      description: t("song.update_error"),
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const playPlaylist = async (playlist) => {
  try {
    const details = await interactionApi.getPlaylistDetails(playlist.Id, {
      pageSize: 100,
    });
    const songs = details?.Songs?.Items || details?.Songs || [];
    if (songs.length > 0) {
      playerStore.setQueue(songs);
      playerStore.playTrack(songs[0]);
    }
  } catch (error) {
    console.error("Error playing playlist:", error);
  }
};

const fetchUserData = async () => {
  try {
    const response = await userApi.getUserInfo();
    data.value = response;
    avatarUrl.value = response?.Avatar || null;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const fetchUserPlaylists = async () => {
  try {
    const response = await musicApi.getMyPlaylists({
      pageIndex: 1,
      pageSize: 50,
    });
    userPlaylists.value = response?.Data || response?.Items || response || [];
  } catch (error) {
    console.error("Error fetching user playlists:", error);
  }
};

onMounted(() => {
  fetchUserData();
  fetchUserPlaylists();
});
</script>
