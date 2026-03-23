import axiosClient from "./axiosClient";

const recommendationApi = {
  // Lấy danh sách bài hát đề xuất cho user
  getRecommendedSongs(userId, topN = 20) {
    return axiosClient.get(`/Recommendation/songs/${userId}`, {
      params: { topN },
    });
  },

  // Lấy danh sách bài hát liên quan theo bài hát hiện tại
  getRelatedSongs(songId, params = {}) {
    return axiosClient.get(`/Recommendation/related-songs/${songId}`, {
      params,
    });
  },

  // Lấy danh sách album đề xuất cho user
  getRecommendedAlbums(userId, topN = 10) {
    return axiosClient.get(`/Recommendation/albums/${userId}`, {
      params: { topN },
    });
  },
};

export default recommendationApi;
