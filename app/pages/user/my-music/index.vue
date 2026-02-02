<template>
  <div class="min-h-screen bg-[#121212] text-white p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold tracking-tight">
          {{ $t("song.my_music") }}
        </h1>
        <NuxtLink to="/create/song">
          <UButton
            icon="i-lucide-plus"
            :label="$t('song.upload_now')"
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

      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="space-y-4">
        <!-- Skeleton Header Row -->
        <div
          class="bg-[#282828]/40 rounded-xl border border-white/10 overflow-hidden"
        >
          <!-- Skeleton Table Header -->
          <div class="bg-[#282828]/80 border-b border-white/10 px-6 py-4">
            <div class="flex items-center gap-6">
              <div class="w-8 h-4 bg-neutral-700 rounded animate-pulse"></div>
              <div class="w-32 h-4 bg-neutral-700 rounded animate-pulse"></div>
              <div class="w-24 h-4 bg-neutral-700 rounded animate-pulse"></div>
              <div class="w-20 h-4 bg-neutral-700 rounded animate-pulse"></div>
              <div class="w-16 h-4 bg-neutral-700 rounded animate-pulse"></div>
              <div class="w-24 h-4 bg-neutral-700 rounded animate-pulse"></div>
              <div class="w-20 h-4 bg-neutral-700 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Skeleton Rows -->
          <div class="divide-y divide-white/5">
            <div
              v-for="i in 8"
              :key="i"
              class="px-6 py-4 flex items-center gap-6"
            >
              <!-- Number -->
              <div
                class="w-8 h-4 bg-neutral-700/50 rounded animate-pulse"
              ></div>

              <!-- Song Info with Image -->
              <div class="flex items-center gap-3 flex-1">
                <div
                  class="w-10 h-10 bg-neutral-700 rounded animate-pulse shrink-0"
                ></div>
                <div class="space-y-2 flex-1">
                  <div
                    class="h-4 bg-neutral-700 rounded animate-pulse"
                    :style="{ width: `${Math.random() * 30 + 40}%` }"
                  ></div>
                  <div
                    class="w-20 h-3 bg-neutral-700/50 rounded animate-pulse"
                  ></div>
                </div>
              </div>

              <!-- Artist -->
              <div
                class="w-28 h-4 bg-neutral-700/50 rounded animate-pulse"
              ></div>

              <!-- Genre -->
              <div
                class="w-20 h-4 bg-neutral-700/50 rounded animate-pulse"
              ></div>

              <!-- Duration -->
              <div
                class="w-12 h-4 bg-neutral-700/50 rounded animate-pulse"
              ></div>

              <!-- Created Date -->
              <div
                class="w-24 h-4 bg-neutral-700/50 rounded animate-pulse"
              ></div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 bg-neutral-700/50 rounded-full animate-pulse"
                ></div>
                <div
                  class="w-8 h-8 bg-neutral-700/50 rounded-full animate-pulse"
                ></div>
              </div>
            </div>
          </div>
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
          <UButton
            icon="i-lucide-plus"
            :label="$t('song.upload_now')"
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

      <!-- Songs Table -->
      <div
        v-if="!isLoading && songs.length > 0"
        class="bg-[#282828]/40 rounded-xl border border-white/10 overflow-hidden"
      >
        <!-- Search Bar / Selection Header - attached to table -->
        <Transition name="fade" mode="out-in">
          <div
            v-if="selectedSongs.length > 0"
            key="selection"
            class="bg-[#282828]/80 border-b border-white/10 px-6 h-14 flex items-center gap-4"
          >
            <span class="text-sm text-white">
              {{ $t("song.selected_prefix") }} {{ selectedSongs.length }}
            </span>
            <button
              class="text-sm text-[#1DB954] hover:text-[#1ed760] cursor-pointer transition-colors"
              @click="selectedSongs = []"
            >
              {{ $t("song.deselect_all") }}
            </button>
            <UButton
              icon="i-lucide-trash-2"
              :label="$t('song.delete')"
              color="red"
              variant="outline"
              size="sm"
              class="cursor-pointer"
              @click="openBulkDeleteConfirm"
            />
          </div>
          <!-- Search Bar - shows when no items selected -->
          <div
            v-else
            key="search"
            class="bg-[#282828]/80 border-b border-white/10 px-6 h-14 flex items-center gap-4"
          >
            <div class="relative flex-1 max-w-md">
              <UIcon
                name="i-lucide-search"
                class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400"
              />
              <input
                v-model="searchInput"
                type="text"
                :placeholder="$t('song.search_placeholder')"
                class="w-full h-9 bg-[#3E3E3E] text-white text-sm pl-9 pr-4 rounded-md border border-transparent focus:border-[#1DB954] focus:outline-none placeholder:text-neutral-400 transition-colors"
              />
            </div>
          </div>
        </Transition>
        <div class="overflow-x-auto">
          <table class="w-full">
            <!-- Header -->
            <thead class="bg-[#282828]/80 border-b border-white/10">
              <tr
                class="text-left text-xs uppercase tracking-wider text-neutral-400"
              >
                <th class="px-4 py-4 w-12">
                  <UCheckbox
                    :model-value="isAllSelected"
                    :indeterminate="isIndeterminate"
                    @update:model-value="toggleSelectAll"
                    :ui="{
                      base: 'cursor-pointer',
                      color: 'text-[#1DB954]',
                    }"
                  />
                </th>
                <th class="px-4 py-4 font-bold w-12">#</th>
                <th class="px-6 py-4 font-bold">{{ $t("song.song_title") }}</th>
                <th class="px-6 py-4 font-bold">{{ $t("song.album") }}</th>
                <th class="px-6 py-4 font-bold">{{ $t("song.artist") }}</th>
                <th class="px-6 py-4 font-bold">
                  {{ $t("song.primary_genre") }}
                </th>
                <th class="px-6 py-4 font-bold">{{ $t("song.duration") }}</th>
                <th class="px-6 py-4 font-bold">{{ $t("song.status") }}</th>
                <th class="px-6 py-4 font-bold">
                  {{ $t("song.created_date") }}
                </th>
              </tr>
            </thead>

            <!-- Body -->
            <tbody>
              <tr
                v-for="(song, index) in paginatedSongs"
                :key="song.SongId"
                class="group relative border-b border-white/5 hover:bg-[#3E3E3E]/30 transition-colors"
              >
                <!-- Checkbox -->
                <td class="px-4 py-4 w-12">
                  <UCheckbox
                    :model-value="selectedSongs.includes(song.SongId)"
                    @update:model-value="toggleSelectSong(song.SongId)"
                    :ui="{
                      base: 'cursor-pointer',
                      color: 'text-[#1DB954]',
                    }"
                  />
                </td>

                <!-- Number -->
                <td class="px-4 py-4 text-neutral-400 w-12">
                  {{ (currentPage - 1) * itemsPerPage.valueOf() + index + 1 }}
                </td>

                <!-- Song Info -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="song.Thumbnail"
                      :src="song.Thumbnail"
                      :alt="song.Title"
                      class="w-10 h-10 rounded object-cover"
                    />
                    <div
                      v-else
                      class="w-10 h-10 bg-[#3E3E3E] rounded flex items-center justify-center"
                    >
                      <UIcon
                        name="i-lucide-music"
                        class="size-5 text-neutral-500"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="font-medium truncate text-white">
                        {{ song.Title }}
                      </p>
                      <p class="text-xs text-neutral-500">
                        {{ formatDate(song.CreatedAt) }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Album -->
                <td class="px-6 py-4 text-sm text-neutral-300 truncate">
                  {{ song.AlbumTitle || "-" }}
                </td>

                <!-- Artist -->
                <td class="px-6 py-4 text-sm text-neutral-300 truncate">
                  {{ song.ArtistNames || "-" }}
                </td>

                <!-- Genre -->
                <td class="px-6 py-4 text-sm text-neutral-300 truncate">
                  {{
                    song.Genres?.map((g) => g.Name || g.GenreName).join(", ") ||
                    "-"
                  }}
                </td>

                <!-- Duration -->
                <td class="px-6 py-4 text-sm text-neutral-400">
                  {{ formatDuration(song.Duration) }}
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <select
                    :value="song.Status || 'active'"
                    @change="handleStatusChange(song, $event.target.value)"
                    :class="[
                      'text-xs font-medium px-2 py-1 rounded-md border cursor-pointer transition-colors focus:outline-none',
                      getStatusClass(song.Status || 'active'),
                    ]"
                  >
                    <option value="active">
                      {{ $t("song.status_active") }}
                    </option>
                    <option value="inactive">
                      {{ $t("song.status_inactive") }}
                    </option>
                    <option value="pending">
                      {{ $t("song.status_pending") }}
                    </option>
                  </select>
                </td>

                <!-- Created Date -->
                <td class="px-6 py-4 text-sm text-neutral-400 relative">
                  <span class="group-hover:invisible">
                    {{ formatDate(song.CreatedAt) }}
                  </span>
                  <!-- Hover Actions Overlay -->
                  <div
                    class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      class="p-1.5 hover:scale-110 transition-transform cursor-pointer"
                      @click="openEditModal(song)"
                    >
                      <UIcon
                        name="i-lucide-pencil"
                        class="size-4 text-yellow-400 hover:text-yellow-300"
                      />
                    </button>
                    <button
                      class="p-1.5 hover:scale-110 transition-transform cursor-pointer"
                      @click="openDeleteConfirm(song)"
                    >
                      <UIcon
                        name="i-lucide-trash-2"
                        class="size-4 text-red-500 hover:text-red-400"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredSongs.length > 0"
          class="flex items-center justify-between px-6 py-3 border-t border-white/10"
        >
          <!-- Left: Total records -->
          <div class="text-sm text-neutral-400">
            {{ $t("song.total_records") }}: {{ filteredSongs.length }}
          </div>

          <!-- Right: Per page selector + range + navigation -->
          <div class="flex items-center gap-4">
            <!-- Items per page -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-neutral-400">{{
                $t("song.per_page")
              }}</span>
              <select
                v-model="itemsPerPage"
                class="bg-[#3E3E3E] text-white text-sm px-2 py-1 rounded-md border border-white/10 focus:border-[#1DB954] focus:outline-none cursor-pointer"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>

            <!-- Range display -->
            <span class="text-sm text-neutral-400">
              {{ (currentPage - 1) * itemsPerPage + 1 }} -
              {{ Math.min(currentPage * itemsPerPage, filteredSongs.length) }}
              {{ $t("song.of_records") }}
            </span>

            <!-- Navigation buttons -->
            <div class="flex items-center gap-1">
              <button
                :disabled="currentPage === 1"
                class="p-1.5 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                @click="currentPage--"
              >
                <UIcon name="i-lucide-chevron-left" class="size-4" />
              </button>
              <button
                :disabled="currentPage === totalPages || totalPages === 0"
                class="p-1.5 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                @click="currentPage++"
              >
                <UIcon name="i-lucide-chevron-right" class="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <Transition name="fade">
        <div
          v-if="isEditModalOpen"
          class="fixed top-0 left-0 right-0 bottom-0 z-[999] w-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click="closeEditModal"
        >
          <div
            class="bg-[#282828] rounded-xl p-8 max-w-2xl w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold">{{ $t("song.edit_song") }}</h2>
              <UButton
                icon="i-lucide-x"
                color="gray"
                variant="ghost"
                @click="closeEditModal"
              />
            </div>

            <div class="space-y-6">
              <!-- Title -->
              <div>
                <label class="block text-sm font-bold text-neutral-300 mb-2">
                  {{ $t("song.song_title") }}
                </label>
                <UInput
                  v-model="editForm.title"
                  :placeholder="$t('song.song_title_placeholder')"
                  size="lg"
                  class="w-full"
                  :ui="inputSpotifyStyle"
                />
              </div>

              <!-- Cover Image -->
              <div>
                <label class="block text-sm font-bold text-neutral-300 mb-2">
                  {{ $t("song.cover_image") }}
                </label>
                <div
                  class="group relative w-40 h-40 rounded-lg overflow-hidden bg-[#3E3E3E] cursor-pointer"
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
                    <UIcon name="i-lucide-image" class="size-12" />
                  </div>
                  <div
                    class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <UIcon name="i-lucide-camera" class="size-8 text-white" />
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
                <label class="block text-sm font-bold text-neutral-300 mb-2">
                  {{ $t("song.primary_genre") }}
                </label>
                <USelectMenu
                  v-model="editForm.genres"
                  multiple
                  :items="genreOptions"
                  :placeholder="$t('song.genre_placeholder')"
                  size="lg"
                  :ui="inputSpotifyStyle"
                />
              </div>

              <!-- Lyrics -->
              <div>
                <label class="block text-sm font-bold text-neutral-300 mb-2">
                  {{ $t("song.lyrics") }}
                </label>
                <UTextarea
                  v-model="editForm.lyrics"
                  :placeholder="$t('song.lyrics_placeholder')"
                  :rows="4"
                  class="w-full"
                  :ui="inputSpotifyStyle"
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end gap-4 pt-4 border-t border-white/10">
                <UButton
                  :label="$t('song.cancel')"
                  color="gray"
                  variant="ghost"
                  size="lg"
                  @click="closeEditModal"
                />
                <UButton
                  :label="$t('song.save_changes')"
                  color="primary"
                  size="lg"
                  :loading="isSaving"
                  class="rounded-full"
                  :ui="{
                    color: {
                      primary: {
                        solid: 'bg-[#1DB954] hover:bg-[#1ed760] text-black',
                      },
                    },
                  }"
                  @click="handleEditSave"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Delete Confirmation Dialog -->
      <Transition name="fade">
        <div
          v-if="isDeleteConfirmOpen"
          class="fixed top-0 left-0 right-0 bottom-0 z-[999] w-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click="isDeleteConfirmOpen = false"
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
                  {{ $t("song.delete_song_confirmation") }}
                </p>
              </div>
            </div>

            <div class="flex justify-end gap-4 pt-4 border-t border-white/10">
              <UButton
                :label="$t('song.cancel_delete')"
                color="gray"
                variant="ghost"
                size="lg"
                @click="isDeleteConfirmOpen = false"
              />
              <UButton
                :label="$t('song.confirm')"
                color="red"
                size="lg"
                :loading="isDeleting"
                class="rounded-full"
                @click="handleDeleteSong"
              />
            </div>
          </div>
        </div>
      </Transition>

      <!-- Bulk Delete Confirmation Dialog -->
      <Transition name="fade">
        <div
          v-if="isBulkDeleteConfirmOpen"
          class="fixed top-0 left-0 right-0 bottom-0 z-999 w-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click="isBulkDeleteConfirmOpen = false"
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
                  {{
                    $t("song.bulk_delete_confirmation", {
                      count: selectedSongs.length,
                    })
                  }}
                </p>
              </div>
            </div>

            <div class="flex justify-end gap-4 pt-4 border-t border-white/10">
              <UButton
                :label="$t('song.cancel_delete')"
                color="gray"
                variant="ghost"
                size="lg"
                @click="isBulkDeleteConfirmOpen = false"
              />
              <UButton
                :label="$t('song.confirm')"
                color="red"
                size="lg"
                :loading="isDeleting"
                class="rounded-full"
                @click="handleBulkDelete"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import musicApi from "~/api/musicApi";
import fileApi from "~/api/fileApi";

definePageMeta({ layout: "auth" });

const { t } = useI18n();
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

// Search & Pagination
const searchInput = ref("");
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Debounce search
let searchTimeout = null;
watch(searchInput, (newValue) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery.value = newValue;
    currentPage.value = 1;
  }, 300);
});

// Filtered songs based on search query
const filteredSongs = computed(() => {
  if (!searchQuery.value.trim()) {
    return songs.value;
  }
  const query = searchQuery.value.toLowerCase().trim();
  return songs.value.filter((song) => {
    const title = (song.Title || "").toLowerCase();
    const artist = (song.ArtistNames || "").toLowerCase();
    const album = (song.AlbumTitle || "").toLowerCase();
    const genres = (song.Genres || [])
      .map((g) => (g.Name || g.GenreName || "").toLowerCase())
      .join(" ");
    return (
      title.includes(query) ||
      artist.includes(query) ||
      album.includes(query) ||
      genres.includes(query)
    );
  });
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredSongs.value.length / itemsPerPage.value);
});

// Paginated songs for current page
const paginatedSongs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSongs.value.slice(start, end);
});

// Watch itemsPerPage to reset page
watch(itemsPerPage, () => {
  currentPage.value = 1;
});

// Visible page numbers
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (current >= total - 2) {
      pages.push(total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(current - 2, current - 1, current, current + 1, current + 2);
    }
  }
  return pages;
});

// Computed properties for checkbox selection (based on current page)
const isAllSelected = computed(() => {
  if (paginatedSongs.value.length === 0) return false;
  return paginatedSongs.value.every((s) =>
    selectedSongs.value.includes(s.SongId),
  );
});

const isIndeterminate = computed(() => {
  const pageIds = paginatedSongs.value.map((s) => s.SongId);
  const selectedOnPage = pageIds.filter((id) =>
    selectedSongs.value.includes(id),
  );
  return selectedOnPage.length > 0 && selectedOnPage.length < pageIds.length;
});

// Toggle select all songs on current page
const toggleSelectAll = (value) => {
  const pageIds = paginatedSongs.value.map((s) => s.SongId);
  if (value) {
    // Add all page items to selection
    pageIds.forEach((id) => {
      if (!selectedSongs.value.includes(id)) {
        selectedSongs.value.push(id);
      }
    });
  } else {
    // Remove all page items from selection
    selectedSongs.value = selectedSongs.value.filter(
      (id) => !pageIds.includes(id),
    );
  }
};

// Toggle select individual song
const toggleSelectSong = (songId) => {
  const index = selectedSongs.value.indexOf(songId);
  if (index > -1) {
    selectedSongs.value.splice(index, 1);
  } else {
    selectedSongs.value.push(songId);
  }
};
const selectedSongToDelete = ref(null);

// Computed property để format genres cho USelectMenu
const genreOptions = computed(() => {
  return availableGenres.value.map((g) => ({
    label: g.Name || g.GenreName,
    value: g.GenreId || g.Id,
  }));
});

const inputSpotifyStyle = {
  base: "bg-[#3E3E3E] text-white ring-0 focus:ring-2 focus:ring-[#1DB954] placeholder:text-neutral-400",
  rounded: "rounded-md",
  padding: { lg: "py-3 px-4" },
};

const editForm = reactive({
  songId: null,
  title: "",
  genres: [],
  lyrics: "",
  coverFile: null,
  coverPreview: null,
});

const toast = useToast();

onMounted(async () => {
  await fetchMySongs();
  await fetchGenres();
});

const fetchMySongs = async () => {
  isLoading.value = true;
  try {
    // Tạo hiệu ứng skeleton loading tối thiểu 1.5s
    const [res] = await Promise.all([
      musicApi.getMySongs(),
      new Promise((resolve) => setTimeout(resolve, 1500)),
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
    availableGenres.value = res.Data || res.data || res || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("vi-VN");
};

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Status helpers
const getStatusClass = (status) => {
  switch (status) {
    case "active":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "inactive":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
  }
};

const handleStatusChange = async (song, newStatus) => {
  try {
    await musicApi.updateSong(song.SongId, {
      ...song,
      Status: newStatus,
    });
    // Update local state
    const index = songs.value.findIndex((s) => s.SongId === song.SongId);
    if (index > -1) {
      songs.value[index].Status = newStatus;
    }
    toast.add({
      title: t("song.success_title"),
      description: t("song.status_updated"),
      color: "green",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    toast.add({
      title: t("song.error_title"),
      description: t("song.status_update_error"),
      color: "red",
    });
  }
};

const openEditModal = (song) => {
  editForm.songId = song.SongId;
  editForm.title = song.Title;
  editForm.genres = song.Genres?.map((g) => g.GenreId || g.Id) || [];
  editForm.lyrics = song.Lyrics || "";
  editForm.coverPreview = song.Thumbnail;
  editForm.coverFile = null;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editForm.songId = null;
  editForm.title = "";
  editForm.genres = [];
  editForm.lyrics = "";
  editForm.coverFile = null;
  editForm.coverPreview = null;
};

const triggerEditImageInput = () => {
  editImageInputRef.value?.click();
};

const handleEditImageSelect = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
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
      const uploadRes = await fileApi.uploadDirect(editForm.coverFile, "image");
      thumbnailUrl = uploadRes.secure_url;
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

const openDeleteConfirm = (song) => {
  selectedSongToDelete.value = song;
  isDeleteConfirmOpen.value = true;
};

const handleDeleteSong = async () => {
  if (!selectedSongToDelete.value) return;

  isDeleting.value = true;
  try {
    await musicApi.deleteSong(selectedSongToDelete.value.SongId);
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

// Bulk Delete Functions
const openBulkDeleteConfirm = () => {
  isBulkDeleteConfirmOpen.value = true;
};

const handleBulkDelete = async () => {
  if (selectedSongs.value.length === 0) return;

  isDeleting.value = true;
  try {
    // Xóa từng bài hát đã chọn
    await Promise.all(
      selectedSongs.value.map((songId) => musicApi.deleteSong(songId)),
    );
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
/* Shimmer effect cho skeleton */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
</style>
