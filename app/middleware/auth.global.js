export default defineNuxtRouteMiddleware((to, from) => {
  // Lấy token từ cookie
  const token = useCookie("jwt");

  // Các trang công khai không yêu cầu xác thực
  const publicPages = [];
  const isPublicPage = publicPages.includes(to.path);

  // Nếu không có token và trang không phải là trang công khai, chuyển hướng đến trang đăng nhập
  if (!token && !isPublicPage) {
    return navigateTo("/auth/login");
  }

  // Nếu có token và trang là trang công khai, chuyển hướng đến trang chủ
  if (token && isPublicPage) {
    return navigateTo("/");
  }
});
