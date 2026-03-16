import axiosClient from "./axiosClient";

const analyticsApi = {
  getAdvancedDashboard(params) {
    return axiosClient.get("/Artist/analytics/dashboard", { params });
  },

  getTopSongs(params) {
    return axiosClient.get("/Artist/analytics/top-songs", { params });
  },
};

export default analyticsApi;
