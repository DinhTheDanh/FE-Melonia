<template>
  <div class="min-h-screen pb-8">
    <!-- Hero Header with Gradient -->
    <div
      ref="headerRef"
      class="relative -mx-4 -mt-4 px-8 pt-16 pb-8"
      style="
        background: linear-gradient(
          180deg,
          #535353 0%,
          #333333 40%,
          #121212 100%
        );
      "
    >
      <div class="flex items-end gap-6">
        <!-- Large Playlist Icon -->
        <div
          class="w-56 h-56 bg-linear-to-br from-[#282828] to-[#121212] rounded-lg shadow-2xl flex items-center justify-center shrink-0"
        >
          <UIcon name="i-lucide-music" class="size-24 text-[#7F7F7F]" />
        </div>

        <!-- Metadata -->
        <div class="flex-1 min-w-0 pb-2">
          <p class="text-xs font-bold text-white uppercase tracking-wider mb-2">
            {{ $t("playlist.private_playlist") }}
          </p>
          <h1 class="text-5xl font-black text-white leading-tight mb-4">
            {{ $t("song.my_music") }}
          </h1>
          <div class="flex items-center gap-2 text-sm text-neutral-200">
            <span class="font-semibold">{{ userName }}</span>
            <span class="text-neutral-400">·</span>
            <span>{{ songs.length }} {{ $t("song.songs_count") }}</span>
            <span v-if="totalDuration" class="text-neutral-400"
              >· {{ totalDuration }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="flex items-center gap-5 px-8 py-4">
      <div class="flex-1 relative h-14">
        <div
          v-if="selectedSongs.length === 0"
          class="absolute inset-0 flex items-center gap-3"
        >
          <!-- Upload Button -->
          <NuxtLink to="/create/song">
            <button
              class="p-2 text-neutral-400 hover:text-white hover:scale-110 transition-all cursor-pointer"
            >
              <UIcon name="i-lucide-plus-circle" class="size-7" />
            </button>
          </NuxtLink>
        </div>

        <div v-else class="absolute inset-0 flex items-center gap-3 px-2">
          <UCheckbox
            :model-value="isAllSelected"
            :indeterminate="isIndeterminate"
            @update:model-value="toggleSelectAll"
            :ui="{ base: 'cursor-pointer' }"
          />
          <span class="text-sm text-white font-semibold">
            {{ selectedSongs.length }} {{ $t("song.selected") }}
          </span>
          <button
            class="text-sm text-purple-500 hover:text-purple-400 cursor-pointer transition-colors"
            @click="selectedSongs = []"
          >
            {{ $t("song.deselect_all") }}
          </button>
          <div class="flex items-center gap-2 ml-auto">
            <button
              class="flex items-center gap-2 px-2 py-1 text-sm text-neutral-200 hover:text-white transition-colors cursor-pointer"
              @click="openBulkDeleteConfirm"
            >
              <UIcon name="i-lucide-trash-2" class="size-4 text-red-400" />
              {{ $t("song.delete") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Search (Right aligned) -->
      <div class="relative">
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

    <!-- Main Content -->
    <div class="px-4">
      <div v-if="isLoading" class="space-y-2">
        <div
          v-for="i in 10"
          :key="i"
          class="flex items-center gap-4 px-4 py-2 rounded-md"
        >
          <div class="w-4 h-4 bg-neutral-700/50 rounded animate-pulse"></div>
          <div
            class="w-10 h-10 bg-neutral-700 rounded animate-pulse shrink-0"
          ></div>
          <div class="flex-1 space-y-2">
            <div
              class="h-4 bg-neutral-700 rounded animate-pulse"
              :style="{ width: `${Math.random() * 30 + 30}%` }"
            ></div>
            <div class="w-24 h-3 bg-neutral-700/50 rounded animate-pulse"></div>
          </div>
          <div class="w-20 h-4 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="w-16 h-4 bg-neutral-700/50 rounded animate-pulse"></div>
          <div class="w-12 h-4 bg-neutral-700/50 rounded animate-pulse"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="songs.length === 0" class="text-center py-20">
        <UIcon
          name="i-lucide-music"
          class="size-20 mx-auto mb-4 text-neutral-600"
        />
        <p class="text-xl text-neutral-400 mb-6">{{ $t("song.no_songs") }}</p>
        <NuxtLink to="/create/song">
          <button
            class="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-bold py-3 px-8 rounded-full transition-colors cursor-pointer"
          >
            <UIcon name="i-lucide-plus" class="size-5" />
            {{ $t("song.upload_now") }}
          </button>
        </NuxtLink>
      </div>

      <!-- Songs List -->
      <div v-else>
        <!-- Table Header -->
        <div
          class="grid grid-cols-[28px_1fr_1fr_minmax(80px,100px)_60px_40px] gap-4 px-4 py-2 border-b border-white/10 text-xs uppercase tracking-wider text-neutral-400 sticky top-0 bg-[#121212] z-5"
        >
          <div></div>
          <div>{{ $t("song.song_title") }}</div>
          <div>{{ $t("song.album") }}</div>
          <div>{{ $t("song.date_added") }}</div>
          <div class="text-center">
            <UIcon name="i-lucide-clock" class="size-4" />
          </div>
          <div></div>
        </div>

        <!-- Track Rows -->
        <div class="mt-2">
          <div
            v-for="(song, index) in paginatedSongs"
            :key="getSongId(song) || index"
            class="group grid grid-cols-[28px_1fr_1fr_minmax(80px,100px)_60px_40px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors items-center"
            :class="{ 'bg-white/5': selectedSongs.includes(getSongId(song)) }"
          >
            <!-- # / Play / Checkbox / Equalizer -->
            <div class="flex items-center justify-center relative w-5 h-5">
              <!-- Checkbox (show on hover or when selected) -->
              <div
                :class="[
                  'absolute inset-0 flex items-center justify-center transition-opacity z-10',
                  selectedSongs.includes(getSongId(song)) ||
                  selectedSongs.length > 0
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100',
                ]"
              >
                <UCheckbox
                  :model-value="selectedSongs.includes(getSongId(song))"
                  @update:model-value="toggleSelectSong(getSongId(song))"
                  @click.stop
                  :ui="{ base: 'cursor-pointer' }"
                />
              </div>
            </div>

            <!-- Title + Artist -->
            <div class="flex items-center gap-3 min-w-0">
              <!-- Thumbnail -->
              <div class="relative w-10 h-10 rounded overflow-hidden shrink-0">
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
                <p
                  class="text-sm font-medium truncate"
                  :class="
                    isCurrentTrack(song) ? 'text-purple-400' : 'text-white'
                  "
                >
                  {{ song.Title }}
                </p>
                <div class="text-xs truncate">
                  <template v-if="getSongArtists(song).length > 0">
                    <template
                      v-for="(artist, artistIndex) in getSongArtists(song)"
                      :key="`${song.SongId || song.Id || index}-${artist.id || artist.name}-${artistIndex}`"
                    >
                      <NuxtLink
                        v-if="artist.id"
                        :to="`/artist/${artist.id}`"
                        class="text-neutral-400 hover:text-white hover:underline"
                        @click.stop
                      >
                        {{ artist.name }}
                      </NuxtLink>
                      <span v-else class="text-neutral-400">
                        {{ artist.name }}
                      </span>
                      <span
                        v-if="artistIndex < getSongArtists(song).length - 1"
                        class="text-neutral-500"
                      >
                        ,
                      </span>
                    </template>
                  </template>
                  <span v-else class="text-neutral-400">-</span>
                </div>
              </div>
            </div>

            <!-- Album -->
            <div
              class="text-neutral-400 text-sm truncate hover:text-white hover:underline cursor-pointer"
            >
              {{ song.AlbumTitle || "-" }}
            </div>

            <!-- Date Added -->
            <div class="text-neutral-400 text-sm">
              {{ formatRelativeDate(song.CreatedAt) }}
            </div>

            <!-- Duration -->
            <div class="text-neutral-400 text-sm text-center">
              {{ formatDuration(song.Duration) }}
            </div>

            <!-- More button with SongContextMenu -->
            <div class="flex items-center justify-center">
              <SongContextMenu
                :song="song"
                :is-owner="true"
                :show-go-to-album="!!song.AlbumId"
                @edit="openEditModal"
                @delete="openDeleteConfirm"
              />
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between mt-6 pt-4 border-t border-white/10"
        >
          <div class="text-sm text-neutral-400">
            {{ filteredSongs.length }} {{ $t("song.songs_count") }}
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-neutral-400">{{
                $t("song.per_page")
              }}</span>
              <select
                v-model="itemsPerPage"
                class="bg-transparent text-white text-sm px-2 py-1 rounded border border-white/20 focus:border-white/40 outline-none cursor-pointer"
              >
                <option :value="10" class="bg-[#282828]">10</option>
                <option :value="20" class="bg-[#282828]">20</option>
                <option :value="50" class="bg-[#282828]">50</option>
                <option :value="100" class="bg-[#282828]">100</option>
              </select>
            </div>
            <span class="text-sm text-neutral-400">
              {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
                Math.min(currentPage * itemsPerPage, filteredSongs.length)
              }}
              {{ $t("song.of") }} {{ filteredSongs.length }}
            </span>
            <div class="flex items-center gap-1">
              <button
                :disabled="currentPage === 1"
                class="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                @click="currentPage--"
              >
                <UIcon name="i-lucide-chevron-left" class="size-5" />
              </button>
              <button
                :disabled="currentPage === totalPages"
                class="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                @click="currentPage++"
              >
                <UIcon name="i-lucide-chevron-right" class="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <Transition name="fade">
    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click="closeEditModal"
    >
      <div
        class="bg-[#282828] rounded-lg p-6 max-w-lg w-full mx-4 border border-white/10 max-h-[85vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">{{ $t("song.edit_song") }}</h2>
          <button
            class="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            @click="closeEditModal"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </div>

        <div class="space-y-5">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              {{ $t("song.song_title") }}
            </label>
            <input
              v-model="editForm.title"
              type="text"
              :placeholder="$t('song.song_title_placeholder')"
              class="w-full bg-[#3E3E3E] text-white px-4 py-3 rounded-md border border-transparent focus:border-purple-500 outline-none placeholder:text-neutral-500 transition-colors"
            />
          </div>

          <!-- Cover Image -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              {{ $t("song.cover_image") }}
            </label>
            <div
              class="group relative w-32 h-32 rounded-md overflow-hidden bg-[#3E3E3E] cursor-pointer"
              @click="triggerEditImageInput"
            >
              <img
                v-if="editForm.coverPreview"
                :src="editForm.coverPreview"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-neutral-500"
              >
                <UIcon name="i-lucide-image" class="size-10" />
              </div>
              <div
                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <UIcon name="i-lucide-camera" class="size-6 text-white" />
              </div>
              <input
                ref="editImageInputRef"
                type="file"
                class="hidden"
                accept="image/*"
                @change="handleEditImageSelect"
              />
            </div>
          </div>

          <!-- Genre -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              {{ $t("song.primary_genre") }}
            </label>
            <USelectMenu
              v-model="editForm.genres"
              multiple
              :items="availableGenres"
              label-key="Name"
              value-key="Id"
              :placeholder="$t('song.genre_placeholder')"
              size="lg"
              :ui="{
                base: 'bg-[#3E3E3E] text-white rounded-md',
              }"
              :ui-menu="{
                background: 'bg-[#282828] border border-neutral-700',
                option: { active: 'bg-[#3E3E3E]' },
              }"
            >
              <template #item="{ item }">
                <span class="truncate">{{ item.Name || item.GenreName }}</span>
              </template>
            </USelectMenu>
          </div>

          <!-- Lyrics -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              {{ $t("song.lyrics") }}
            </label>
            <textarea
              v-model="editForm.lyrics"
              :placeholder="$t('song.lyrics_placeholder')"
              rows="4"
              class="w-full bg-[#3E3E3E] text-white px-4 py-3 rounded-md border border-transparent focus:border-purple-500 outline-none placeholder:text-neutral-500 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              class="px-6 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              @click="closeEditModal"
            >
              {{ $t("song.cancel") }}
            </button>
            <button
              :disabled="isSaving"
              class="px-6 py-2 text-sm font-bold bg-purple-500 hover:bg-purple-400 text-white rounded-full transition-colors cursor-pointer disabled:opacity-50"
              @click="handleEditSave"
            >
              <span v-if="isSaving">...</span>
              <span v-else>{{ $t("song.save_changes") }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Delete Confirmation Modal -->
  <Transition name="fade">
    <div
      v-if="isDeleteConfirmOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click="isDeleteConfirmOpen = false"
    >
      <div
        class="bg-[#282828] rounded-lg p-6 max-w-sm w-full mx-4 border border-white/10"
        @click.stop
      >
        <h3 class="text-lg font-bold mb-2">
          {{ $t("song.confirm_delete") }}
        </h3>
        <p class="text-sm text-neutral-400 mb-6">
          {{ $t("song.delete_song_confirmation") }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-sm text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            @click="isDeleteConfirmOpen = false"
          >
            {{ $t("song.cancel") }}
          </button>
          <button
            :disabled="isDeleting"
            class="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer disabled:opacity-50"
            @click="handleDeleteSong"
          >
            {{ $t("song.delete") }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Bulk Delete Confirmation Modal -->
  <Transition name="fade">
    <div
      v-if="isBulkDeleteConfirmOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click="isBulkDeleteConfirmOpen = false"
    >
      <div
        class="bg-[#282828] rounded-lg p-6 max-w-sm w-full mx-4 border border-white/10"
        @click.stop
      >
        <h3 class="text-lg font-bold mb-2">
          {{ $t("song.confirm_delete") }}
        </h3>
        <p class="text-sm text-neutral-400 mb-6">
          {{
            $t("song.bulk_delete_confirmation", {
              count: selectedSongs.length,
            })
          }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-sm text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            @click="isBulkDeleteConfirmOpen = false"
          >
            {{ $t("song.cancel") }}
          </button>
          <button
            :disabled="isDeleting"
            class="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer disabled:opacity-50"
            @click="handleBulkDelete"
          >
            {{ $t("song.delete") }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useDominantColor } from "~/composables/useDominantColor";
import musicApi from "~/api/musicApi";
import fileApi from "~/api/fileApi";
import userApi from "~/api/userApi";
import { usePlayerStore } from "~/stores/usePlayerStore";
import { formatNumber } from "~/utils/formatNumber";

const { t } = useI18n();
const toast = useToast();
const playerStore = usePlayerStore();
const { user } = useAuth();

const isArtistOrAdminRole = (role) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();
  if (!normalizedRole) return false;
  return normalizedRole.includes("artist") || normalizedRole === "admin";
};

// Guard: redirect regular users away
if (import.meta.client) {
  const jwtRole = user.value?.role;
  if (!isArtistOrAdminRole(jwtRole)) {
    try {
      const profile = await userApi.getUserInfo();
      const profileRole = profile?.Role;
      if (!isArtistOrAdminRole(profileRole)) {
        navigateTo("/");
      }
    } catch {
      if (jwtRole) {
        navigateTo("/");
      }
    }
  }
}

// State
const songs = ref([]);
const isLoading = ref(false);
const isEditModalOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const isBulkDeleteConfirmOpen = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const editImageInputRef = ref(null);
const availableGenres = ref([]);
const selectedSongs = ref([]);
const isSearchFocused = ref(false);
const userName = ref("You");

// Dominant color for gradient
const firstSongThumbnail = computed(() => songs.value[0]?.Thumbnail || null);
const { dominantColor } = useDominantColor(firstSongThumbnail);

// Search & Pagination
const searchInput = ref("");
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(20);
const scrollMainToTop = useMainScrollTop();

// Debounce search
let searchTimeout = null;
watch(searchInput, (newValue) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery.value = newValue;
    currentPage.value = 1;
    scrollMainToTop();
  }, 300);
});

// Filtered songs
const filteredSongs = computed(() => {
  if (!searchQuery.value.trim()) return songs.value;
  const query = searchQuery.value.toLowerCase().trim();
  return songs.value.filter((song) => {
    const title = (song.Title || "").toLowerCase();
    const artist = (song.ArtistNames || "").toLowerCase();
    const album = (song.AlbumTitle || "").toLowerCase();
    return (
      title.includes(query) || artist.includes(query) || album.includes(query)
    );
  });
});

// Total duration
const totalDuration = computed(() => {
  const total = songs.value.reduce((acc, s) => acc + (s.Duration || 0), 0);
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} min`;
});

// Pagination
const totalPages = computed(() =>
  Math.ceil(filteredSongs.value.length / itemsPerPage.value),
);

const paginatedSongs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredSongs.value.slice(start, start + itemsPerPage.value);
});

const getSongId = (song) => {
  return song?.SongId || song?.Id || song?.songId || null;
};

watch(itemsPerPage, () => {
  currentPage.value = 1;
  scrollMainToTop();
});

watch(currentPage, () => {
  scrollMainToTop();
});

// Selection
const isAllSelected = computed(() => {
  if (paginatedSongs.value.length === 0) return false;
  return paginatedSongs.value.every((s) =>
    selectedSongs.value.includes(getSongId(s)),
  );
});

const isIndeterminate = computed(() => {
  const pageIds = paginatedSongs.value.map((s) => getSongId(s)).filter(Boolean);
  const selected = pageIds.filter((id) => selectedSongs.value.includes(id));
  return selected.length > 0 && selected.length < pageIds.length;
});

const toggleSelectAll = (value) => {
  const pageIds = paginatedSongs.value.map((s) => getSongId(s)).filter(Boolean);
  if (value) {
    pageIds.forEach((id) => {
      if (!selectedSongs.value.includes(id)) selectedSongs.value.push(id);
    });
  } else {
    selectedSongs.value = selectedSongs.value.filter(
      (id) => !pageIds.includes(id),
    );
  }
};

const toggleSelectSong = (songId) => {
  if (!songId) return;
  const index = selectedSongs.value.indexOf(songId);
  if (index > -1) {
    selectedSongs.value.splice(index, 1);
  } else {
    selectedSongs.value.push(songId);
  }
};

// Edit form
const editForm = reactive({
  songId: null,
  title: "",
  genres: [],
  lyrics: "",
  coverFile: null,
  coverPreview: null,
});

const selectedSongToDelete = ref(null);

// Mount
onMounted(async () => {
  await fetchMySongs();
  await fetchGenres();
});

// API calls
const fetchMySongs = async () => {
  isLoading.value = true;
  try {
    const [res] = await Promise.all([
      musicApi.getMySongs(),
      new Promise((r) => setTimeout(r, 800)),
    ]);
    songs.value = res.Data || res.data || res || [];
  } catch (error) {
    console.error("Error fetching songs:", error);
    toast.add({
      title: t("song.error_title"),
      description: t("song.error_message"),
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const fetchGenres = async () => {
  try {
    const res = await musicApi.getGenres();
    availableGenres.value = res?.Data || res?.data || res || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
  }
};

// Formatters
const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatRelativeDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const normalizeArtistField = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  }

  if (value === null || value === undefined) {
    return [];
  }

  return String(value)
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const getSongArtists = (song) => {
  if (!song) return [];

  if (Array.isArray(song.Artists) && song.Artists.length > 0) {
    const mapped = song.Artists.map((artist) => ({
      id: artist?.UserId || artist?.Id || artist?.ArtistId || null,
      name: artist?.FullName || artist?.Name || artist?.ArtistName || "Artist",
    })).filter((artist) => artist.name && artist.name.trim().length > 0);

    if (mapped.length > 0) return mapped;
  }

  const names = normalizeArtistField(song.ArtistNames || song.ArtistName);
  const ids = normalizeArtistField(song.ArtistIds || song.ArtistId);

  if (ids.length === 0) {
    return names.map((name) => ({ id: null, name }));
  }

  const artists = ids.map((id, index) => ({
    id,
    name: names[index] || names[0] || "Artist",
  }));

  return artists.filter(
    (artist, index, list) =>
      list.findIndex(
        (item) => item.id === artist.id && item.name === artist.name,
      ) === index,
  );
};

// Check if currently playing a song from my music
const isPlayingMyMusic = computed(() => {
  if (!playerStore.currentTrack || !playerStore.isPlaying) return false;
  const currentId =
    playerStore.currentTrack.Id || playerStore.currentTrack.SongId;
  return filteredSongs.value.some(
    (s) => (s.SongId || s.Id || s.songId) === currentId,
  );
});

// Actions
const playAll = () => {
  if (filteredSongs.value.length === 0) return;
  const queue = filteredSongs.value.map((song) => ({
    Id: song.SongId || song.Id || song.songId,
    Title: song.Title,
    ArtistNames: song.ArtistNames || "Unknown Artist",
    ArtistName: song.ArtistName,
    ArtistId: song.ArtistId,
    ArtistIds: song.ArtistIds,
    Artists: song.Artists,
    Thumbnail: song.Thumbnail,
    FileUrl: song.FileUrl,
    Duration: song.Duration,
  }));
  playerStore.playTrack(queue[0], queue, 0);
};

const togglePlayAll = () => {
  if (isPlayingMyMusic.value) {
    playerStore.togglePlay();
  } else {
    playAll();
  }
};

const playSong = (song) => {
  const index = filteredSongs.value.findIndex(
    (s) =>
      (s.SongId || s.Id || s.songId) ===
      (song.SongId || song.Id || song.songId),
  );
  const queue = filteredSongs.value.map((s) => ({
    Id: s.SongId || s.Id || s.songId,
    Title: s.Title,
    ArtistNames: s.ArtistNames || "Unknown Artist",
    ArtistName: s.ArtistName,
    ArtistId: s.ArtistId,
    ArtistIds: s.ArtistIds,
    Artists: s.Artists,
    Thumbnail: s.Thumbnail,
    FileUrl: s.FileUrl,
    Duration: s.Duration,
  }));
  playerStore.playTrack(
    queue[index >= 0 ? index : 0],
    queue,
    index >= 0 ? index : 0,
  );
};

// Check if a specific song is the current track
const isCurrentTrack = (song) => {
  if (!playerStore.currentTrack) return false;
  const songId = song.SongId || song.Id || song.songId;
  return (
    playerStore.currentTrack.Id === songId ||
    playerStore.currentTrack.SongId === songId
  );
};

const togglePlaySong = (song) => {
  if (isCurrentTrack(song)) {
    playerStore.togglePlay();
  } else {
    playSong(song);
  }
};

const toggleLike = (song) => {
  song.isLiked = !song.isLiked;
};

const openSongMenu = (song) => {
  console.log("Open menu for:", song.Title);
};

// Edit Modal
const openEditModal = (song) => {
  editForm.songId = song.Id || song.SongId;
  editForm.title = song.Title;
  editForm.genres = song.GenreIds || [];
  editForm.lyrics = song.Lyrics || "";
  editForm.coverPreview = song.Thumbnail;
  editForm.coverFile = null;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  Object.assign(editForm, {
    songId: null,
    title: "",
    genres: [],
    lyrics: "",
    coverFile: null,
    coverPreview: null,
  });
};

const triggerEditImageInput = () => editImageInputRef.value?.click();

const handleEditImageSelect = (e) => {
  const file = e.target.files[0];
  if (file?.type.startsWith("image/")) {
    editForm.coverFile = file;
    editForm.coverPreview = URL.createObjectURL(file);
  }
};

const handleEditSave = async () => {
  if (!editForm.songId) return;

  isSaving.value = true;
  try {
    let thumbnailUrl = editForm.coverPreview;

    if (editForm.coverFile) {
      const uploadRes = await fileApi.uploadImage(editForm.coverFile);
      thumbnailUrl = uploadRes.Url || uploadRes.url;
    }

    await musicApi.updateSong(editForm.songId, {
      Title: editForm.title,
      Thumbnail: thumbnailUrl,
      Lyrics: editForm.lyrics,
      GenreIds: editForm.genres,
    });

    toast.add({
      title: t("song.success_title"),
      description: t("song.update_success"),
      color: "green",
    });
    closeEditModal();
    await fetchMySongs();
  } catch (error) {
    console.error("Error saving song:", error);
    toast.add({
      title: t("song.error_title"),
      description: t("song.update_error"),
      color: "red",
    });
  } finally {
    isSaving.value = false;
  }
};

// Delete
const openDeleteConfirm = (song) => {
  const songId = getSongId(song);
  if (!songId) {
    toast.add({
      title: t("song.error_title"),
      description: t("song.delete_error"),
      color: "red",
    });
    return;
  }

  selectedSongToDelete.value = { ...song, _resolvedSongId: songId };
  isDeleteConfirmOpen.value = true;
};

const handleDeleteSong = async () => {
  if (!selectedSongToDelete.value) return;

  const songId =
    selectedSongToDelete.value._resolvedSongId ||
    getSongId(selectedSongToDelete.value);
  if (!songId) {
    toast.add({
      title: t("song.error_title"),
      description: t("song.delete_error"),
      color: "red",
    });
    return;
  }

  isDeleting.value = true;
  try {
    await musicApi.deleteSong(songId);
    toast.add({
      title: t("song.success_title"),
      description: t("song.delete_success"),
      color: "green",
    });
    isDeleteConfirmOpen.value = false;
    selectedSongToDelete.value = null;
    selectedSongs.value = [];
    await fetchMySongs();
  } catch (error) {
    console.error("Error deleting song:", error);
    toast.add({
      title: t("song.error_title"),
      description: t("song.delete_error"),
      color: "red",
    });
  } finally {
    isDeleting.value = false;
  }
};

// Bulk Delete
const openBulkDeleteConfirm = () => {
  isBulkDeleteConfirmOpen.value = true;
};

const handleBulkDelete = async () => {
  if (selectedSongs.value.length === 0) return;

  isDeleting.value = true;
  try {
    await Promise.all(selectedSongs.value.map((id) => musicApi.deleteSong(id)));
    toast.add({
      title: t("song.success_title"),
      description: t("song.bulk_delete_success", {
        count: selectedSongs.value.length,
      }),
      color: "green",
    });
    isBulkDeleteConfirmOpen.value = false;
    selectedSongs.value = [];
    await fetchMySongs();
  } catch (error) {
    console.error("Error deleting songs:", error);
    toast.add({
      title: t("song.error_title"),
      description: t("song.delete_error"),
      color: "red",
    });
  } finally {
    isDeleting.value = false;
  }
};
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
