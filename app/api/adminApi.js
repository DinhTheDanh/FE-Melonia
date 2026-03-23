import axiosClient from "./axiosClient";

const adminApi = {
  getDashboardStats() {
    return axiosClient.get("/Admin/dashboard");
  },

  getUsers(params) {
    return axiosClient.get("/Admin/users", { params });
  },

  getArtists(params) {
    return axiosClient.get("/Admin/artists", { params });
  },

  getSongs(params) {
    return axiosClient.get("/Admin/songs", { params });
  },

  getSubscriptions(params) {
    return axiosClient.get("/Admin/subscriptions", { params });
  },

  getPendingPayments(params) {
    return axiosClient.get("/Admin/payments/pending", { params });
  },

  getPayments(params) {
    return axiosClient.get("/Admin/payments", { params });
  },

  approvePayment(paymentId) {
    return axiosClient.post(`/Admin/payments/${paymentId}/approve`);
  },

  rejectPayment(paymentId) {
    return axiosClient.post(`/Admin/payments/${paymentId}/reject`);
  },

  toggleUserBan(userId) {
    return axiosClient.post(`/Admin/users/${userId}/toggle-ban`);
  },

  setUserRole(userId, role) {
    return axiosClient.post(`/Admin/users/${userId}/set-role`, { Role: role });
  },

  updatePaymentStatus(paymentId, status) {
    return axiosClient.put(`/Admin/payments/${paymentId}/status`, {
      Status: status,
    });
  },

  deleteSong(songId) {
    const normalizedSongId = String(songId || "").trim();
    if (!normalizedSongId) {
      throw new Error("Invalid songId");
    }
    return axiosClient.delete(
      `/Admin/songs/${encodeURIComponent(normalizedSongId)}`,
    );
  },

  getGenres() {
    return axiosClient.get("/Music/genres");
  },

  createGenre(data) {
    return axiosClient.post("/Music/genre", data);
  },

  updateGenre(genreId, data) {
    return axiosClient.put(`/Music/genre/${genreId}`, data);
  },

  deleteGenre(genreId) {
    return axiosClient.delete(`/Music/genre/${genreId}`);
  },

  cancelExpiredPayments(daysThreshold = 15) {
    return axiosClient.post("/Admin/payments/cancel-expired", null, {
      params: { daysThreshold },
    });
  },

  sendNotification(userId, data) {
    return axiosClient.post(`/Admin/notifications/send`, {
      UserId: userId,
      ...data,
    });
  },
};

export default adminApi;
