import axiosClient from "./axiosClient";

const artistApi = {
  // Lấy danh sách nghệ sĩ
  getArtists(params) {
    return axiosClient.get("/Artist", { params });
  },

  // Lấy bài hát của nghệ sĩ theo ID nghệ sĩ
  getSongsByArtistId(artistId, params) {
    return axiosClient.get(`/Artist/${artistId}/songs`, { params });
  },
};
export default artistApi;
