<template>
  <div class="min-h-screen bg-[#121212] text-white p-8">
    <div class="max-w-5xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <h1 class="text-3xl font-bold tracking-tight text-white">
            Tải lên Studio
          </h1>
          <UButton
            icon="i-lucide-disc-3"
            label="Tạo Album Mới"
            color="white"
            variant="soft"
            size="sm"
            class="rounded-full font-bold hover:scale-105 transition-transform"
            @click="openCreateAlbumModal"
          />
        </div>

        <UButton
          v-if="currentStep === 2"
          color="gray"
          variant="ghost"
          icon="i-lucide-x"
          @click="resetForm"
        >
          Hủy bỏ
        </UButton>
      </div>

      <div
        v-if="currentStep === 1"
        class="transition-all duration-300 animate-fade-in"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleAudioDrop"
      >
        <input
          type="file"
          ref="audioInputRef"
          class="hidden"
          accept="audio/*"
          @change="handleAudioSelect"
        />

        <div
          class="border-2 border-dashed rounded-xl h-[400px] flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
          :class="[
            isDragging
              ? 'border-[#1DB954] bg-[#1DB954]/10 scale-[1.02]'
              : 'border-neutral-700 hover:border-neutral-500 hover:bg-neutral-900/50',
          ]"
          @click="triggerAudioInput"
        >
          <div
            class="bg-[#282828] p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl"
          >
            <UIcon
              name="i-lucide-music"
              class="size-12"
              :class="isDragging ? 'text-[#1DB954]' : 'text-neutral-400'"
            />
          </div>
          <h3 class="text-2xl font-bold mb-3 text-white">
            Kéo thả bài hát vào đây
          </h3>
          <p class="text-neutral-400 mb-8 font-medium">
            Hỗ trợ MP3, WAV, M4A, OGG
          </p>
          <UButton
            color="primary"
            variant="solid"
            label="Chọn file từ máy tính"
            size="lg"
            class="font-bold px-8 rounded-full"
            :ui="{
              color: {
                primary: { solid: 'bg-white text-black hover:bg-gray-200' },
              },
            }"
          />
        </div>
      </div>

      <div
        v-else
        class="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-slide-up"
      >
        <div class="lg:col-span-4 flex flex-col gap-6">
          <div
            class="aspect-square relative group rounded-xl overflow-hidden bg-[#282828] shadow-2xl ring-1 ring-white/10"
          >
            <img
              v-if="form.coverImagePreview"
              :src="form.coverImagePreview"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-3"
            >
              <UIcon name="i-lucide-image" class="size-16 opacity-50" />
              <span class="text-sm font-semibold">Tải ảnh bìa (500x500)</span>
            </div>

            <div
              class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
              @click="triggerImageInput"
            >
              <div class="flex flex-col items-center text-white">
                <UIcon name="i-lucide-camera" class="size-10 mb-2" />
                <span class="text-sm font-bold">Thay đổi ảnh</span>
              </div>
            </div>
            <input
              type="file"
              ref="imageInputRef"
              class="hidden"
              accept="image/*"
              @change="handleImageSelect"
            />
          </div>

          <div
            class="bg-[#282828]/60 backdrop-blur-md rounded-xl p-5 border border-white/5"
          >
            <div
              class="text-[10px] text-neutral-400 uppercase tracking-wider font-bold mb-3"
            >
              Thông tin file
            </div>
            <div class="flex items-center gap-3 text-sm text-white mb-2">
              <UIcon
                name="i-lucide-file-audio"
                class="size-5 text-[#1DB954] shrink-0"
              />
              <span class="truncate font-medium">{{
                form.audioFile?.name
              }}</span>
            </div>
            <div
              class="flex justify-between items-center text-xs text-neutral-500 border-t border-white/10 pt-3 mt-1"
            >
              <span
                >{{ (form.audioFile?.size / 1024 / 1024).toFixed(2) }} MB</span
              >
              <span
                class="font-mono bg-white/10 px-2 py-0.5 rounded text-white"
                >{{ formatDuration(form.duration) }}</span
              >
            </div>
          </div>
        </div>

        <div class="lg:col-span-8 space-y-8">
          <div class="flex gap-4 mb-3!">
            <UFormGroup label="Tiêu đề bài hát" required :ui="labelStyle">
              <UInput
                v-model="form.title"
                placeholder="Nhập tên bài hát..."
                size="xl"
                autofocus
                :ui="inputSpotifyStyle"
              />
            </UFormGroup>

            <div class="grid grid-cols-1 gap-6 flex-1">
              <UFormGroup label="Nghệ sĩ & Featuring" required :ui="labelStyle">
                <USelectMenu
                  v-model="form.selectedArtists"
                  :searchable="searchArtists"
                  placeholder="Tìm kiếm nghệ sĩ hợp tác..."
                  multiple
                  by="user_id"
                  option-attribute="FullName"
                  size="xl"
                  :ui="inputSpotifyStyle"
                  :ui-menu="{
                    background: 'bg-[#282828]',
                    option: {
                      active: 'bg-[#3E3E3E] text-white',
                      selected: 'text-[#1DB954]',
                    },
                    height: 'max-h-60',
                  }"
                >
                  <template #label>
                    <div
                      v-if="form.selectedArtists.length"
                      class="flex flex-wrap gap-2"
                    >
                      <span
                        v-for="artist in form.selectedArtists"
                        :key="artist.user_id"
                        class="inline-flex items-center bg-white/10 rounded-full px-3 py-1 text-sm"
                      >
                        {{ artist.FullName }}
                        <span
                          v-if="
                            currentUser &&
                            artist.user_id === currentUser.user_id
                          "
                          class="ml-1 text-[10px] text-[#1DB954] font-bold"
                          >(Main)</span
                        >
                      </span>
                    </div>
                    <span v-else class="text-neutral-500">Chọn nghệ sĩ...</span>
                  </template>

                  <template #option="{ option }">
                    <UAvatar :src="option.Avatar" size="2xs" class="mr-2" />
                    <span class="truncate">{{ option.FullName }}</span>
                    <UBadge
                      v-if="
                        currentUser && option.user_id === currentUser.user_id
                      "
                      size="xs"
                      color="primary"
                      variant="subtle"
                      class="ml-auto"
                      >Main</UBadge
                    >
                  </template>
                </USelectMenu>
              </UFormGroup>
            </div>
          </div>

          <UFormGroup label="Thể loại chính" required :ui="labelStyle">
            <USelectMenu
              v-model="form.selectedGenres"
              multiple
              :items="availableGenres"
              option-attribute="Name"
              value-attribute="Id"
              placeholder="Chọn thể loại..."
              size="xl"
              :ui="inputSpotifyStyle"
              :ui-menu="{
                background: 'bg-[#282828] border border-neutral-700',
                option: { active: 'bg-[#3E3E3E]' },
              }"
              @click="fetchGenresIfNeeded"
            >
              <template #item="{ item }">
                <span class="truncate">{{ item.Name }}</span>
              </template>
            </USelectMenu>
          </UFormGroup>

          <div
            class="p-5 mt-3 bg-[#282828]/40 rounded-xl border border-dashed border-neutral-700 hover:border-neutral-500 transition-colors"
          >
            <div class="flex items-center justify-between mb-3">
              <label
                class="text-sm font-bold text-neutral-300 flex items-center gap-2"
              >
                <UIcon name="i-lucide-disc" /> Thêm vào Album (Tùy chọn)
              </label>
              <UButton
                label="Tạo mới"
                size="xs"
                color="white"
                variant="soft"
                icon="i-lucide-plus"
                @click="openCreateAlbumModal"
              />
            </div>

            <USelectMenu
              v-model="form.selectedAlbum"
              :items="myAlbums"
              placeholder="Chọn album (hoặc để trống nếu là Single)..."
              option-attribute="title"
              value-attribute="album_id"
              size="lg"
              :ui="inputSpotifyStyle"
              clearable
              @click="fetchAlbumsIfNeeded"
            >
              <template #option="{ option }">
                <div class="flex items-center gap-2">
                  <UAvatar
                    :src="option.thumbnail"
                    size="2xs"
                    icon="i-lucide-disc"
                  />
                  <span class="truncate">{{ option.title }}</span>
                </div>
              </template>
            </USelectMenu>
            <p class="text-xs text-neutral-500 mt-2">
              Nếu không chọn, bài hát sẽ được hiểu là Single độc lập.
            </p>
          </div>

          <div
            class="pt-8 mt-4 border-t border-white/10 flex items-center justify-end gap-4"
          >
            <div class="mr-auto text-xs text-neutral-500 max-w-xs">
              * Bằng việc tải lên, bạn xác nhận quyền sở hữu đối với tác phẩm
              này.
            </div>
            <UButton
              :loading="isSubmitting"
              :disabled="!isFormValid"
              color="primary"
              variant="solid"
              size="xl"
              class="font-bold px-12 rounded-full transition-transform active:scale-95"
              :ui="{
                color: {
                  primary: {
                    solid:
                      'bg-[#1DB954] hover:bg-[#1ed760] text-black disabled:bg-neutral-800 disabled:text-neutral-500',
                  },
                },
              }"
              @click="handleSubmit"
            >
              {{ isSubmitting ? "Đang xử lý..." : "Đăng tải ngay" }}
            </UButton>
          </div>
        </div>
      </div>

      <div
        v-if="isOpenCreateAlbum"
        class="fixed top-0 left-0 right-0 bottom-0 z-999 w-full flex items-center justify-center bg-black/10 backdrop-blur-sm"
      >
        <div
          class="p-6 text-white bg-[#282828] w-[700px] rounded-lg"
          @click.stop
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold tracking-tight">Tạo Album Mới</h3>
            <UButton
              icon="i-lucide-x"
              color="gray"
              variant="ghost"
              class="hover:bg-white/10 rounded-full"
              @click="isOpenCreateAlbum = false"
            />
          </div>

          <div class="flex flex-col sm:flex-row gap-6">
            <div
              class="group relative w-45 h-45 shrink-0 mx-auto sm:mx-0 shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            >
              <img
                v-if="albumCoverPreview"
                :src="albumCoverPreview"
                class="w-full h-full object-cover rounded shadow-lg"
              />
              <div
                v-else
                class="w-full h-full bg-[#3E3E3E] flex flex-col items-center justify-center rounded shadow-lg gap-2"
              >
                <UIcon name="i-lucide-disc-2" class="size-14 text-[#7F7F7F]" />
                <span class="text-xs font-bold text-[#7F7F7F]">Ảnh bìa</span>
              </div>
              <div
                class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded"
                @click="triggerAlbumFileInput"
              >
                <UIcon name="i-lucide-camera" class="size-8 mb-2 text-white" />
                <span class="text-[10px] font-bold uppercase tracking-widest"
                  >Tải lên</span
                >
              </div>
              <input
                type="file"
                ref="albumFileInputRef"
                class="hidden"
                accept="image/*"
                @change="handleAlbumFileSelect"
              />
            </div>

            <div class="flex-1 flex flex-col gap-4">
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-neutral-400 uppercase"
                  >Tên Album</label
                >
                <input
                  v-model="albumForm.title"
                  type="text"
                  placeholder="Nhập tên album..."
                  class="w-full bg-[#3E3E3E] text-white text-base font-bold px-3 py-3 rounded border-transparent focus:border-transparent focus:ring-1 focus:ring-white/30 placeholder:text-neutral-500 transition-all"
                />
              </div>

              <div class="space-y-1">
                <label class="text-[11px] font-bold text-neutral-400 uppercase"
                  >Ngày phát hành</label
                >
                <input
                  v-model="albumForm.releaseDate"
                  type="date"
                  class="w-full bg-[#3E3E3E] text-white text-sm font-medium px-3 py-3 rounded border-transparent focus:border-transparent focus:ring-1 focus:ring-white/30 appearance-none [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-8 pt-4 border-t border-white/10">
            <UButton
              :loading="isCreatingAlbum"
              :disabled="!albumForm.title"
              color="white"
              variant="solid"
              size="lg"
              class="font-bold px-8 rounded-full min-w-[120px] flex justify-center hover:scale-105 transition-transform"
              @click="handleCreateAlbum"
            >
              Lưu Album
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import musicApi from "~/api/musicApi";
import fileApi from "~/api/fileApi";
import userApi from "~/api/userApi";
import artistApi from "~/api/artistApi";

definePageMeta({ layout: "auth" });

// --- STATE ---
const currentUser = ref(null);
const allArtists = ref([]);
const availableGenres = ref([]);
const myAlbums = ref([]);
const isSubmitting = ref(false);
const currentStep = ref(1);
const isDragging = ref(false);
const audioInputRef = ref(null);
const imageInputRef = ref(null);
const toast = useToast();

// State form
const form = reactive({
  audioFile: null,
  duration: 0,
  coverImageFile: null,
  coverImagePreview: null,
  title: "",
  selectedArtists: [],
  selectedGenres: [],
  selectedAlbum: null,
});

// State tạo album
const isOpenCreateAlbum = ref(false);
const isCreatingAlbum = ref(false);
const albumFileInputRef = ref(null);
const albumCoverPreview = ref(null);
const albumForm = reactive({
  title: "",
  releaseDate: new Date().toISOString().split("T")[0],
  imageFile: null,
});

// Styles
const inputSpotifyStyle = {
  base: "bg-[#3E3E3E] text-white ring-0 focus:ring-2 focus:ring-primary placeholder:text-neutral-400",
  rounded: "rounded-md",
  padding: { xl: "py-3.5 px-4", lg: "py-3 px-4" },
};
const labelStyle = {
  label: { base: "text-neutral-300 text-sm font-bold mb-1.5" },
};

onMounted(async () => {
  try {
    const userRes = await userApi.getUserInfo();
    currentUser.value = userRes;
    if (userRes) {
      form.selectedArtists.push(userRes);
    }
  } catch (e) {}
});

const fetchGenresIfNeeded = async () => {
  if (availableGenres.value.length === 0) {
    try {
      const res = await musicApi.getGenres();
      availableGenres.value = res;
    } catch (e) {
      console.error("Lỗi Genre:", e);
    }
  }
};

const searchArtists = async (q) => {
  if (allArtists.value.length === 0) {
    try {
      const res = await artistApi.getArtists();
      allArtists.value = res.Data;
    } catch (e) {
      console.error("Lỗi Artist:", e);
    }
  }

  // Sau đó filter client-side
  if (!q) return allArtists.value;
  return allArtists.value.filter((a) =>
    a.FullName.toLowerCase().includes(q.toLowerCase()),
  );
};

const fetchAlbumsIfNeeded = async () => {
  if (myAlbums.value.length === 0 && currentUser.value) {
    try {
      const res = await musicApi.getAlbumsByArtist(currentUser.value.user_id);
      myAlbums.value = res.data || res;
    } catch (e) {
      console.error("Lỗi Album:", e);
    }
  }
};

const refreshMyAlbums = async (userId) => {
  try {
    const res = await musicApi.getAlbumsByArtist(userId);
    myAlbums.value = res.data || res;
  } catch (e) {
    console.error("Lỗi Album:", e);
  }
};
const processAudio = (file) => {
  if (!file.type.startsWith("audio/")) {
    toast.add({
      title: "Lỗi",
      description: "Vui lòng chọn file âm thanh",
      color: "red",
    });
    return;
  }
  const objectUrl = URL.createObjectURL(file);
  const audioEl = new Audio(objectUrl);
  audioEl.onloadedmetadata = () => {
    form.duration = Math.round(audioEl.duration);
    URL.revokeObjectURL(objectUrl);
  };
  form.audioFile = file;
  currentStep.value = 2;
};
const handleAudioSelect = (e) => {
  if (e.target.files[0]) processAudio(e.target.files[0]);
};
const handleAudioDrop = (e) => {
  isDragging.value = false;
  if (e.dataTransfer.files[0]) processAudio(e.dataTransfer.files[0]);
};
const triggerAudioInput = () => audioInputRef.value.click();

const handleImageSelect = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    form.coverImageFile = file;
    form.coverImagePreview = URL.createObjectURL(file);
  }
};
const triggerImageInput = () => imageInputRef.value.click();

// --- SUBMIT SONG ---
const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    let thumbnailUrl = "";
    if (form.coverImageFile) {
      const fd = new FormData();
      fd.append("file", form.coverImageFile);
      const res = await fileApi.uploadImage(fd);
      thumbnailUrl = res.url || res.data?.url || res;
    }

    let audioUrl = "";
    if (form.audioFile) {
      const fd = new FormData();
      fd.append("file", form.audioFile);
      const res = await fileApi.uploadAudio(fd);
      audioUrl = res.url || res.data?.url || res;
    }

    const createPayload = {
      title: form.title,
      file_url: audioUrl,
      thumbnail: thumbnailUrl,
      duration: form.duration,
      is_public: true,
      artist_ids: form.selectedArtists.map((u) => u.user_id),
      genre_ids: form.selectedGenres,
      album_id: form.selectedAlbum,
    };

    await musicApi.createSong(createPayload);

    toast.add({
      title: "Thành công",
      description: "Đã đăng tải bài hát!",
      color: "green",
    });
    resetForm();
  } catch (error) {
    console.error(error);
    toast.add({
      title: "Lỗi",
      description: "Không thể đăng tải bài hát.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  currentStep.value = 1;
  form.audioFile = null;
  form.coverImageFile = null;
  form.coverImagePreview = null;
  form.title = "";
  form.duration = 0;
  form.selectedGenres = [];
  form.selectedAlbum = null;
  form.selectedArtists = currentUser.value ? [currentUser.value] : [];
};

const isFormValid = computed(() => {
  return (
    form.title.trim() &&
    form.audioFile &&
    form.selectedArtists.length > 0 &&
    form.selectedGenres.length > 0
  );
});

// --- TẠO ALBUM ---
const openCreateAlbumModal = () => {
  albumForm.title = "";
  albumForm.releaseDate = new Date().toISOString().split("T")[0];
  albumForm.imageFile = null;
  albumCoverPreview.value = null;
  isOpenCreateAlbum.value = true;
};

const triggerAlbumFileInput = () => albumFileInputRef.value.click();

const handleAlbumFileSelect = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    albumForm.imageFile = file;
    albumCoverPreview.value = URL.createObjectURL(file);
  }
};

const handleCreateAlbum = async () => {
  isCreatingAlbum.value = true;
  try {
    let thumbnailUrl = null;
    if (albumForm.imageFile) {
      const fd = new FormData();
      fd.append("file", albumForm.imageFile);
      const res = await fileApi.uploadImage(fd);
      thumbnailUrl = res.Url;
    }

    const payload = {
      title: albumForm.title,
      thumbnail: thumbnailUrl,
      release_date: albumForm.releaseDate,
    };

    const res = await musicApi.createAlbum(payload);

    if (currentUser.value) await refreshMyAlbums(currentUser.value.user_id);

    const newAlbumId = res.AlbumId || res.album_id;
    if (newAlbumId) form.selectedAlbum = newAlbumId;

    toast.add({
      title: "Thành công",
      description: "Đã tạo Album mới",
      color: "green",
    });
    isOpenCreateAlbum.value = false;
  } catch (e) {
    console.error(e);
    toast.add({
      title: "Lỗi",
      description: "Không thể tạo album",
      color: "red",
    });
  } finally {
    isCreatingAlbum.value = false;
  }
};

const formatDuration = (s) => {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sc = s % 60;
  return `${m}:${sc.toString().padStart(2, "0")}`;
};
</script>
