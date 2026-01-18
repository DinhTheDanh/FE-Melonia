import axiosClient from "./axiosClient";

const fileApi = {
  // Gửi file audio lên server
  uploadFile(data) {
    return axiosClient.post("/File/upload-audio", data);
  },

  // Gửi file hình ảnh lên server
  uploadImage(data) {
    return axiosClient.post("/File/upload-image", data);
  },
};
export default fileApi;
