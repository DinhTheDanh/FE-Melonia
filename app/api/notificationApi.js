import axiosClient from "./axiosClient";

const notificationApi = {
  // Get all notifications for current user
  getNotifications(params) {
    return axiosClient.get("/Notification", { params });
  },

  // Get unread count
  getUnreadCount() {
    return axiosClient.get("/Notification/unread-count");
  },

  // Mark one notification as read
  markAsRead(notificationId) {
    return axiosClient.post(`/Notification/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead() {
    return axiosClient.post("/Notification/read-all");
  },
};

export default notificationApi;
