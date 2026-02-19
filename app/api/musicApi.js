import axiosClient from "./axiosClient";

const musicApi = {
  // Lấy bài hát
  getSongs(params) {
    return axiosClient.get("/Music/songs", { params });
  },

  // Lấy genres
  getGenres() {
    return axiosClient.get("/Music/genres");
  },

  // Lấy albums
  getAlbums(params) {
    return axiosClient.get("/Music/albums", { params });
  },

  // Tạo bài hát
  createSong(data) {
    return axiosClient.post("/Music/song", data);
  },

  // Tạo album
  createAlbum(data) {
    return axiosClient.post("/Music/album", data);
  },

  // check song
  checkHash(hash) {
    return axiosClient.get(`/Music/check-hash/${hash}`);
  },

  // Lấy bài hát của user hiện tại
  getMySongs(params) {
    return axiosClient.get("/Music/my-songs", { params });
  },

  // Lấy albums của user hiện tại
  getMyAlbums(params) {
    return axiosClient.get("/Music/my-albums", { params });
  },

  // Lấy playlists của user hiện tại
  getMyPlaylists(params) {
    return axiosClient.get("/Music/my-playlists", { params });
  },

  // Lấy danh sách playlists (public)
  getPlaylists(params) {
    return axiosClient.get("/Music/playlists", { params });
  },

  // Tạo genre
  createGenre(data) {
    return axiosClient.post("/Music/genre", data);
  },

  // Xóa bài hát
  deleteSong(songId) {
    return axiosClient.delete(`/Music/song/${songId}`);
  },

  // Xóa album
  deleteAlbum(albumId) {
    return axiosClient.delete(`/Music/album/${albumId}`);
  },

  // Cập nhật bài hát
  updateSong(songId, data) {
    return axiosClient.put(`/Music/song/${songId}`, data);
  },

  // Cập nhật album
  updateAlbum(albumId, data) {
    return axiosClient.put(`/Music/album/${albumId}`, data);
  },

  // Lấy chi tiết album (bao gồm các bài hát)
  getAlbumDetail(albumId, params) {
    return axiosClient.get(`/Music/album/${albumId}`, { params });
  },

  // Thêm bài hát vào album
  addSongToAlbum(albumId, songId) {
    return axiosClient.post(`/Music/album/${albumId}/add-song/${songId}`);
  },

  // Xóa bài hát khỏi album (qua Interaction API)
  removeSongFromAlbum(albumId, songId) {
    return axiosClient.delete(
      `/Interaction/album/${albumId}/remove-song/${songId}`,
    );
  },
};
export default musicApi;
