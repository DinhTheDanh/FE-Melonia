import axiosClient from "./axiosClient";

const musicApi = {
  // Lấy bài hát
  getSongs(data) {
    return axiosClient.get("/Music/songs", data);
  },

  // Lấy genres
  getGenres(data) {
    return axiosClient.get("/Music/genres", data);
  },

  // Lấy albums
  getAlbums(data) {
    return axiosClient.get("/Music/albums", data);
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
  getMySongs(data) {
    return axiosClient.get("/Music/my-songs", data);
  },

  // Lấy albums của user hiện tại
  getMyAlbums(data) {
    return axiosClient.get("/Music/my-albums", data);
  },

  // Lấy playlists của user hiện tại
  getMyPlaylists(data) {
    return axiosClient.get("/Music/my-playlists", data);
  },

  // Lấy danh sách playlists (public)
  getPlaylists(data) {
    return axiosClient.get("/Music/playlists", data);
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
};
export default musicApi;
