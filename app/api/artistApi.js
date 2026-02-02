import axiosClient from "./axiosClient";

const artistApi = {
  // Lấy danh sách nghệ sĩ
  getArtists(data) {
    return axiosClient.get("/Artist", data);
  },

  // Lấy bài hát của nghệ sĩ theo ID nghệ sĩ
  getSongsByArtistId(artistId, data) {
    return axiosClient.get(`/Artist/${artistId}/songs`, data);
  },
};
export default artistApi;
