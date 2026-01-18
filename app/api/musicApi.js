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
};
export default musicApi;
