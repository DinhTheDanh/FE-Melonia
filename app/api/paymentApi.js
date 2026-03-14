import axiosClient from "./axiosClient";

const paymentApi = {
  // Lấy danh sách gói subscription (public)
  getPlans() {
    return axiosClient.get("/Subscription/plans");
  },

  // Tạo payment để thanh toán
  createPayment(data) {
    return axiosClient.post("/Payment/create", data);
  },

  // Xử lý VNPay return (sau khi thanh toán)
  vnpayReturn(queryString) {
    return axiosClient.get(`/Payment/vnpay-return${queryString}`);
  },

  // Lấy lịch sử thanh toán
  getPaymentHistory() {
    return axiosClient.get("/Payment/history");
  },

  // Lấy chi tiết giao dịch
  getPaymentDetail(paymentId) {
    return axiosClient.get(`/Payment/${paymentId}`);
  },

  // Lấy subscription đang hoạt động
  getActiveSubscription() {
    return axiosClient.get("/Subscription/active");
  },

  // Lấy lịch sử subscription
  getSubscriptionHistory() {
    return axiosClient.get("/Subscription/history");
  },

  // Lấy toàn bộ quyền user (features)
  getFeatures() {
    return axiosClient.get("/Subscription/features");
  },

  // Check quyền upload
  canUpload() {
    return axiosClient.get("/Subscription/features/can-upload");
  },

  // Check quyền lên lịch
  canSchedule() {
    return axiosClient.get("/Subscription/features/can-schedule");
  },

  // Check quyền analytics nâng cao
  hasAnalytics() {
    return axiosClient.get("/Subscription/features/has-analytics");
  },
};

export default paymentApi;
