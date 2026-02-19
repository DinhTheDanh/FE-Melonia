export default defineNuxtRouteMiddleware(async (to, from) => {
  // Lấy token từ cookie
  const jwt = useCookie("jwt");

  // Các trang công khai không yêu cầu xác thực
  const publicRoutes = ["/auth/login", "/auth/register"];
  const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route));

  // Nếu user đã đăng nhập mà vào trang auth thì redirect về home
  if (jwt.value && isPublicRoute) {
    return navigateTo("/");
  }

  // Nếu user chưa đăng nhập và vào trang không public thì redirect về login
  if (!jwt.value && !isPublicRoute) {
    return navigateTo("/auth/login");
  }

  // Check if token is expired (only on client-side)
  if (jwt.value && import.meta.client && !isPublicRoute) {
    try {
      // Decode token to check expiration
      const base64Url = jwt.value.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const decoded = JSON.parse(jsonPayload);

      // Check if token is expired (exp is in seconds)
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        // Token is expired, try to refresh
        try {
          const response = await fetch(
            "http://localhost:5111/api/v1/Auth/refresh-token",
            {
              method: "POST",
              credentials: "include", // Send cookies (refresh token)
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            // Save new token
            const expirationDate = new Date(data.Expiration);
            document.cookie = `jwt=${data.Token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict`;
            // Continue to the route
            return;
          }
        } catch (refreshError) {
          console.error("Token refresh failed in middleware:", refreshError);
        }

        // Refresh failed, clear token and redirect to login
        document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        return navigateTo("/auth/login");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      // Invalid token format, redirect to login
      return navigateTo("/auth/login");
    }
  }
});
