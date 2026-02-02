<template>
  <div class="min-h-screen bg-[#121212] text-white p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold tracking-tight">
          {{ $t("song.my_albums") }}
        </h1>
        <NuxtLink to="/create/song">
          <UButton
            icon="i-lucide-plus"
            :label="$t('song.create_new')"
            color="primary"
            size="lg"
            class="rounded-full font-bold"
            :ui="{
              color: {
                primary: {
                  solid: 'bg-[#1DB954] hover:bg-[#1ed760] text-black',
                },
              },
            }"
          />
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="inline-block relative w-12 h-12 mb-4">
            <div
              class="absolute inset-0 border-4 border-transparent border-t-[#1DB954] border-r-[#1DB954] rounded-full animate-spin"
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
        <NuxtLink to="/create/song">
          <UButton
            icon="i-lucide-plus"
            :label="$t('song.create_new')"
            color="primary"
            size="lg"
            class="rounded-full font-bold"
            :ui="{
              color: {
                primary: {
                  solid: 'bg-[#1DB954] hover:bg-[#1ed760] text-black',
                },
              },
            }"
          />
        </NuxtLink>
      </div>

      <!-- Albums Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="album in albums"
          :key="album.AlbumId"
          class="group relative bg-[#282828]/60 rounded-lg overflow-hidden border border-white/10 hover:border-[#1DB954]/50 transition-all hover:shadow-2xl"
        >
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

            <!-- Overlay -->
            <div
              class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4"
            >
              <div class="flex-1">
                <h3 class="font-bold text-white truncate">{{ album.Title }}</h3>
                <p class="text-xs text-neutral-300">
                  {{ formatDate(album.ReleaseDate) }}
                </p>
              </div>
              <div class="flex gap-2 shrink-0">
                <UButton
                  icon="i-lucide-edit"
                  color="gray"
                  variant="ghost"
                  size="sm"
                  :ui="{ rounded: 'rounded-full' }"
                  @click="openEditAlbumModal(album)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="red"
                  variant="ghost"
                  size="sm"
                  :ui="{ rounded: 'rounded-full' }"
                  @click="openDeleteAlbumConfirm(album)"
                />
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <h3 class="font-bold text-white truncate">{{ album.Title }}</h3>
            <p class="text-xs text-neutral-400">
              {{ formatDate(album.ReleaseDate) }}
            </p>
          </div>
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

            <div class="space-y-6">
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
                  class="w-full bg-[#3E3E3E] text-white px-4 py-3 rounded border-transparent focus:ring-1 focus:ring-[#1DB954]"
                />
              </div>

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
                  class="rounded-full"
                  :ui="{
                    color: {
                      primary: {
                        solid: 'bg-[#1DB954] hover:bg-[#1ed760] text-black',
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import musicApi from "~/api/musicApi";

definePageMeta({ layout: "auth" });

const albums = ref([]);
const isLoading = ref(false);
const isEditAlbumModalOpen = ref(false);
const isDeleteAlbumConfirmOpen = ref(false);
const isSavingAlbum = ref(false);
const isDeletingAlbum = ref(false);
const selectedAlbumToDelete = ref(null);

const inputSpotifyStyle = {
  base: "bg-[#3E3E3E] text-white ring-0 focus:ring-2 focus:ring-[#1DB954] placeholder:text-neutral-400",
  rounded: "rounded-md",
  padding: { lg: "py-3 px-4" },
};

const editAlbumForm = reactive({
  title: "",
  releaseDate: "",
});

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
  editAlbumForm.title = album.Title;
  editAlbumForm.releaseDate = album.ReleaseDate?.split("T")[0] || "";
  isEditAlbumModalOpen.value = true;
};

const closeEditAlbumModal = () => {
  isEditAlbumModalOpen.value = false;
  editAlbumForm.title = "";
  editAlbumForm.releaseDate = "";
};

const handleEditAlbumSave = async () => {
  isSavingAlbum.value = true;
  try {
    // TODO: Implement update album API call
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
</script>
