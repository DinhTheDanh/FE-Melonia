<template>
  <div class="min-h-screen bg-[#121212] text-white p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold tracking-tight">
          {{ $t("song.my_albums") }}
        </h1>
        <UButton
          icon="i-lucide-plus"
          :label="$t('song.create_new')"
          color="primary"
          size="lg"
          class="rounded-full font-bold"
          :ui="{
            color: {
              primary: {
                solid: 'bg-purple-500 hover:bg-purple-400 text-black',
              },
            },
          }"
          @click="openCreateAlbumModal"
        />
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="inline-block relative w-12 h-12 mb-4">
            <div
              class="absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-purple-500 rounded-full animate-spin"
            ></div>
          </div>
          <p class="text-neutral-400">{{ $t("song.loading") }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="albums.length === 0" class="text-center py-20">
        <UIcon
          name="i-lucide-disc"
          class="size-20 mx-auto mb-4 text-neutral-600"
        />
        <p class="text-xl text-neutral-400 mb-6">{{ $t("song.no_albums") }}</p>
        <UButton
          icon="i-lucide-plus"
          :label="$t('song.create_new')"
          color="primary"
          size="lg"
          class="rounded-full font-bold"
          :ui="{
            color: {
              primary: {
                solid: 'bg-purple-500 hover:bg-purple-400 text-black',
              },
            },
          }"
          @click="openCreateAlbumModal"
        />
      </div>

      <!-- Albums Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="album in albums"
          :key="album.AlbumId"
          class="group relative bg-[#282828]/60 rounded-lg overflow-hidden transition-all hover:shadow-2xl cursor-pointer"
        >
          <!-- Clickable area -->
          <NuxtLink :to="`/user/my-albums/${album.AlbumId}`" class="block">
            <!-- Image -->
            <div class="relative aspect-square overflow-hidden bg-[#3E3E3E]">
              <img
                v-if="album.Thumbnail"
                :src="album.Thumbnail"
                :alt="album.Title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-neutral-500"
              >
                <UIcon name="i-lucide-disc" class="size-20" />
              </div>
            </div>

            <!-- Info -->
            <div class="p-4">
              <h3 class="font-bold text-white truncate">{{ album.Title }}</h3>
              <p class="text-xs text-neutral-400">
                {{ formatDate(album.ReleaseDate) }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Edit Album Modal -->
      <Transition name="fade">
        <div
          v-if="isEditAlbumModalOpen"
          class="fixed top-0 left-0 right-0 bottom-0 z-[999] w-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click="closeEditAlbumModal"
        >
          <div
            class="bg-[#282828] rounded-xl p-8 max-w-2xl w-full mx-4 border border-white/10"
            @click.stop
          >
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold">{{ $t("song.edit_album") }}</h2>
              <UButton
                icon="i-lucide-x"
                color="gray"
                variant="ghost"
                @click="closeEditAlbumModal"
              />
            </div>

            <div class="flex flex-col sm:flex-row gap-6">
              <!-- Album Cover -->
              <div
                class="group relative w-40 h-40 shrink-0 mx-auto sm:mx-0 shadow-lg"
              >
                <img
                  v-if="editAlbumForm.coverPreview"
                  :src="editAlbumForm.coverPreview"
                  class="w-full h-full object-cover rounded shadow-lg"
                />
                <div
                  v-else
                  class="w-full h-full bg-[#3E3E3E] flex flex-col items-center justify-center rounded shadow-lg gap-2"
                >
                  <UIcon
                    name="i-lucide-disc-2"
                    class="size-12 text-[#7F7F7F]"
                  />
                  <span class="text-xs font-bold text-[#7F7F7F]">{{
                    $t("song.cover_image")
                  }}</span>
                </div>
                <div
                  class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded"
                  @click="triggerEditAlbumFileInput"
                >
                  <UIcon
                    name="i-lucide-camera"
                    class="size-8 mb-2 text-white"
                  />
                  <span class="text-[10px] font-bold uppercase tracking-widest">
                    {{ $t("song.change_image") }}
                  </span>
                </div>
                <input
                  type="file"
                  ref="editAlbumFileInputRef"
                  class="hidden"
                  accept="image/*"
                  @change="handleEditAlbumFileSelect"
                />
              </div>

              <!-- Form Fields -->
              <div class="flex-1 space-y-4">
                <!-- Title -->
                <div>
                  <label class="block text-sm font-bold text-neutral-300 mb-2">
                    {{ $t("song.album_title") }}
                  </label>
                  <UInput
                    v-model="editAlbumForm.title"
                    :placeholder="$t('song.album_title_placeholder')"
                    size="lg"
                    :ui="inputSpotifyStyle"
                  />
                </div>

                <!-- Release Date -->
                <div>
                  <label class="block text-sm font-bold text-neutral-300 mb-2">
                    {{ $t("song.release_date") }}
                  </label>
                  <input
                    v-model="editAlbumForm.releaseDate"
                    type="date"
                    class="w-full bg-[#3E3E3E] text-white px-4 py-3 rounded border-transparent focus:ring-2 focus:ring-purple-500 appearance-none [&::-webkit-calendar-picker-indicator]:invert outline-none"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-6 mt-6">
              <!-- Action Buttons -->
              <div class="flex justify-end gap-4 pt-4 border-t border-white/10">
                <UButton
                  :label="$t('song.cancel')"
                  color="gray"
                  variant="ghost"
                  size="lg"
                  @click="closeEditAlbumModal"
                />
                <UButton
                  :label="$t('song.save_changes')"
                  color="primary"
                  size="lg"
                  :loading="isSavingAlbum"
                  :disabled="!isEditAlbumFormValid"
                  class="rounded-full transition-transform"
                  :class="{
                    'hover:scale-105': isEditAlbumFormValid,
                    'cursor-not-allowed': !isEditAlbumFormValid,
                  }"
                  :ui="{
                    color: {
                      primary: {
                        solid:
                          'bg-purple-500 hover:bg-purple-400 text-black disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed',
                      },
                    },
                  }"
                  @click="handleEditAlbumSave"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Delete Album Confirmation -->
      <Transition name="fade">
        <div
          v-if="isDeleteAlbumConfirmOpen"
          class="fixed top-0 left-0 right-0 bottom-0 z-[999] w-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click="isDeleteAlbumConfirmOpen = false"
        >
          <div
            class="bg-[#282828] rounded-xl p-8 max-w-md w-full mx-4 border border-white/10"
            @click.stop
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0"
              >
                <UIcon
                  name="i-lucide-alert-circle"
                  class="size-6 text-red-500"
                />
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">
                  {{ $t("song.confirm_delete") }}
                </h3>
                <p class="text-sm text-neutral-400">
                  {{ $t("song.delete_album_confirmation") }}
                </p>
              </div>
            </div>

            <div class="flex justify-end gap-4 pt-4 border-t border-white/10">
              <UButton
                :label="$t('song.cancel_delete')"
                color="gray"
                variant="ghost"
                size="lg"
                @click="isDeleteAlbumConfirmOpen = false"
              />
              <UButton
                :label="$t('song.confirm')"
                color="red"
                size="lg"
                :loading="isDeletingAlbum"
                class="rounded-full"
                @click="handleDeleteAlbum"
              />
            </div>
          </div>
        </div>
      </Transition>

      <!-- Create Album Modal -->
      <Transition name="fade">
        <div
          v-if="isCreateAlbumModalOpen"
          class="fixed top-0 left-0 right-0 bottom-0 z-[999] w-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click="closeCreateAlbumModal"
        >
          <div
            class="p-6 text-white bg-[#282828] w-[700px] rounded-lg border border-white/10"
            @click.stop
          >
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-2xl font-bold tracking-tight">
                {{ $t("song.create_album_modal_title") }}
              </h3>
              <UButton
                icon="i-lucide-x"
                color="gray"
                variant="ghost"
                class="hover:bg-white/10 rounded-full"
                @click="closeCreateAlbumModal"
              />
            </div>

            <div class="flex flex-col sm:flex-row gap-6">
              <!-- Album Cover -->
              <div
                class="group relative w-45 h-45 shrink-0 mx-auto sm:mx-0 shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
              >
                <img
                  v-if="createAlbumForm.coverPreview"
                  :src="createAlbumForm.coverPreview"
                  class="w-full h-full object-cover rounded shadow-lg"
                />
                <div
                  v-else
                  class="w-full h-full bg-[#3E3E3E] flex flex-col items-center justify-center rounded shadow-lg gap-2"
                >
                  <UIcon
                    name="i-lucide-disc-2"
                    class="size-14 text-[#7F7F7F]"
                  />
                  <span class="text-xs font-bold text-[#7F7F7F]">{{
                    $t("song.cover_image")
                  }}</span>
                </div>
                <div
                  class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded"
                  @click="triggerCreateAlbumFileInput"
                >
                  <UIcon
                    name="i-lucide-camera"
                    class="size-8 mb-2 text-white"
                  />
                  <span class="text-[10px] font-bold uppercase tracking-widest">
                    {{ $t("song.upload_now") }}
                  </span>
                </div>
                <input
                  type="file"
                  ref="createAlbumFileInputRef"
                  class="hidden"
                  accept="image/*"
                  @change="handleCreateAlbumFileSelect"
                />
              </div>

              <!-- Form Fields -->
              <div class="flex-1 flex flex-col gap-4">
                <div class="space-y-1">
                  <label
                    class="text-[11px] font-bold text-neutral-400 uppercase"
                  >
                    {{ $t("song.album_title") }}
                  </label>
                  <input
                    v-model="createAlbumForm.title"
                    type="text"
                    :placeholder="$t('song.album_title_placeholder')"
                    class="w-full bg-[#3E3E3E] text-white text-base font-bold px-3 py-3 rounded border-transparent focus:border-transparent focus:ring-2 focus:ring-purple-500 placeholder:text-neutral-500 transition-all outline-none"
                  />
                </div>

                <div class="space-y-1">
                  <label
                    class="text-[11px] font-bold text-neutral-400 uppercase"
                  >
                    {{ $t("song.release_date") }}
                  </label>
                  <input
                    v-model="createAlbumForm.releaseDate"
                    type="date"
                    class="w-full bg-[#3E3E3E] text-white text-sm font-medium px-3 py-3 rounded border-transparent focus:border-transparent focus:ring-2 focus:ring-purple-500 appearance-none [&::-webkit-calendar-picker-indicator]:invert outline-none"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end mt-8 pt-4 border-t border-white/10">
              <UButton
                :loading="isCreatingAlbum"
                :disabled="!isCreateAlbumFormValid"
                color="primary"
                variant="solid"
                size="lg"
                :label="$t('song.save_album')"
                class="font-bold px-8 rounded-full min-w-[120px] flex justify-center transition-transform"
                :class="{
                  'hover:scale-105': isCreateAlbumFormValid,
                  'cursor-not-allowed': !isCreateAlbumFormValid,
                }"
                :ui="{
                  color: {
                    primary: {
                      solid:
                        'bg-purple-500 hover:bg-purple-400 text-black disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed',
                    },
                  },
                }"
                @click="handleCreateAlbum"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import musicApi from "~/api/musicApi";
import fileApi from "~/api/fileApi";

const albums = ref([]);
const isLoading = ref(false);
const isEditAlbumModalOpen = ref(false);
const isDeleteAlbumConfirmOpen = ref(false);
const isSavingAlbum = ref(false);
const isDeletingAlbum = ref(false);
const selectedAlbumToDelete = ref(null);
const selectedAlbumToEdit = ref(null);

// Create Album state
const isCreateAlbumModalOpen = ref(false);
const isCreatingAlbum = ref(false);
const createAlbumFileInputRef = ref(null);
const createAlbumForm = reactive({
  title: "",
  releaseDate: new Date().toISOString().split("T")[0],
  imageFile: null,
  coverPreview: null,
});

// Validation
const isCreateAlbumFormValid = computed(() => {
  return createAlbumForm.title.trim() && createAlbumForm.releaseDate;
});

const isEditAlbumFormValid = computed(() => {
  return editAlbumForm.title.trim() && editAlbumForm.releaseDate;
});

const inputSpotifyStyle = {
  base: "bg-[#3E3E3E] text-white ring-0 focus:ring-2 focus:ring-purple-500 placeholder:text-neutral-400",
  rounded: "rounded-md",
  padding: { lg: "py-3 px-4" },
};

const editAlbumForm = reactive({
  title: "",
  releaseDate: "",
  imageFile: null,
  coverPreview: null,
});

const editAlbumFileInputRef = ref(null);

const toast = useToast();

onMounted(async () => {
  await fetchMyAlbums();
});

const fetchMyAlbums = async () => {
  isLoading.value = true;
  try {
    const res = await musicApi.getMyAlbums();
    albums.value = res.Data || res.data || res || [];
  } catch (error) {
    console.error("Error fetching albums:", error);
    toast.add({
      title: $t("song.error_title"),
      description: $t("song.error_message"),
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("vi-VN");
};

const openEditAlbumModal = (album) => {
  selectedAlbumToEdit.value = album;
  editAlbumForm.title = album.Title;
  editAlbumForm.releaseDate = album.ReleaseDate?.split("T")[0] || "";
  editAlbumForm.imageFile = null;
  editAlbumForm.coverPreview = album.Thumbnail || null;
  isEditAlbumModalOpen.value = true;
};

const closeEditAlbumModal = () => {
  isEditAlbumModalOpen.value = false;
  selectedAlbumToEdit.value = null;
  editAlbumForm.title = "";
  editAlbumForm.releaseDate = "";
  editAlbumForm.imageFile = null;
  editAlbumForm.coverPreview = null;
};

const triggerEditAlbumFileInput = () => editAlbumFileInputRef.value.click();

const handleEditAlbumFileSelect = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    editAlbumForm.imageFile = file;
    editAlbumForm.coverPreview = URL.createObjectURL(file);
  }
};

const handleEditAlbumSave = async () => {
  if (!selectedAlbumToEdit.value) return;

  isSavingAlbum.value = true;
  try {
    let thumbnailUrl = selectedAlbumToEdit.value.Thumbnail;

    // Upload new image if selected
    if (editAlbumForm.imageFile) {
      const res = await fileApi.uploadDirect(editAlbumForm.imageFile, "image");
      thumbnailUrl = res.secure_url;
    }

    const payload = {
      title: editAlbumForm.title,
      release_date: editAlbumForm.releaseDate,
      thumbnail: thumbnailUrl,
    };

    await musicApi.updateAlbum(selectedAlbumToEdit.value.AlbumId, payload);

    toast.add({
      title: $t("song.success_title"),
      description: $t("song.update_success"),
      color: "green",
    });
    closeEditAlbumModal();
    await fetchMyAlbums();
  } catch (error) {
    console.error("Error saving album:", error);
    toast.add({
      title: $t("song.error_title"),
      description: $t("song.update_error"),
      color: "red",
    });
  } finally {
    isSavingAlbum.value = false;
  }
};

const openDeleteAlbumConfirm = (album) => {
  selectedAlbumToDelete.value = album;
  isDeleteAlbumConfirmOpen.value = true;
};

const handleDeleteAlbum = async () => {
  if (!selectedAlbumToDelete.value) return;

  isDeletingAlbum.value = true;
  try {
    await musicApi.deleteAlbum(selectedAlbumToDelete.value.AlbumId);
    toast.add({
      title: $t("song.success_title"),
      description: $t("song.delete_success"),
      color: "green",
    });
    isDeleteAlbumConfirmOpen.value = false;
    selectedAlbumToDelete.value = null;
    await fetchMyAlbums();
  } catch (error) {
    console.error("Error deleting album:", error);
    toast.add({
      title: $t("song.error_title"),
      description: $t("song.delete_error"),
      color: "red",
    });
  } finally {
    isDeletingAlbum.value = false;
  }
};

// --- ALBUM MENU & PLAY ---
const { t: $t } = useI18n();

const getAlbumMenuItems = (album) => [
  [
    {
      label: $t("song.edit"),
      icon: "i-lucide-edit",
      onSelect: () => openEditAlbumModal(album),
    },
    {
      label: $t("song.delete"),
      icon: "i-lucide-trash-2",
      class: "text-red-400",
      onSelect: () => openDeleteAlbumConfirm(album),
    },
  ],
];

const playAlbum = (album) => {
  // TODO: Implement play album functionality
  console.log("Playing album:", album.Title);
};

// --- CREATE ALBUM FUNCTIONS ---
const openCreateAlbumModal = () => {
  createAlbumForm.title = "";
  createAlbumForm.releaseDate = new Date().toISOString().split("T")[0];
  createAlbumForm.imageFile = null;
  createAlbumForm.coverPreview = null;
  isCreateAlbumModalOpen.value = true;
};

const closeCreateAlbumModal = () => {
  isCreateAlbumModalOpen.value = false;
  createAlbumForm.title = "";
  createAlbumForm.releaseDate = "";
  createAlbumForm.imageFile = null;
  createAlbumForm.coverPreview = null;
};

const triggerCreateAlbumFileInput = () => createAlbumFileInputRef.value.click();

const handleCreateAlbumFileSelect = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    createAlbumForm.imageFile = file;
    createAlbumForm.coverPreview = URL.createObjectURL(file);
  }
};

const handleCreateAlbum = async () => {
  isCreatingAlbum.value = true;
  try {
    let thumbnailUrl = null;
    if (createAlbumForm.imageFile) {
      // Upload trực tiếp lên Cloudinary
      const res = await fileApi.uploadDirect(
        createAlbumForm.imageFile,
        "image",
      );
      thumbnailUrl = res.secure_url;
    }

    const payload = {
      title: createAlbumForm.title,
      thumbnail: thumbnailUrl,
      release_date: createAlbumForm.releaseDate,
    };

    await musicApi.createAlbum(payload);

    toast.add({
      title: $t("song.success_title"),
      description: $t("song.album_created_success"),
      color: "green",
    });

    closeCreateAlbumModal();
    await fetchMyAlbums();
  } catch (e) {
    console.error(e);
    toast.add({
      title: $t("song.error_title"),
      description: $t("song.album_create_error"),
      color: "red",
    });
  } finally {
    isCreatingAlbum.value = false;
  }
};
</script>
