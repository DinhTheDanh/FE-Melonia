<template>
  <div class="min-h-screen bg-[#121212] text-white">
    <!-- Loading State with Skeleton -->
    <div v-if="isLoading">
      <!-- Skeleton Header -->
      <div class="relative">
        <div
          class="absolute inset-0 h-96 bg-gradient-to-b from-neutral-800/40 to-[#121212]"
        />
        <div class="relative px-8 pt-16 pb-6">
          <div class="max-w-7xl mx-auto">
            <!-- Back button skeleton -->
            <div
              class="w-32 h-5 bg-neutral-700/50 rounded animate-pulse mb-6"
            ></div>

            <!-- Header Content -->
            <div class="flex items-end gap-6">
              <!-- Album Cover Skeleton -->
              <div
                class="w-56 h-56 rounded-lg bg-neutral-700 animate-pulse shrink-0"
              ></div>

              <!-- Metadata Skeleton -->
              <div class="flex flex-col gap-3 pb-2">
                <div
                  class="w-16 h-4 bg-neutral-700/50 rounded animate-pulse"
                ></div>
                <div
                  class="w-64 h-12 bg-neutral-700 rounded animate-pulse"
                ></div>
                <div
                  class="w-48 h-4 bg-neutral-700/50 rounded animate-pulse mt-4"
                ></div>
              </div>
            </div>

            <!-- Action Buttons Skeleton -->
            <div class="flex items-center gap-6 mt-8">
              <div
                class="w-14 h-14 rounded-full bg-neutral-700 animate-pulse"
              ></div>
              <div
                class="w-8 h-8 rounded-full bg-neutral-700/50 animate-pulse"
              ></div>
              <div
                class="w-8 h-8 rounded-full bg-neutral-700/50 animate-pulse"
              ></div>
              <div
                class="w-8 h-8 rounded-full bg-neutral-700/50 animate-pulse"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton Song List -->
      <div class="px-8 pb-8">
        <div class="max-w-7xl mx-auto">
          <div class="space-y-2 mt-4">
            <div
              v-for="i in 5"
              :key="i"
              class="flex items-center gap-4 px-4 py-3"
            >
              <div
                class="w-4 h-4 bg-neutral-700/50 rounded animate-pulse"
              ></div>
              <div class="w-10 h-10 bg-neutral-700 rounded animate-pulse"></div>
              <div class="flex-1 space-y-2">
                <div
                  class="h-4 bg-neutral-700 rounded animate-pulse"
                  :style="{ width: `${30 + Math.random() * 30}%` }"
                ></div>
                <div
                  class="w-24 h-3 bg-neutral-700/50 rounded animate-pulse"
                ></div>
              </div>
              <div
                class="w-20 h-4 bg-neutral-700/50 rounded animate-pulse"
              ></div>
              <div
                class="w-12 h-4 bg-neutral-700/50 rounded animate-pulse"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Album Content -->
    <template v-else-if="album">
      <!-- Hero Header with Gradient -->
      <div class="relative">
        <!-- Gradient Background -->
        <div
          class="absolute inset-0 h-96"
          :style="{
            background: `linear-gradient(180deg, ${dominantColor}40 0%, ${dominantColor}20 50%, #121212 100%)`,
          }"
        />

        <div class="relative px-8 pt-16 pb-6">
          <div class="max-w-7xl mx-auto">
            <!-- Back Button -->
            <NuxtLink
              to="/user/my-albums"
              class="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
            >
              <UIcon name="i-lucide-arrow-left" class="size-5" />
              <span>{{ $t("song.my_albums") }}</span>
            </NuxtLink>

            <!-- Header Content -->
            <div class="flex items-end gap-6">
              <!-- Album Cover -->
              <div
                class="w-56 h-56 rounded-lg shadow-2xl overflow-hidden shrink-0 bg-[#282828]"
              >
                <img
                  v-if="album.Thumbnail"
                  :src="album.Thumbnail"
                  :alt="album.Title"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-disc-2"
                    class="size-24 text-[#7F7F7F]"
                  />
                </div>
              </div>

              <!-- Metadata -->
              <div class="flex flex-col gap-2 pb-2">
                <span class="text-xs font-bold uppercase tracking-wider"
                  >Album</span
                >
                <h1 class="text-6xl font-black tracking-tight">
                  {{ album.Title }}
                </h1>
                <p class="text-neutral-400 text-sm mt-4">
                  <span class="text-white font-medium">{{
                    album.ArtistName || "You"
                  }}</span>
                  •
                  <span v-if="album.ReleaseDate">{{
                    formatYear(album.ReleaseDate)
                  }}</span>
                  • {{ songs.length }} {{ $t("song.songs_count") }},
                  {{ totalDuration }}
                </p>
              </div>
            </div>

            <!-- Action Buttons Row -->
            <div class="flex items-center gap-6 mt-8">
              <!-- Large Play Button -->
              <button
                class="w-14 h-14 bg-purple-500 hover:bg-purple-400 hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="songs.length === 0"
                @click="playAll"
              >
                <UIcon name="i-lucide-play" class="size-7 text-black ml-1" />
              </button>

              <!-- Shuffle -->
              <button
                class="p-2 hover:scale-110 transition-transform cursor-pointer"
              >
                <UIcon
                  name="i-lucide-shuffle"
                  class="size-8 text-neutral-400 hover:text-white transition-colors"
                />
              </button>

              <!-- Add Songs Button -->
              <button
                class="p-2 hover:scale-110 transition-transform cursor-pointer"
                @click="openAddSongsModal"
              >
                <UIcon
                  name="i-lucide-plus-circle"
                  class="size-8 text-neutral-400 hover:text-white transition-colors"
                />
              </button>

              <!-- Edit Album -->
              <button
                class="p-2 hover:scale-110 transition-transform cursor-pointer"
                @click="openEditAlbumModal"
              >
                <UIcon
                  name="i-lucide-pencil"
                  class="size-7 text-neutral-400 hover:text-white transition-colors"
                />
              </button>

              <!-- Delete Album -->
              <button
                class="p-2 hover:scale-110 transition-transform cursor-pointer"
                @click="openDeleteAlbumConfirm"
              >
                <UIcon
                  name="i-lucide-trash-2"
                  class="size-7 text-neutral-400 hover:text-red-400 transition-colors"
                />
              </button>

              <!-- Search (Right aligned) -->
              <div class="ml-auto relative">
                <div
                  class="flex items-center transition-all duration-300"
                  :class="isSearchFocused ? 'w-64' : 'w-48'"
                >
                  <UIcon
                    name="i-lucide-search"
                    class="absolute left-3 size-4 text-neutral-400"
                  />
                  <input
                    v-model="searchInput"
                    type="text"
                    :placeholder="$t('song.search_in_playlist')"
                    class="w-full h-8 bg-[#242424] text-white text-sm pl-9 pr-4 rounded border border-transparent focus:border-white/20 focus:bg-[#2a2a2a] outline-none placeholder:text-neutral-500 transition-all"
                    @focus="isSearchFocused = true"
                    @blur="isSearchFocused = false"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="px-8 pb-8">
        <div class="max-w-7xl mx-auto">
          <!-- Empty State -->
          <div v-if="songs.length === 0" class="text-center py-20">
            <UIcon
              name="i-lucide-music"
              class="size-20 mx-auto mb-4 text-neutral-600"
            />
            <p class="text-xl text-neutral-400 mb-6">
              {{ $t("song.no_songs") }}
            </p>
            <button
              class="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-bold py-3 px-8 rounded-full transition-colors cursor-pointer"
              @click="openAddSongsModal"
            >
              <UIcon name="i-lucide-plus" class="size-5" />
              {{ $t("album.add_songs") }}
            </button>
          </div>

          <!-- Songs List -->
          <div v-else>
            <!-- Table Header -->
            <div
              class="grid grid-cols-[16px_minmax(200px,4fr)_minmax(120px,1fr)_60px_40px] gap-4 px-4 py-2 border-b border-white/10 text-xs uppercase tracking-wider text-neutral-400 sticky top-0 bg-[#121212] z-5"
            >
              <div class="text-center">#</div>
              <div>{{ $t("song.song_title") }}</div>
              <div>{{ $t("song.date_added") }}</div>
              <div class="text-center">
                <UIcon name="i-lucide-clock" class="size-4" />
              </div>
              <div></div>
            </div>

            <!-- Track Rows -->
            <div class="mt-2">
              <div
                v-for="(song, index) in filteredSongs"
                :key="song.SongId"
                class="group grid grid-cols-[16px_minmax(200px,4fr)_minmax(120px,1fr)_60px_40px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors items-center"
              >
                <!-- # / Play -->
                <div class="flex items-center justify-center relative">
                  <span
                    class="text-sm text-neutral-400 group-hover:opacity-0 transition-opacity"
                  >
                    {{ index + 1 }}
                  </span>
                  <button
                    class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none outline-none bg-transparent"
                    @click="playSong(song)"
                  >
                    <UIcon name="i-lucide-play" class="size-4 text-white" />
                  </button>
                </div>

                <!-- Title + Artist -->
                <div class="flex items-center gap-3 min-w-0">
                  <!-- Thumbnail -->
                  <div
                    class="relative w-10 h-10 rounded overflow-hidden shrink-0"
                  >
                    <img
                      v-if="song.Thumbnail"
                      :src="song.Thumbnail"
                      :alt="song.Title"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-[#282828] flex items-center justify-center"
                    >
                      <UIcon
                        name="i-lucide-music"
                        class="size-5 text-neutral-500"
                      />
                    </div>
                  </div>

                  <!-- Title & Artist -->
                  <div class="min-w-0 flex-1">
                    <p class="text-white text-sm font-medium truncate">
                      {{ song.Title }}
                    </p>
                    <p
                      class="text-neutral-400 text-xs truncate hover:text-white hover:underline cursor-pointer"
                    >
                      {{ song.ArtistNames || "-" }}
                    </p>
                  </div>
                </div>

                <!-- Date Added -->
                <div class="text-neutral-400 text-sm">
                  {{ formatRelativeDate(song.CreatedAt) }}
                </div>

                <!-- Duration -->
                <div class="text-neutral-400 text-sm text-center">
                  {{ formatDuration(song.Duration) }}
                </div>

                <!-- More button with dropdown -->
                <div class="flex items-center justify-center">
                  <UDropdownMenu
                    :items="[
                      {
                        label: $t('album.remove_from_album'),
                        icon: 'i-lucide-x',
                        color: 'error',
                        onSelect: () => openRemoveSongConfirm(song),
                      },
                    ]"
                  >
                    <button
                      class="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <UIcon
                        name="i-lucide-more-horizontal"
                        class="size-5 text-neutral-400 hover:text-white"
                      />
                    </button>
                  </UDropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="flex flex-col items-center justify-center h-screen">
      <UIcon name="i-lucide-disc-2" class="size-20 text-neutral-600 mb-4" />
      <p class="text-xl text-neutral-400 mb-6">{{ $t("album.not_found") }}</p>
      <NuxtLink to="/user/my-albums">
        <button
          class="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-bold py-3 px-8 rounded-full transition-colors cursor-pointer"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
          {{ $t("song.my_albums") }}
        </button>
      </NuxtLink>
    </div>

    <!-- Add Songs Modal -->
    <Transition name="fade">
      <div
        v-if="isAddSongsModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click="closeAddSongsModal"
      >
        <div
          class="bg-[#282828] rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
          @click.stop
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">{{ $t("album.add_songs") }}</h2>
            <button
              class="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              @click="closeAddSongsModal"
            >
              <UIcon name="i-lucide-x" class="size-5" />
            </button>
          </div>

          <!-- Search -->
          <div class="relative mb-4">
            <UIcon
              name="i-lucide-search"
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400"
            />
            <input
              v-model="addSongSearch"
              type="text"
              :placeholder="$t('song.search_placeholder')"
              class="w-full bg-[#3E3E3E] text-white text-sm pl-10 pr-4 py-3 rounded-lg border border-transparent focus:border-purple-500 outline-none placeholder:text-neutral-500 transition-colors"
            />
          </div>

          <!-- Available Songs List -->
          <div class="flex-1 overflow-y-auto space-y-1">
            <div
              v-if="availableSongsFiltered.length === 0"
              class="text-center py-10 text-neutral-400"
            >
              {{ $t("album.no_available_songs") }}
            </div>
            <div
              v-for="song in availableSongsFiltered"
              :key="song.SongId"
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              @click="addSongToAlbum(song)"
            >
              <!-- Thumbnail -->
              <div class="w-10 h-10 rounded overflow-hidden shrink-0">
                <img
                  v-if="song.Thumbnail"
                  :src="song.Thumbnail"
                  :alt="song.Title"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full bg-[#3E3E3E] flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-music"
                    class="size-5 text-neutral-500"
                  />
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-white text-sm font-medium truncate">
                  {{ song.Title }}
                </p>
                <p class="text-neutral-400 text-xs truncate">
                  {{ song.ArtistNames || "-" }}
                </p>
              </div>

              <!-- Add button -->
              <button
                class="p-2 text-purple-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-full transition-colors"
              >
                <UIcon name="i-lucide-plus" class="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Edit Album Modal -->
    <Transition name="fade">
      <div
        v-if="isEditAlbumModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click="closeEditAlbumModal"
      >
        <div
          class="bg-[#282828] rounded-xl p-8 max-w-2xl w-full mx-4"
          @click.stop
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">{{ $t("song.edit_album") }}</h2>
            <button
              class="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              @click="closeEditAlbumModal"
            >
              <UIcon name="i-lucide-x" class="size-5" />
            </button>
          </div>

          <div class="flex flex-col sm:flex-row gap-6">
            <!-- Album Cover -->
            <div
              class="group relative w-40 h-40 shrink-0 mx-auto sm:mx-0 shadow-lg"
            >
              <img
                v-if="editForm.coverPreview"
                :src="editForm.coverPreview"
                class="w-full h-full object-cover rounded shadow-lg"
              />
              <div
                v-else
                class="w-full h-full bg-[#3E3E3E] flex flex-col items-center justify-center rounded shadow-lg gap-2"
              >
                <UIcon name="i-lucide-disc-2" class="size-12 text-[#7F7F7F]" />
                <span class="text-xs font-bold text-[#7F7F7F]">{{
                  $t("song.cover_image")
                }}</span>
              </div>
              <div
                class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded"
                @click="triggerEditFileInput"
              >
                <UIcon name="i-lucide-camera" class="size-8 mb-2 text-white" />
                <span class="text-[10px] font-bold uppercase tracking-widest">
                  {{ $t("song.change_image") }}
                </span>
              </div>
              <input
                type="file"
                ref="editFileInputRef"
                class="hidden"
                accept="image/*"
                @change="handleEditFileSelect"
              />
            </div>

            <!-- Form Fields -->
            <div class="flex-1 space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-bold text-neutral-300 mb-2">
                  {{ $t("song.album_title") }}
                </label>
                <input
                  v-model="editForm.title"
                  type="text"
                  :placeholder="$t('song.album_title_placeholder')"
                  class="w-full bg-[#3E3E3E] text-white px-4 py-3 rounded border-transparent focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-neutral-500 transition-all"
                />
              </div>

              <!-- Release Date -->
              <div>
                <label class="block text-sm font-bold text-neutral-300 mb-2">
                  {{ $t("song.release_date") }}
                </label>
                <input
                  v-model="editForm.releaseDate"
                  type="date"
                  class="w-full bg-[#3E3E3E] text-white px-4 py-3 rounded border-transparent focus:ring-2 focus:ring-purple-500 appearance-none [&::-webkit-calendar-picker-indicator]:invert outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="px-6 py-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              @click="closeEditAlbumModal"
            >
              {{ $t("song.cancel") }}
            </button>
            <button
              class="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-black font-bold rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!isEditFormValid || isSaving"
              @click="handleEditAlbumSave"
            >
              <span v-if="isSaving" class="flex items-center gap-2">
                <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
                {{ $t("song.uploading") }}
              </span>
              <span v-else>{{ $t("song.save_changes") }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Remove Song Confirm Modal -->
    <Transition name="fade">
      <div
        v-if="isRemoveSongConfirmOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click="closeRemoveSongConfirm"
      >
        <div
          class="bg-[#282828] rounded-lg p-6 max-w-md w-full mx-4"
          @click.stop
        >
          <h2 class="text-xl font-bold mb-4">
            {{ $t("album.remove_song_title") }}
          </h2>
          <p class="text-neutral-400 mb-6">
            {{ $t("album.remove_song_confirmation") }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-6 py-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              @click="closeRemoveSongConfirm"
            >
              {{ $t("song.cancel") }}
            </button>
            <button
              class="px-6 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full transition-colors cursor-pointer"
              :disabled="isRemoving"
              @click="confirmRemoveSong"
            >
              <span v-if="isRemoving" class="flex items-center gap-2">
                <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
              </span>
              <span v-else>{{ $t("song.confirm") }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Album Confirm Modal -->
    <Transition name="fade">
      <div
        v-if="isDeleteAlbumConfirmOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click="closeDeleteAlbumConfirm"
      >
        <div
          class="bg-[#282828] rounded-lg p-6 max-w-md w-full mx-4"
          @click.stop
        >
          <h2 class="text-xl font-bold mb-4">
            {{ $t("song.confirm_delete") }}
          </h2>
          <p class="text-neutral-400 mb-6">
            {{ $t("song.delete_album_confirmation") }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-6 py-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              @click="closeDeleteAlbumConfirm"
            >
              {{ $t("song.cancel") }}
            </button>
            <button
              class="px-6 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full transition-colors cursor-pointer"
              :disabled="isDeleting"
              @click="confirmDeleteAlbum"
            >
              <span v-if="isDeleting" class="flex items-center gap-2">
                <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
              </span>
              <span v-else>{{ $t("song.confirm") }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import musicApi from "~/api/musicApi";
import fileApi from "~/api/fileApi";
import { useDominantColor } from "~/composables/useDominantColor";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t: $t } = useI18n();

// States
const album = ref(null);
const songs = ref([]);
const mySongs = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const isRemoving = ref(false);
const isDeleting = ref(false);
const isSearchFocused = ref(false);
const searchInput = ref("");
const addSongSearch = ref("");

// Modals
const isAddSongsModalOpen = ref(false);
const isEditAlbumModalOpen = ref(false);
const isRemoveSongConfirmOpen = ref(false);
const isDeleteAlbumConfirmOpen = ref(false);
const songToRemove = ref(null);
const editFileInputRef = ref(null);

// Edit form
const editForm = reactive({
  title: "",
  releaseDate: "",
  imageFile: null,
  coverPreview: null,
});

// Dominant color
const albumThumbnail = computed(() => album.value?.Thumbnail || null);
const { dominantColor } = useDominantColor(albumThumbnail);

// Computed
const isEditFormValid = computed(() => editForm.title.trim().length > 0);

const totalDuration = computed(() => {
  const total = songs.value.reduce((acc, s) => acc + (s.Duration || 0), 0);
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} min`;
});

const filteredSongs = computed(() => {
  if (!searchInput.value.trim()) return songs.value;
  const query = searchInput.value.toLowerCase().trim();
  return songs.value.filter((song) => {
    const title = (song.Title || "").toLowerCase();
    const artist = (song.ArtistNames || "").toLowerCase();
    return title.includes(query) || artist.includes(query);
  });
});

const availableSongs = computed(() => {
  const albumSongIds = songs.value.map((s) => s.SongId);
  return mySongs.value.filter((s) => !albumSongIds.includes(s.SongId));
});

const availableSongsFiltered = computed(() => {
  if (!addSongSearch.value.trim()) return availableSongs.value;
  const query = addSongSearch.value.toLowerCase().trim();
  return availableSongs.value.filter((song) => {
    const title = (song.Title || "").toLowerCase();
    const artist = (song.ArtistNames || "").toLowerCase();
    return title.includes(query) || artist.includes(query);
  });
});

// Methods
const fetchAlbumDetail = async () => {
  isLoading.value = true;
  try {
    const res = await musicApi.getAlbumDetail(route.params.id, {
      pageSize: 100,
    });

    // API returns { Album: {...}, Songs: { Data: [...], TotalRecords, ... } }
    if (res && res.Album) {
      album.value = res.Album;
      songs.value = res.Songs?.Data || [];
    } else if (res && res.data && res.data.Album) {
      // Maybe wrapped in data
      album.value = res.data.Album;
      songs.value = res.data.Songs?.Data || [];
    } else {
      album.value = null;
    }
  } catch (error) {
    console.error("Error fetching album:", error);
    album.value = null;
  } finally {
    isLoading.value = false;
  }
};

const fetchMySongs = async () => {
  try {
    const res = await musicApi.getMySongs();
    mySongs.value = res.Data || res.data || res || [];
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
};

const formatYear = (date) => {
  if (!date) return "";
  return new Date(date).getFullYear();
};

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatRelativeDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Hôm nay";
  if (diff === 1) return "Hôm qua";
  if (diff < 7) return `${diff} ngày trước`;
  if (diff < 30) return `${Math.floor(diff / 7)} tuần trước`;
  return d.toLocaleDateString("vi-VN");
};

const playAll = () => {
  // TODO: Implement play all
  console.log("Play all songs");
};

const playSong = (song) => {
  // TODO: Implement play song
  console.log("Play song:", song.Title);
};

// Add Songs Modal
const openAddSongsModal = async () => {
  await fetchMySongs();
  addSongSearch.value = "";
  isAddSongsModalOpen.value = true;
};

const closeAddSongsModal = () => {
  isAddSongsModalOpen.value = false;
};

const addSongToAlbum = async (song) => {
  try {
    await musicApi.addSongToAlbum(album.value.AlbumId, song.SongId);
    songs.value.push(song);
    toast.add({
      title: $t("song.success_title"),
      description: $t("album.song_added_success"),
      color: "green",
    });
  } catch (error) {
    console.error("Error adding song:", error);
    toast.add({
      title: $t("song.error_title"),
      description: $t("album.song_add_error"),
      color: "red",
    });
  }
};

// Remove Song
const openRemoveSongConfirm = (song) => {
  songToRemove.value = song;
  isRemoveSongConfirmOpen.value = true;
};

const closeRemoveSongConfirm = () => {
  isRemoveSongConfirmOpen.value = false;
  songToRemove.value = null;
};

const confirmRemoveSong = async () => {
  if (!songToRemove.value) return;

  isRemoving.value = true;
  try {
    await musicApi.removeSongFromAlbum(
      album.value.AlbumId,
      songToRemove.value.SongId,
    );
    songs.value = songs.value.filter(
      (s) => s.SongId !== songToRemove.value.SongId,
    );
    toast.add({
      title: $t("song.success_title"),
      description: $t("album.song_removed_success"),
      color: "green",
    });
    closeRemoveSongConfirm();
  } catch (error) {
    console.error("Error removing song:", error);
    toast.add({
      title: $t("song.error_title"),
      description: $t("album.song_remove_error"),
      color: "red",
    });
  } finally {
    isRemoving.value = false;
  }
};

// Edit Album Modal
const openEditAlbumModal = () => {
  editForm.title = album.value.Title;
  editForm.releaseDate = album.value.ReleaseDate?.split("T")[0] || "";
  editForm.imageFile = null;
  editForm.coverPreview = album.value.Thumbnail || null;
  isEditAlbumModalOpen.value = true;
};

const closeEditAlbumModal = () => {
  isEditAlbumModalOpen.value = false;
  editForm.title = "";
  editForm.releaseDate = "";
  editForm.imageFile = null;
  editForm.coverPreview = null;
};

const triggerEditFileInput = () => editFileInputRef.value.click();

const handleEditFileSelect = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    editForm.imageFile = file;
    editForm.coverPreview = URL.createObjectURL(file);
  }
};

const handleEditAlbumSave = async () => {
  isSaving.value = true;
  try {
    let thumbnailUrl = album.value.Thumbnail;

    if (editForm.imageFile) {
      const res = await fileApi.uploadDirect(editForm.imageFile, "image");
      thumbnailUrl = res.secure_url;
    }

    const payload = {
      title: editForm.title,
      release_date: editForm.releaseDate,
      thumbnail: thumbnailUrl,
    };

    await musicApi.updateAlbum(album.value.AlbumId, payload);

    // Update local state
    album.value.Title = editForm.title;
    album.value.ReleaseDate = editForm.releaseDate;
    album.value.Thumbnail = thumbnailUrl;

    toast.add({
      title: $t("song.success_title"),
      description: $t("song.update_success"),
      color: "green",
    });

    closeEditAlbumModal();
  } catch (error) {
    console.error("Error updating album:", error);
    toast.add({
      title: $t("song.error_title"),
      description: $t("song.update_error"),
      color: "red",
    });
  } finally {
    isSaving.value = false;
  }
};

// Delete Album
const openDeleteAlbumConfirm = () => {
  isDeleteAlbumConfirmOpen.value = true;
};

const closeDeleteAlbumConfirm = () => {
  isDeleteAlbumConfirmOpen.value = false;
};

const confirmDeleteAlbum = async () => {
  if (!album.value) return;

  isDeleting.value = true;
  try {
    await musicApi.deleteAlbum(album.value.AlbumId);
    toast.add({
      title: $t("song.success_title"),
      description: $t("song.delete_success"),
      color: "green",
    });
    // Redirect to my-albums page
    router.push("/user/my-albums");
  } catch (error) {
    console.error("Error deleting album:", error);
    toast.add({
      title: $t("song.error_title"),
      description: $t("song.delete_error"),
      color: "red",
    });
  } finally {
    isDeleting.value = false;
  }
};

// Initialize
onMounted(async () => {
  await fetchAlbumDetail();
});

// Also watch for route changes
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await fetchAlbumDetail();
    }
  },
  { immediate: false },
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
