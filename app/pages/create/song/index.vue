<template>
  <div class="min-h-screen bg-[#121212] text-white p-8">
    <div class="max-w-5xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <h1 class="text-3xl font-bold tracking-tight text-white">
            {{ $t("song.upload_studio") }}
          </h1>
        </div>

        <UButton
          v-if="currentStep === 2"
          color="gray"
          variant="ghost"
          icon="i-lucide-x"
          @click="resetForm"
        >
          {{ $t("song.cancel") }}
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
            {{ $t("song.drag_drop_title") }}
          </h3>
          <p class="text-neutral-400 mb-8 font-medium">
            {{ $t("song.drag_drop_subtitle") }}
          </p>
          <UButton
            color="primary"
            variant="solid"
            :label="$t('song.select_file_button')"
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
              <span class="text-sm font-semibold">{{
                $t("song.cover_image")
              }}</span>
            </div>

            <div
              class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
              @click="triggerImageInput"
            >
              <div class="flex flex-col items-center text-white">
                <UIcon name="i-lucide-camera" class="size-10 mb-2" />
                <span class="text-sm font-bold">{{
                  $t("song.change_image")
                }}</span>
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
              {{ $t("song.file_info") }}
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
                >{{ (form.audioFile?.size / 1024 / 1024).toFixed(2) }}
                {{ $t("song.file_size") }}</span
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
            <UFormGroup
              :label="$t('song.song_title')"
              required
              :ui="labelStyle"
            >
              <UInput
                v-model="form.title"
                :placeholder="$t('song.song_title_placeholder')"
                size="xl"
                autofocus
                :ui="inputSpotifyStyle"
              />
            </UFormGroup>

            <div class="grid grid-cols-1 gap-6 flex-1">
              <UFormGroup
                :label="$t('song.artists_featuring')"
                required
                :ui="labelStyle"
              >
                <USelectMenu
                  v-model="form.selectedArtists"
                  :items="allArtists"
                  @click="fetchArtists"
                  :placeholder="$t('song.artists_placeholder')"
                  multiple
                  value-key="UserId"
                  label-key="FullName"
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
                  <template #item="{ item }">
                    <div class="flex items-center justify-around">
                      <div class="flex items-center">
                        <UAvatar :src="item.Avatar" size="2xs" class="mr-2" />
                        <span class="truncate">{{ item.FullName }}</span>
                      </div>
                      <UIcon :name="'i-lucide-tick'"></UIcon>
                    </div>
                  </template>
                </USelectMenu>
              </UFormGroup>
            </div>
          </div>

          <UFormGroup
            :label="$t('song.primary_genre')"
            required
            :ui="labelStyle"
          >
            <USelectMenu
              v-model="form.selectedGenres"
              multiple
              :items="availableGenres"
              label-key="Name"
              value-key="Id"
              :placeholder="$t('song.genre_placeholder')"
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
            class="pt-8 mt-4 border-t border-white/10 flex items-center justify-end gap-4"
          >
            <div class="mr-auto text-xs text-neutral-500 max-w-xs">
              {{ $t("song.disclaimer") }}
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
              {{ isSubmitting ? $t("song.uploading") : $t("song.upload_now") }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- UPLOAD TRACKING MODAL -->
      <Transition name="fade">
        <div
          v-if="isSubmitting && showUploadTracker"
          class="fixed top-0 left-0 right-0 bottom-0 z-[999] w-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div
            class="p-8 text-white bg-[#282828] rounded-xl shadow-2xl max-w-md w-full mx-4 border border-white/10"
          >
            <div class="flex flex-col items-center gap-6">
              <!-- Spinner -->
              <div class="relative w-16 h-16">
                <div
                  class="absolute inset-0 border-4 border-transparent border-t-[#1DB954] border-r-[#1DB954] rounded-full animate-spin"
                ></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <UIcon name="i-lucide-music" class="size-8 text-[#1DB954]" />
                </div>
              </div>

              <!-- Status Text -->
              <div class="text-center">
                <h3 class="text-lg font-bold mb-2">{{ statusMessage }}</h3>
                <p class="text-sm text-neutral-400">{{ uploadPercent }}%</p>
              </div>

              <!-- Progress Bar -->
              <div
                class="w-full bg-neutral-700 rounded-full h-2 overflow-hidden"
              >
                <div
                  class="bg-gradient-to-r from-[#1DB954] to-[#1ed760] h-full transition-all duration-300"
                  :style="{ width: uploadPercent + '%' }"
                ></div>
              </div>

              <!-- Upload Details -->
              <div
                v-if="uploadFileInfo"
                class="w-full p-4 bg-black/30 rounded-lg border border-white/5"
              >
                <div class="space-y-2 text-xs">
                  <div class="flex justify-between">
                    <span class="text-neutral-400"
                      >{{ $t("song.file_info") }}:</span
                    >
                    <span class="text-white font-medium">{{
                      uploadFileInfo
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-neutral-400"
                      >{{ $t("song.file_size") }}:</span
                    >
                    <span class="text-white font-medium">{{
                      uploadFileSize
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import musicApi from "~/api/musicApi";
import fileApi from "~/api/fileApi";
import userApi from "~/api/userApi";
import artistApi from "~/api/artistApi";
import { calculateMD5 } from "~/utils/fileHasher";

definePageMeta({ layout: "auth" });

// --- STATE ---
const currentUser = ref(null);
const allArtists = ref([]);
const availableGenres = ref([]);
const isSubmitting = ref(false);
const currentStep = ref(1);
const isDragging = ref(false);
const audioInputRef = ref(null);
const imageInputRef = ref(null);
const uploadProgress = ref(0);
const statusMessage = ref("");
const toast = useToast();

// Upload tracking state
const showUploadTracker = ref(false);
const uploadPercent = ref(0);
const uploadFileInfo = ref("");
const uploadFileSize = ref("");

// State form
const form = reactive({
  audioFile: null,
  duration: 0,
  coverImageFile: null,
  coverImagePreview: null,
  title: "",
  selectedArtists: [],
  selectedGenres: [],
});

// Styles
const inputSpotifyStyle = {
  base: "bg-[#3E3E3E] text-white ring-0 focus:ring-2 w-[300px] focus:ring-primary placeholder:text-neutral-400",
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

const fetchArtists = async (q) => {
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

const processAudio = (file) => {
  if (!file.type.startsWith("audio/")) {
    toast.add({
      title: $t("song.error_title"),
      description: $t("song.select_audio_error"),
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

// Upload helper functions
const uploadCoverImage = async () => {
  if (!form.coverImageFile) return "";
  try {
    updateUploadStatus($t("song.upload_cover_image"), 10);
    const imgRes = await fileApi.uploadDirect(form.coverImageFile, "image");
    updateUploadStatus($t("song.upload_cover_image"), 30);
    return imgRes.secure_url;
  } catch (error) {
    console.error("Error uploading cover image:", error);
    throw error;
  }
};

const checkAndUploadAudio = async () => {
  if (!form.audioFile) return { audioUrl: "", duration: 0, fileHash: "" };

  try {
    updateUploadStatus($t("song.checking_file"), 35);

    const fileHash = await calculateMD5(form.audioFile);
    console.log("File Hash:", fileHash);

    const checkRes = await musicApi.checkHash(fileHash);

    if (checkRes.Exists) {
      console.log("File already exists. Using cached URL:", checkRes.FileUrl);
      updateUploadStatus($t("song.file_exists"), 70);
      uploadPercent.value = 70;
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        audioUrl: checkRes.FileUrl,
        duration: checkRes.Duration,
        fileHash: fileHash,
      };
    } else {
      console.log("New file. Starting upload...");
      const filename = form.audioFile.name;
      updateUploadStatus($t("song.uploading_music", { filename }), 40);
      uploadFileInfo.value = filename;
      uploadFileSize.value = `${(form.audioFile.size / 1024 / 1024).toFixed(2)} MB`;

      const audioRes = await fileApi.uploadDirect(
        form.audioFile,
        "video",
        (percent) => {
          uploadPercent.value = Math.min(40 + percent * 0.5, 90);
        },
      );
      console.log("Cloudinary Response:", audioRes);

      return {
        audioUrl: audioRes.secure_url,
        duration: audioRes.duration,
        fileHash: fileHash,
      };
    }
  } catch (error) {
    console.error("Error uploading audio:", error);
    throw error;
  }
};

const updateUploadStatus = (message, percent) => {
  statusMessage.value = message;
  uploadPercent.value = percent;
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  showUploadTracker.value = true;
  uploadPercent.value = 0;
  uploadFileInfo.value = "";
  uploadFileSize.value = "";

  try {
    // Upload cover image
    let thumbnailUrl = "";
    if (form.coverImageFile) {
      thumbnailUrl = await uploadCoverImage();
    }

    // Upload audio or use cached version
    const { audioUrl, duration, fileHash } = await checkAndUploadAudio();

    // Save song info
    updateUploadStatus($t("song.saving_song_info"), 95);

    const createPayload = {
      Title: form.title,
      FileUrl: audioUrl,
      Thumbnail: thumbnailUrl,
      Duration: Math.round(duration || form.duration),
      FileHash: fileHash,
      ArtistIds: form.selectedArtists.map((u) => u.UserId || u.user_id),
      GenreIds: form.selectedGenres,
      Lyrics: "",
    };

    await musicApi.createSong(createPayload);

    uploadPercent.value = 100;
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast.add({
      title: $t("song.success_title"),
      description: $t("song.success_message"),
      color: "green",
    });

    resetForm();
  } catch (error) {
    console.error("Error submitting song:", error);
    toast.add({
      title: $t("song.error_title"),
      description: $t("song.error_message"),
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
    showUploadTracker.value = false;
    statusMessage.value = "";
    uploadPercent.value = 0;
    uploadFileInfo.value = "";
    uploadFileSize.value = "";
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

const formatDuration = (s) => {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sc = s % 60;
  return `${m}:${sc.toString().padStart(2, "0")}`;
};
</script>
