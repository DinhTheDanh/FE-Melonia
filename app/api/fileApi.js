import axiosClient from "./axiosClient";

const fileApi = {
  // Upload ảnh lên server -> Cloudinary
  uploadImage(file, onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/File/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });
  },

  // Lấy signature để upload trực tiếp lên Cloudinary
  getSignature() {
    return axiosClient.get("/File/signature");
  },

  // Upload audio lên server -> Cloudinary
  uploadAudio(file, onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/File/upload-audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000, // 5 minutes for large audio files
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });
  },
};
export default fileApi;
