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

  // Xóa bài hát khỏi playlist
  removeSongFromPlaylist(playlistId, songId) {
    return axiosClient.delete(
      `/Interaction/playlist/${playlistId}/remove-song/${songId}`,
    );
  },

  // Cập nhật playlist
  updatePlaylist(playlistId, data) {
    return axiosClient.put(`/Interaction/playlist/${playlistId}`, data);
  },

  // Xóa playlist
  deletePlaylist(playlistId) {
    return axiosClient.delete(`/Interaction/playlist/${playlistId}`);
  },

  // Lấy chi tiết playlist
  getPlaylistDetails(playlistId) {
    return axiosClient.get(`/Interaction/playlist/${playlistId}`);
  },

  // Lấy danh sách playlists
  getPlaylists(data) {
    return axiosClient.get(`/Interaction/playlists`, data);
  },

  // Theo dõi nghệ sĩ
  followArtist(targetUserId) {
    return axiosClient.post(`/Interaction/follow/${targetUserId}`);
  },

  // Lấy danh sách nghệ sĩ đã theo dõi
  getFollowedArtists() {
    return axiosClient.get(`/Interaction/followings`);
  },

  // Xóa bài hát khỏi album
  removeAlbumSong(albumId, songId) {
    return axiosClient.delete(`/Interaction/album/${albumId}/remove-song/${songId}`);
  },
};
export default interactionApi;
