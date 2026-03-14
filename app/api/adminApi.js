import axiosClient from "./axiosClient";

const adminApi = {
  // Dashboard stats overview
  getDashboardStats() {
    return axiosClient.get("/Admin/dashboard");
  },

  // Users management
  getUsers(params) {
    return axiosClient.get("/Admin/users", { params });
  },

  // Artists management
  getArtists(params) {
    return axiosClient.get("/Admin/artists", { params });
  },

  // Songs management
  getSongs(params) {
    return axiosClient.get("/Admin/songs", { params });
  },

  // Subscriptions management
  getSubscriptions(params) {
    return axiosClient.get("/Admin/subscriptions", { params });
  },

  // Pending payments
  getPendingPayments(params) {
    return axiosClient.get("/Admin/payments/pending", { params });
  },

  // All payments
  getPayments(params) {
    return axiosClient.get("/Admin/payments", { params });
  },

  // Approve payment
  approvePayment(paymentId) {
    return axiosClient.post(`/Admin/payments/${paymentId}/approve`);
  },

  // Reject payment
  rejectPayment(paymentId) {
    return axiosClient.post(`/Admin/payments/${paymentId}/reject`);
  },

  // Ban/unban user
  toggleUserBan(userId) {
    return axiosClient.post(`/Admin/users/${userId}/toggle-ban`);
  },

  // Set user role (Admin only)
  setUserRole(userId, role) {
    return axiosClient.post(`/Admin/users/${userId}/set-role`, { Role: role });
  },

  // Update payment status (Admin only)
  updatePaymentStatus(paymentId, status) {
    return axiosClient.put(`/Admin/payments/${paymentId}/status`, {
      Status: status,
    });
  },

  // Delete song
  deleteSong(songId) {
    return axiosClient.delete(`/Admin/songs/${songId}`);
  },

  // Genres management
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

  // Cancel expired pending payments
  cancelExpiredPayments(daysThreshold = 15) {
    return axiosClient.post("/Admin/payments/cancel-expired", null, {
      params: { daysThreshold },
    });
  },

  // Send notification to user
  sendNotification(userId, data) {
    return axiosClient.post(`/Admin/notifications/send`, {
      UserId: userId,
      ...data,
    });
  },
};

export default adminApi;
