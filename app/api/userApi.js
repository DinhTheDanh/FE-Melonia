import axiosClient from "./axiosClient";

const userApi = {
  // Lấy thông tin người dùng
  getUserInfo(data) {
    return axiosClient.get("/User/profile", data);
  },

  // Cập nhật thông tin người dùng
  updateProfile(data) {
    return axiosClient.put("/User/profile", data);
  },

  // Update interest
  updateInterest(data) {
    return axiosClient.post("/User/update-interests", data);
  },
};
export default userApi;
