import axiosClient from "./axiosClient";

const authApi = {
  // Đăng nhập
  login(data) {
    return axiosClient.post("/Auth/login", data);
  },

  // Đăng ký
  register(data) {
    return axiosClient.post("/Auth/register", data);
  },

  // Đăng nhập với Google
  googleLogin(token) {
    return axiosClient.post("/Auth/google-login", { IdToken: token });
  },

  // Đổi vai trò người dùng
  setRole(data) {
    return axiosClient.post("/Auth/set-role", data);
  },

  // Đăng xuất
  logout() {
    return axiosClient.post("/Auth/logout");
  },

  // Đổi mật khẩu
  changePassword(data) {
    return axiosClient.put("/Auth/change-password", data);
  },

  // Quên mật khẩu
  forgotPassword(data) {
    return axiosClient.post("/Auth/forgot-password", data);
  },

  // Đặt lại mật khẩu
  resetPassword(data) {
    return axiosClient.put("/Auth/reset-password", data);
  },
};
export default authApi;
