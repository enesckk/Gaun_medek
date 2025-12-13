import axios from "axios";

// Backend URL'i environment variable'dan al
// Production'da: Render backend URL'i (örn: https://your-backend.onrender.com/api)
// Development'ta: localhost:5000
const API_URL = 
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  process.env.NEXT_PUBLIC_API_URL || 
  "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors (backend not running)
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      const errorMessage = "Backend sunucusuna bağlanılamıyor. Lütfen backend'in çalıştığından emin olun.";
      console.error("Network Error:", errorMessage);
      // Create a custom error with user-friendly message
      const networkError = new Error(errorMessage);
      (networkError as any).isNetworkError = true;
      (networkError as any).originalError = error;
      return Promise.reject(networkError);
    }

    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error("Unauthorized access");
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error("Server error:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

