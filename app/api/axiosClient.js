import axios from "axios";

const baseURL = process.env.BE_URL || "http://localhost:5111/api/v1";

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const axiosClient = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Important: sends cookies (refreshToken) automatically
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// Request interceptor - add access token to headers
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from cookie (client-side only)
    if (typeof window !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 and refresh token
axiosClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    return data?.data ?? data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for login/register/refresh-token endpoints
      if (
        originalRequest.url?.includes("/Auth/login") ||
        originalRequest.url?.includes("/Auth/register") ||
        originalRequest.url?.includes("/Auth/refresh-token")
      ) {
        return Promise.reject(error.response ? error.response.data : error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint (cookie is sent automatically)
        const response = await axios.post(
          `${baseURL}/Auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const { Token, RefreshToken, Expiration } = response.data;

        // Save new access token to cookie
        if (typeof window !== "undefined") {
          const expirationDate = new Date(Expiration);
          document.cookie = `jwt=${Token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict`;
        }

        // Update header for original request
        originalRequest.headers.Authorization = `Bearer ${Token}`;

        // Process queued requests
        processQueue(null, Token);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(refreshError, null);

        if (typeof window !== "undefined") {
          // Clear jwt cookie
          document.cookie =
            "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response ? error.response.data : error);
  },
);

export default axiosClient;
