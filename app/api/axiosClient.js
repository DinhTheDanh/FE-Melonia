import axios from "axios";

const baseURL = process.env.BE_URL || "http://localhost:5111/api/v1";

const axiosClient = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => {
    // Return response.data directly, or response.data.data if it exists
    const data = response.data;
    return data?.data ?? data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error.response ? error.response.data : error);
  },
);

export default axiosClient;
