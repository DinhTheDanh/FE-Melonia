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
                  @click="fetchArtists()"
                  :placeholder="$t('song.artists_placeholder')"
                  multiple
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
                    <div class="flex items-center justify-between w-full">
                      <div class="flex items-center min-w-0">
                        <UAvatar :src="item.Avatar" size="2xs" class="mr-2" />
                        <span class="truncate">{{ item.FullName }}</span>
                      </div>
                      <UIcon
                        v-if="isArtistSelected(item)"
                        name="i-lucide-check"
                        class="size-4 text-[#1DB954]"
                      />
                    </div>
                  </template>
                </USelectMenu>
              </UFormGroup>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <UFormGroup
              :label="$t('song.primary_genre')"
              required
              :ui="labelStyle"
              class="min-w-0"
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
                  <div class="flex items-center justify-between w-full">
                    <span class="truncate">{{ item.Name }}</span>
                    <UIcon
                      v-if="isGenreSelected(item)"
                      name="i-lucide-check"
                      class="size-4 text-[#1DB954]"
                    />
                  </div>
                </template>
              </USelectMenu>
            </UFormGroup>

            <UFormGroup
              :label="$t('song.add_to_album')"
              :ui="labelStyle"
              class="min-w-0"
            >
              <USelectMenu
                v-model="form.selectedAlbumId"
                :items="myAlbums"
                label-key="Title"
                value-key="AlbumId"
                :placeholder="$t('song.select_album')"
                size="xl"
                :ui="inputSpotifyStyle"
                :ui-menu="{
                  background: 'bg-[#282828] border border-neutral-700',
                  option: { active: 'bg-[#3E3E3E]' },
                }"
                @click="fetchMyAlbums()"
              >
                <template #item="{ item }">
                  <div class="flex items-center justify-between w-full gap-3">
                    <div class="flex items-center gap-2 min-w-0">
                      <img
                        v-if="item.Thumbnail"
                        :src="item.Thumbnail"
                        :alt="item.Title"
                        class="size-7 rounded object-cover shrink-0"
                      />
                      <div
                        v-else
                        class="size-7 rounded bg-[#3E3E3E] flex items-center justify-center shrink-0"
                      >
                        <UIcon
                          name="i-lucide-disc"
                          class="size-4 text-neutral-400"
                        />
                      </div>
                      <span class="truncate">{{ item.Title }}</span>
                    </div>
                    <UIcon
                      v-if="isAlbumSelected(item)"
                      name="i-lucide-check"
                      class="size-4 text-[#1DB954]"
                    />
                  </div>
                </template>
              </USelectMenu>
            </UFormGroup>
          </div>

          <p class="text-xs text-neutral-500 mt-1">
            {{ $t("song.no_album_notice") }}
          </p>

          <div
            class="pt-4 mt-3 border-t border-white/10 flex items-center justify-end gap-4"
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
              @click="openOwnershipModal"
            >
              {{ isSubmitting ? $t("song.uploading") : $t("song.upload_now") }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- UPLOAD LIMIT MODAL -->
      <Transition name="fade">
        <div
          v-if="showUploadLimitModal"
          class="fixed top-0 left-0 right-0 bottom-0 z-[997] w-full flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          @click.self="showUploadLimitModal = false"
        >
          <div
            class="w-full max-w-xl rounded-2xl bg-[#1f1f1f] border border-white/10 p-6 md:p-7 shadow-2xl"
          >
            <div class="flex items-start gap-3 mb-4">
              <div
                class="size-11 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-shield-alert" class="size-6" />
              </div>
              <div>
                <h3 class="text-lg md:text-xl font-bold text-white">
                  {{ $t("song.upload_limit_title") }}
                </h3>
                <p class="text-sm text-neutral-300 mt-2 leading-relaxed">
                  {{ $t("song.upload_limit_message") }}
                </p>
              </div>
            </div>

            <div
              v-if="uploadAccess.limit > 0"
              class="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
            >
              <p class="text-neutral-300">
                {{
                  $t("song.upload_limit_detail", {
                    used: uploadAccess.used,
                    limit: uploadAccess.limit,
                  })
                }}
              </p>
              <p v-if="uploadAccess.planName" class="text-neutral-500 mt-1">
                {{ $t("song.upload_limit_plan", { plan: uploadAccess.planName }) }}
              </p>
            </div>

            <div class="mt-6 flex items-center justify-end gap-3">
              <UButton color="gray" variant="soft" @click="goToMyMusic">
                {{ $t("song.manage_songs") }}
              </UButton>
              <UButton
                color="primary"
                class="font-bold"
                :ui="{
                  color: {
                    primary: {
                      solid: 'bg-[#1DB954] hover:bg-[#1ed760] text-black',
                    },
                  },
                }"
                @click="goToPricing"
              >
                {{ $t("song.upgrade_plan") }}
              </UButton>
            </div>
          </div>
        </div>
      </Transition>

      <!-- OWNERSHIP CONFIRMATION MODAL -->
      <Transition name="fade">
        <div
          v-if="showOwnershipModal"
          class="fixed top-0 left-0 right-0 bottom-0 z-[998] w-full flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <div
            class="w-full max-w-xl rounded-2xl bg-[#1f1f1f] border border-white/10 p-6 md:p-7 shadow-2xl"
            :class="{ 'modal-shake': ownershipShake }"
          >
            <h3 class="text-lg md:text-xl font-bold text-white mb-3">
              {{ $t("song.ownership_modal_title") }}
            </h3>
            <p
              class="text-sm md:text-base text-neutral-300 leading-relaxed mb-5"
            >
              {{ $t("song.ownership_commitment") }}
            </p>

            <label
              class="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-black/20 cursor-pointer"
            >
              <input
                v-model="ownershipAccepted"
                type="checkbox"
                class="mt-1 size-4 accent-[#1DB954]"
              />
              <span class="text-sm text-white">
                {{ $t("song.ownership_checkbox_label") }}
              </span>
            </label>

            <p
              v-if="ownershipShake && !ownershipAccepted"
              class="text-xs text-red-400 mt-3"
            >
              {{ $t("song.ownership_required") }}
            </p>

            <div class="mt-6 flex items-center justify-end gap-3">
              <UButton
                color="gray"
                variant="soft"
                @click="showOwnershipModal = false"
              >
                {{ $t("song.cancel") }}
              </UButton>
              <UButton
                color="primary"
                class="font-bold"
                :ui="{
                  color: {
                    primary: {
                      solid: 'bg-[#1DB954] hover:bg-[#1ed760] text-black',
                    },
                  },
                }"
                @click="confirmOwnershipAndSubmit"
              >
                {{ $t("song.upload_now") }}
              </UButton>
            </div>
          </div>
        </div>
      </Transition>

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
import paymentApi from "~/api/paymentApi";
import { calculateMD5 } from "~/utils/fileHasher";

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
const uploadProgress = ref(0);
const statusMessage = ref("");
const toast = useToast();

// Upload tracking state
const showUploadTracker = ref(false);
const uploadPercent = ref(0);
const uploadFileInfo = ref("");
const uploadFileSize = ref("");
const showOwnershipModal = ref(false);
const ownershipAccepted = ref(false);
const ownershipShake = ref(false);
const showUploadLimitModal = ref(false);
const uploadAccess = reactive({
  blocked: false,
  used: 0,
  limit: 0,
  planName: "",
});

// State form
const form = reactive({
  audioFile: null,
  duration: 0,
  coverImageFile: null,
  coverImagePreview: null,
  title: "",
  selectedArtists: [],
  selectedGenres: [],
  selectedAlbumId: null,
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
    currentUser.value = userRes?.Data || userRes || null;

    await checkUploadAccess();

    if (currentUser.value) {
      form.selectedArtists = [currentUser.value];

      if (
        !allArtists.value.some(
          (a) => getArtistId(a) === getArtistId(currentUser.value),
        )
      ) {
        allArtists.value = [currentUser.value, ...allArtists.value];
      }
    }

    await fetchArtists();
    await fetchMyAlbums();
  } catch (e) {}
});

const parseTotalItems = (response, fallbackLength = 0) => {
  return (
    response?.TotalRecords ||
    response?.TotalCount ||
    response?.Pagination?.TotalRecords ||
    response?.Pagination?.TotalCount ||
    response?.Meta?.TotalRecords ||
    response?.Meta?.TotalCount ||
    fallbackLength ||
    0
  );
};

const parseCanUpload = (response) => {
  const payload = response?.Data || response;
  if (typeof payload === "boolean") return payload;
  if (typeof payload?.CanUpload === "boolean") return payload.CanUpload;
  if (typeof payload?.canUpload === "boolean") return payload.canUpload;
  if (typeof payload?.Allowed === "boolean") return payload.Allowed;
  if (typeof payload?.allowed === "boolean") return payload.allowed;
  return null;
};

const checkUploadAccess = async () => {
  const role = currentUser.value?.Role || currentUser.value?.role;
  if (role !== "Artist") {
    uploadAccess.blocked = false;
    return;
  }

  try {
    const [mySongsRes, activeSubRes, plansRes, canUploadRes] = await Promise.all([
      musicApi.getMySongs({ pageIndex: 1, pageSize: 1 }).catch(() => null),
      paymentApi.getActiveSubscription().catch(() => null),
      paymentApi.getPlans().catch(() => null),
      paymentApi.canUpload().catch(() => null),
    ]);

    const currentSongs = mySongsRes?.Data || mySongsRes || [];
    const uploadedCount = parseTotalItems(mySongsRes, currentSongs.length);

    const activeSub = activeSubRes?.Data || activeSubRes || null;
    const plans = plansRes?.Data || plansRes || [];
    const activePlan = plans.find((plan) => plan.PlanId === activeSub?.PlanId);

    const uploadLimit = Number(activePlan?.UploadLimit);
    const hasLimitedQuota = Number.isFinite(uploadLimit) && uploadLimit > 0;
    const canUpload = parseCanUpload(canUploadRes);

    uploadAccess.used = uploadedCount;
    uploadAccess.limit = hasLimitedQuota ? uploadLimit : 0;
    uploadAccess.planName = activePlan?.PlanName || activeSub?.PlanName || "";

    const blockByCount = hasLimitedQuota && uploadedCount >= uploadLimit;
    const blockByFeature = canUpload === false;
    uploadAccess.blocked = blockByCount || blockByFeature;

    if (uploadAccess.blocked) {
      showUploadLimitModal.value = true;
    }
  } catch (error) {
    console.error("Upload access check failed:", error);
  }
};

const ensureUploadAccess = () => {
  if (!uploadAccess.blocked) return false;
  showUploadLimitModal.value = true;
  return true;
};

const goToPricing = () => {
  showUploadLimitModal.value = false;
  navigateTo("/pricing");
};

const goToMyMusic = () => {
  showUploadLimitModal.value = false;
  navigateTo("/user/my-music");
};

const fetchGenresIfNeeded = async () => {
  if (availableGenres.value.length === 0) {
    try {
      const res = await musicApi.getGenres();
      availableGenres.value = Array.isArray(res) ? res : res?.Data || [];
    } catch (e) {
      console.error("Lỗi Genre:", e);
    }
  }
};

const fetchMyAlbums = async () => {
  try {
    const res = await musicApi.getMyAlbums({ pageIndex: 1, pageSize: 100 });
    myAlbums.value = Array.isArray(res?.Data) ? res.Data : [];
  } catch (e) {
    console.error("Lỗi My Albums:", e);
  }
};

const fetchArtists = async (keyword = "") => {
  const normalizedKeyword = typeof keyword === "string" ? keyword.trim() : "";

  try {
    const res = await artistApi.getArtists({
      keyword: normalizedKeyword,
      pageIndex: 1,
      pageSize: 100,
    });

    const apiArtists = Array.isArray(res?.Data) ? res.Data : [];
    const mergedArtists = [...apiArtists];

    if (currentUser.value) {
      const currentUserId = getArtistId(currentUser.value);
      const existsInList = mergedArtists.some(
        (artist) => getArtistId(artist) === currentUserId,
      );
      if (!existsInList) {
        mergedArtists.unshift(currentUser.value);
      }
    }

    allArtists.value = mergedArtists;
  } catch (e) {
    console.error("Lỗi Artist:", e);
  }

  return allArtists.value;
};

const processAudio = (file) => {
  if (ensureUploadAccess()) return;

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
const triggerAudioInput = () => {
  if (ensureUploadAccess()) return;
  audioInputRef.value.click();
};

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
    const imgRes = await fileApi.uploadImage(form.coverImageFile, (percent) => {
      uploadPercent.value = Math.min(10 + percent * 0.2, 30);
    });
    updateUploadStatus($t("song.upload_cover_image"), 30);
    return imgRes.Url || imgRes.url;
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

      const audioRes = await fileApi.uploadAudio(form.audioFile, (percent) => {
        uploadPercent.value = Math.min(40 + percent * 0.5, 90);
      });
      console.log("Upload Response:", audioRes);

      return {
        audioUrl: audioRes.Url || audioRes.url,
        duration: audioRes.Duration || form.duration,
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

const getArtistId = (artist) => {
  if (!artist) return null;
  if (typeof artist === "string") return artist;
  return artist.UserId || artist.user_id || artist.Id || artist.id || null;
};

const getGenreId = (genre) => {
  if (!genre) return null;
  if (typeof genre === "string") return genre;
  return genre.Id || genre.id || genre.GenreId || genre.genre_id || null;
};

const selectedArtistIds = computed(() => {
  return new Set(
    form.selectedArtists.map((item) => getArtistId(item)).filter(Boolean),
  );
});

const selectedGenreIds = computed(() => {
  return new Set(
    form.selectedGenres.map((item) => getGenreId(item)).filter(Boolean),
  );
});

const selectedAlbumId = computed(() => {
  if (!form.selectedAlbumId) return null;
  if (typeof form.selectedAlbumId === "string") return form.selectedAlbumId;
  return (
    form.selectedAlbumId.AlbumId ||
    form.selectedAlbumId.albumId ||
    form.selectedAlbumId.Id ||
    null
  );
});

const isArtistSelected = (artist) => {
  const artistId = getArtistId(artist);
  return artistId ? selectedArtistIds.value.has(artistId) : false;
};

const isGenreSelected = (genre) => {
  const genreId = getGenreId(genre);
  return genreId ? selectedGenreIds.value.has(genreId) : false;
};

const isAlbumSelected = (album) => {
  const albumId = album?.AlbumId || album?.albumId || album?.Id || null;
  return albumId && selectedAlbumId.value === albumId;
};

const openOwnershipModal = () => {
  if (ensureUploadAccess()) return;
  if (isSubmitting.value || !isFormValid.value) return;
  ownershipAccepted.value = false;
  ownershipShake.value = false;
  showOwnershipModal.value = true;
};

const confirmOwnershipAndSubmit = async () => {
  if (!ownershipAccepted.value) {
    ownershipShake.value = true;
    setTimeout(() => {
      ownershipShake.value = false;
    }, 420);
    return;
  }

  showOwnershipModal.value = false;
  await handleSubmit();
};

const handleSubmit = async () => {
  if (ensureUploadAccess()) return;
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
      ArtistIds: [...selectedArtistIds.value],
      AlbumId: selectedAlbumId.value || null,
      GenreIds: [...selectedGenreIds.value],
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
  form.selectedAlbumId = null;
  form.selectedArtists = currentUser.value ? [currentUser.value] : [];
  showOwnershipModal.value = false;
  ownershipAccepted.value = false;
  ownershipShake.value = false;
};

const isFormValid = computed(() => {
  return (
    !uploadAccess.blocked &&
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

<style scoped>
@keyframes modal-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-6px);
  }
  80% {
    transform: translateX(6px);
  }
}

.modal-shake {
  animation: modal-shake 0.42s ease;
}
</style>
