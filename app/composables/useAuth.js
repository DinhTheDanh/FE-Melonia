/**
 * Auth composable for managing authentication state
 */
import authApi from "~/api/authApi";

export const useAuth = () => {
  const jwt = useCookie("jwt");
  const router = useRouter();

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => !!jwt.value);

  /**
   * Get current JWT token
   */
  const getToken = () => jwt.value;

  /**
   * Save tokens after login
   * @param {Object} data - Response from login API { Token, RefreshToken, Expiration }
   */
  const saveTokens = (data) => {
    console.log("saveTokens called with data:", data);

    // Handle both camelCase and PascalCase from API
    const token = data?.Token || data?.token;
    const expiration = data?.Expiration || data?.expiration;

    if (!token) {
      console.error("Invalid token data - no token found:", data);
      return false;
    }

    console.log("Setting token, expiration:", expiration);

    // Set jwt cookie
    jwt.value = token;
    console.log("jwt.value after setting:", jwt.value);

    // For more precise expiration control on client-side
    if (import.meta.client) {
      if (expiration) {
        const expirationDate = new Date(expiration);
        document.cookie = `jwt=${token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict`;
        console.log(
          "Cookie set with expiration:",
          expirationDate.toUTCString(),
        );
      } else {
        // Default to 60 minutes if no expiration provided
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000);
        document.cookie = `jwt=${token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict`;
        console.log("Cookie set with default 60min expiration");
      }
      console.log("document.cookie:", document.cookie);
    }

    return true;
  };

  /**
   * Clear all auth tokens and redirect to login
   */
  const logout = async () => {
    console.log("Logout called");

    try {
      // Call logout API to invalidate refresh token on server
      console.log("Calling logout API");
      await authApi.logout();
      console.log("Logout API success");
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    }

    // Clear jwt cookie
    jwt.value = null;
    console.log("jwt.value cleared");

    if (import.meta.client) {
      document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      // Also clear refreshToken cookie if it exists
      document.cookie =
        "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      console.log("Cookies cleared, document.cookie:", document.cookie);
    }

    // Redirect to login
    console.log("Navigating to login");
    await router.push("/auth/login");
    console.log("Navigation complete");
  };

  /**
   * Decode JWT token to get user info
   * @returns {Object|null} Decoded token payload
   */
  const decodeToken = () => {
    const token = jwt.value;
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  /**
   * Get user info from token
   */
  const user = computed(() => {
    const decoded = decodeToken();
    if (!decoded) return null;

    return {
      id: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      email:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      name: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
      exp: decoded.exp,
      iss: decoded.iss,
      aud: decoded.aud,
    };
  });

  /**
   * Check if token is expired
   */
  const isTokenExpired = () => {
    const decoded = decodeToken();
    if (!decoded?.exp) return true;

    // Token exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  };

  return {
    isAuthenticated,
    getToken,
    saveTokens,
    logout,
    decodeToken,
    user,
    isTokenExpired,
  };
};
