<template>
  <div class="min-h-screen pb-8 px-4">
    <!-- No query: show genre categories -->
    <div v-if="!query">
      <h2 class="text-2xl font-bold text-white mt-6 mb-6">
        {{ t("search.browse_all") }}
      </h2>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <NuxtLink
          v-for="(genre, index) in genres"
          :key="genre.GenreId || genre.Id"
          :to="`/browse/songs?type=genre&genreId=${genre.GenreId || genre.Id}&genreName=${encodeURIComponent(genre.Name)}`"
          class="relative overflow-hidden rounded-lg h-44 p-4 cursor-pointer group transition-transform hover:scale-[1.02]"
          :style="{
            backgroundColor: getGenreColor(genre.GenreId || genre.Id, index),
          }"
        >
          <span
            class="text-xl font-bold text-white relative z-10 drop-shadow-lg"
          >
            {{ genre.Name }}
          </span>
          <img
            v-if="genre.ImageUrl"
            :src="genre.ImageUrl"
            :alt="genre.Name"
            class="absolute bottom-2 right-2 w-24 h-24 object-cover rounded-md rotate-[25deg] translate-x-2 translate-y-2 shadow-lg opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </NuxtLink>
      </div>

      <!-- Empty genres -->
      <div
        v-if="genres.length === 0 && !isLoadingGenres"
        class="text-center py-20"
      >
        <UIcon name="i-lucide-compass" class="size-16 text-neutral-600 mb-4" />
        <p class="text-neutral-400">{{ t("search.no_categories") }}</p>
      </div>
    </div>

    <!-- Has query: show search results -->
    <div v-else>
      <!-- Loading -->
      <div v-if="isSearching" class="flex justify-center py-20">
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 text-neutral-400 animate-spin"
        />
      </div>

      <!-- Results -->
      <div v-else-if="hasResults">
        <!-- Top result + Songs row -->
        <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 mt-6">
          <!-- Top Result -->
          <div v-if="topResult">
            <h2 class="text-2xl font-bold text-white mb-4">
              {{ t("search.top_result") }}
            </h2>
            <div
              class="bg-[#181818] hover:bg-[#282828] rounded-lg p-5 cursor-pointer transition-colors group relative"
              @click="handleTopResultClick"
            >
              <img
                v-if="topResult.image"
                :src="topResult.image"
                :alt="topResult.name"
                class="w-24 h-24 object-cover shadow-lg shadow-black/50 mb-4"
                :class="
                  topResult.type === 'artist' ? 'rounded-full' : 'rounded-md'
                "
              />
              <div
                v-else
                class="w-24 h-24 bg-[#282828] flex items-center justify-center mb-4"
                :class="
                  topResult.type === 'artist' ? 'rounded-full' : 'rounded-md'
                "
              >
                <UIcon
                  :name="topResult.icon"
                  class="size-10 text-neutral-500"
                />
              </div>
              <h3 class="text-3xl font-bold text-white mb-1 truncate">
                {{ topResult.name }}
              </h3>
              <p class="text-sm text-neutral-400">
                <span v-if="topResult.subtitle" class="mr-2">{{
                  topResult.subtitle
                }}</span>
                <span
                  class="bg-black/40 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase"
                  >{{ topResult.typeLabel }}</span
                >
              </p>
              <button
                class="absolute bottom-5 right-5 w-12 h-12 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg shadow-black/60 cursor-pointer"
                @click.stop="handleTopResultPlay"
              >
                <UIcon
                  name="i-fa6-solid-play"
                  class="size-4 text-white ml-0.5"
                />
              </button>
            </div>
          </div>

          <!-- Songs list -->
          <div v-if="songs.length > 0">
            <h2 class="text-2xl font-bold text-white mb-4">
              {{ t("search.songs") }}
            </h2>
            <div class="space-y-1">
              <div
                v-for="song in songs.slice(0, 4)"
                :key="song.Id"
                class="grid grid-cols-[40px_1fr_60px] items-center gap-4 px-3 py-2 rounded-md hover:bg-white/10 group cursor-pointer"
                @click="playSong(song)"
              >
                <div class="relative flex items-center justify-center">
                  <img
                    v-if="song.Thumbnail"
                    :src="song.Thumbnail"
                    :alt="song.Title"
                    class="w-10 h-10 rounded object-cover"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded bg-[#282828] flex items-center justify-center"
                  >
                    <UIcon
                      name="i-lucide-music"
                      class="size-4 text-neutral-500"
                    />
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="text-white text-sm font-medium truncate">
                    {{ song.Title }}
                  </p>
                  <p class="text-neutral-400 text-xs truncate">
                    {{ song.ArtistNames || t("home.unknown_artist") }}
                  </p>
                </div>
                <span class="text-neutral-400 text-sm text-right">
                  {{ formatDuration(song.Duration) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Artists section -->
        <section v-if="artists.length > 0" class="mt-10">
          <h2 class="text-2xl font-bold text-white mb-4">
            {{ t("search.artists") }}
          </h2>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            <NuxtLink
              v-for="artist in artists.slice(0, 6)"
              :key="artist.UserId || artist.Id || artist.ArtistId"
              :to="`/artist/${artist.UserId || artist.Id || artist.ArtistId}`"
              class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
            >
              <div class="relative mb-4">
                <img
                  v-if="artist.Avatar || artist.AvatarUrl || artist.Thumbnail"
                  :src="artist.Avatar || artist.AvatarUrl || artist.Thumbnail"
                  :alt="artist.FullName || artist.ArtistName"
                  class="w-full aspect-square object-cover rounded-full shadow-lg shadow-black/50"
                />
                <div
                  v-else
                  class="w-full aspect-square bg-[#282828] rounded-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-user"
                    class="size-12 text-neutral-500"
                  />
                </div>
                <button
                  class="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg shadow-black/60 cursor-pointer"
                  @click.stop
                >
                  <UIcon
                    name="i-fa6-solid-play"
                    class="size-4 text-white ml-0.5"
                  />
                </button>
              </div>
              <p class="text-white font-semibold text-sm truncate text-center">
                {{ artist.FullName || artist.ArtistName }}
              </p>
              <p class="text-neutral-400 text-xs mt-1 text-center">
                {{ t("search.artist_label") }}
              </p>
            </NuxtLink>
          </div>
        </section>

        <!-- Albums section -->
        <section v-if="albums.length > 0" class="mt-10">
          <h2 class="text-2xl font-bold text-white mb-4">
            {{ t("search.albums") }}
          </h2>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            <NuxtLink
              v-for="album in albums.slice(0, 6)"
              :key="album.AlbumId"
              :to="`/user/my-albums/${album.AlbumId}`"
              class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
            >
              <div class="relative mb-4">
                <img
                  v-if="album.Thumbnail"
                  :src="album.Thumbnail"
                  :alt="album.Title"
                  class="w-full aspect-square object-cover rounded-md shadow-lg shadow-black/50"
                />
                <div
                  v-else
                  class="w-full aspect-square bg-[#282828] rounded-md flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-disc"
                    class="size-12 text-neutral-500"
                  />
                </div>
                <button
                  class="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg shadow-black/60 cursor-pointer"
                  @click.stop
                >
                  <UIcon
                    name="i-fa6-solid-play"
                    class="size-4 text-white ml-0.5"
                  />
                </button>
              </div>
              <p class="text-white font-semibold text-sm truncate">
                {{ album.Title }}
              </p>
              <p class="text-neutral-400 text-xs mt-1 truncate">
                {{ album.ArtistName || t("home.unknown_artist") }}
              </p>
            </NuxtLink>
          </div>
        </section>

        <!-- Playlists section -->
        <section v-if="playlists.length > 0" class="mt-10">
          <h2 class="text-2xl font-bold text-white mb-4">
            {{ t("search.playlists") }}
          </h2>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            <NuxtLink
              v-for="playlist in playlists.slice(0, 6)"
              :key="playlist.PlaylistId || playlist.Id"
              :to="`/playlist/${playlist.PlaylistId || playlist.Id}`"
              class="group hover:bg-[#282828] rounded-lg p-3 transition-all duration-300 cursor-pointer"
            >
              <div class="relative mb-4">
                <img
                  v-if="getPlaylistThumb(playlist)"
                  :src="getPlaylistThumb(playlist)"
                  :alt="playlist.Title"
                  class="w-full aspect-square object-cover rounded-md shadow-lg shadow-black/50"
                />
                <div
                  v-else
                  class="w-full aspect-square bg-[#282828] rounded-md flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-list-music"
                    class="size-12 text-neutral-500"
                  />
                </div>
              </div>
              <p class="text-white font-semibold text-sm truncate">
                {{ playlist.Title }}
              </p>
              <p class="text-neutral-400 text-xs mt-1 truncate">
                {{ playlist.OwnerName || t("search.playlist_label") }}
              </p>
            </NuxtLink>
          </div>
        </section>
      </div>

      <!-- No results -->
      <div v-else class="text-center py-20">
        <UIcon
          name="i-lucide-search-x"
          class="size-16 text-neutral-600 mb-4 mx-auto block"
        />
        <h3 class="text-xl font-bold text-white mb-2">
          {{ t("search.no_results_title") }}
        </h3>
        <p class="text-neutral-400">
          {{ t("search.no_results_desc", { query: query }) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import musicApi from "~/api/musicApi";
import artistApi from "~/api/artistApi";
import { usePlayerStore } from "~/stores/usePlayerStore";

const { t } = useI18n();
const route = useRoute();
const playerStore = usePlayerStore();

// Reactive query from route
const query = computed(() => route.query.q || "");

// State
const isSearching = ref(false);
const isLoadingGenres = ref(true);
const genres = ref([]);
const songs = ref([]);
const artists = ref([]);
const albums = ref([]);
const playlists = ref([]);

// Top result logic
const topResult = computed(() => {
  // Priority: artist > album > song > playlist
  if (artists.value.length > 0) {
    const a = artists.value[0];
    return {
      type: "artist",
      name: a.FullName || a.ArtistName,
      subtitle: "",
      image: a.Avatar || a.AvatarUrl || a.Thumbnail,
      icon: "i-lucide-user",
      typeLabel: t("search.artist_label"),
      data: a,
    };
  }
  if (songs.value.length > 0) {
    const s = songs.value[0];
    return {
      type: "song",
      name: s.Title,
      subtitle: s.ArtistNames || "",
      image: s.Thumbnail,
      icon: "i-lucide-music",
      typeLabel: t("search.song_label"),
      data: s,
    };
  }
  if (albums.value.length > 0) {
    const a = albums.value[0];
    return {
      type: "album",
      name: a.Title,
      subtitle: a.ArtistName || "",
      image: a.Thumbnail,
      icon: "i-lucide-disc",
      typeLabel: t("search.album_label"),
      data: a,
    };
  }
  if (playlists.value.length > 0) {
    const p = playlists.value[0];
    return {
      type: "playlist",
      name: p.Title,
      subtitle: p.OwnerName || "",
      image: getPlaylistThumb(p),
      icon: "i-lucide-list-music",
      typeLabel: t("search.playlist_label"),
      data: p,
    };
  }
  return null;
});

const hasResults = computed(
  () =>
    songs.value.length > 0 ||
    artists.value.length > 0 ||
    albums.value.length > 0 ||
    playlists.value.length > 0,
);

// Genre colors
const genreColors = [
  "#E13300",
  "#1DB954",
  "#8400E7",
  "#E8115B",
  "#158A08",
  "#509BF5",
  "#E91429",
  "#148A08",
  "#DC148C",
  "#B49BC8",
  "#477D95",
  "#F59B23",
  "#A56752",
  "#0D73EC",
  "#608108",
  "#8C1932",
  "#E61E32",
  "#1E3264",
  "#BA5D07",
  "#27856A",
];

const getGenreColor = (id, index) => {
  // Use index-based shuffled assignment for visual variety
  const shuffled = [
    12, 1, 8, 17, 4, 11, 19, 6, 14, 0, 9, 3, 16, 7, 13, 2, 18, 5, 15, 10,
  ];
  const idx =
    index !== undefined
      ? index
      : typeof id === "string"
        ? parseInt(id, 10) || 0
        : id || 0;
  return genreColors[shuffled[idx % shuffled.length]];
};

// Helpers
const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getPlaylistThumb = (playlist) => {
  const thumb = playlist?.Thumbnail;
  if (!thumb) return null;
  if (thumb.includes("dicebear")) return null;
  return thumb;
};

// Actions
const playSong = (song) => {
  playerStore.playTrack(song, songs.value, songs.value.indexOf(song));
};

const handleTopResultClick = () => {
  if (!topResult.value) return;
  const { type, data } = topResult.value;
  if (type === "artist") {
    navigateTo(`/artist/${data.UserId || data.Id || data.ArtistId}`);
  } else if (type === "album") {
    navigateTo(`/user/my-albums/${data.AlbumId}`);
  } else if (type === "playlist") {
    navigateTo(`/playlist/${data.PlaylistId || data.Id}`);
  } else if (type === "song") {
    playSong(data);
  }
};

const handleTopResultPlay = () => {
  if (!topResult.value) return;
  if (topResult.value.type === "song") {
    playSong(topResult.value.data);
  }
};

// Search
const performSearch = async (keyword) => {
  if (!keyword) {
    songs.value = [];
    artists.value = [];
    albums.value = [];
    playlists.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const params = { keyword, pageIndex: 1, pageSize: 20 };
    const [songsRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
      musicApi.getSongs(params).catch(() => null),
      artistApi.getArtists(params).catch(() => null),
      musicApi.getAlbums(params).catch(() => null),
      musicApi.getPlaylists(params).catch(() => null),
    ]);

    songs.value = songsRes?.Data || songsRes || [];
    artists.value = artistsRes?.Data || artistsRes || [];
    albums.value = albumsRes?.Data || albumsRes || [];
    playlists.value = playlistsRes?.Data || playlistsRes || [];
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    isSearching.value = false;
  }
};

// Fetch genres on mount
const fetchGenres = async () => {
  isLoadingGenres.value = true;
  try {
    const res = await musicApi.getGenres();
    genres.value = res?.Data || res || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
  } finally {
    isLoadingGenres.value = false;
  }
};

// Watch for query changes
watch(
  query,
  (newQuery) => {
    performSearch(newQuery);
  },
  { immediate: true },
);

onMounted(() => {
  fetchGenres();
  // Sync header search query
  const headerSearchQuery = useState("headerSearchQuery");
  if (query.value && headerSearchQuery.value !== query.value) {
    headerSearchQuery.value = query.value;
  }
});
</script>
