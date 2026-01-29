import axiosClient from "./axiosClient";
import axios from "axios";

const fileApi = {
  // Gửi file audio lên server
  uploadFile(data) {
    return axiosClient.post("/File/upload-audio", data);
  },

  // Gửi file hình ảnh lên server
  uploadImage(data) {
    return axiosClient.post("/File/upload-image", data);
  },

  getSignature() {
    return axiosClient.get("/File/signature");
  },

  async uploadDirect(file, resourceType, onProgress) {
    const sigRes = await this.getSignature();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sigRes.ApiKey);
    formData.append("timestamp", sigRes.Timestamp);
    formData.append("signature", sigRes.Signature);
    formData.append("folder", sigRes.Folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${sigRes.CloudName}/${resourceType}/upload`;

    const response = await axios.post(uploadUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });

    return response.data;
  },
};
export default fileApi;
