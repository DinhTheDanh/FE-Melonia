import { defineStore } from "pinia";
import interactionApi from "~/api/interactionApi";

export const useLikedSongsStore = defineStore("likedSongs", {
  state: () => ({
    likedSongIds: new Set(),
    likedSongs: [],
    totalCount: 0,
    isLoaded: false,
    isLoading: false,
  }),

  getters: {
    isLiked: (state) => {
      return (songId) => state.likedSongIds.has(songId);
    },
  },

  actions: {
    async fetchLikedSongs(params = { pageIndex: 1, pageSize: 50 }) {
      this.isLoading = true;
      try {
        const res = await interactionApi.getLikedSongs(params);
        const data = res.Data || res || [];
        this.likedSongs = data;
        this.totalCount = res.TotalRecords || res.Total || data.length;

        // Build the Set of liked IDs
        this.likedSongIds = new Set(
          data.map((s) => s.Id || s.SongId).filter(Boolean),
        );
        this.isLoaded = true;
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async toggleLike(songId) {
      try {
        await interactionApi.likeSong({ songId });

        if (this.likedSongIds.has(songId)) {
          // Unlike
          this.likedSongIds = new Set(
            [...this.likedSongIds].filter((id) => id !== songId),
          );
          this.likedSongs = this.likedSongs.filter(
            (s) => (s.Id || s.SongId) !== songId,
          );
          this.totalCount = Math.max(0, this.totalCount - 1);
        } else {
          // Like
          this.likedSongIds = new Set([...this.likedSongIds, songId]);
          this.totalCount++;
        }

        return true;
      } catch (error) {
        console.error("Error toggling like:", error);
        return false;
      }
    },
  },
});
