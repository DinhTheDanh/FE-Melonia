import axiosClient from "./axiosClient";

const artistApi = {
  // Lấy danh sách nghệ sĩ
  getArtists() {
    return axiosClient.get("/Artist");
  },

  // Lấy bài hát của nghệ sĩ theo ID nghệ sĩ
  getSongsByArtistId(artistId) {
    return axiosClient.get(`/Artist/${artistId}/songs`);
  },
};
export default artistApi;
