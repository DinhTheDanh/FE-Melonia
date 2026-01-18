import axiosClient from "./axiosClient";

const interactionApi = {
  // Thích bài hát
  likeSong(data) {
    return axiosClient.post(`/Interaction/like/${data.songId}`);
  },
  // Lấy danh sách bài hát đã thích của người dùng
  getLikedSongs(data) {
    return axiosClient.get(`/Interaction/liked-songs`, data);
  },

  // Tạo playlist mới
  createPlaylist(data) {
    return axiosClient.post(`/Interaction/playlist`, data);
  },

  // Thêm bài hát vào playlist
  addSongToPlaylist(data) {
    return axiosClient.post(
      `/Interaction/playlist/${data.playlistId}/add-song/${data.songId}`,
    );
  },
  // Theo dõi nghệ sĩ
  followArtist(targetUserId) {
    return axiosClient.post(`/Interaction/follow-artist/${targetUserId}`);
  },

  // Lấy danh sách nghệ sĩ đã theo dõi
  getFollowedArtists() {
    return axiosClient.get(`/Interaction/followings`);
  },
};
export default interactionApi;
