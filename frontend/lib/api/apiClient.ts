import axios from "axios";

// Backend base URL'i environment variable'dan al (WITHOUT /api suffix)
// Production: https://gaun-mudek.onrender.com
// Development: http://localhost:5000
const getBaseURL = () => {
  // Environment variable should NOT include /api
  let base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  
  // Eğer kullanıcı hala /api eklemişse, kaldır
  if (base.includes('/api')) {
    base = base.replace(/\/api\/?$/, '');
    console.warn('⚠️ NEXT_PUBLIC_API_BASE_URL içinde /api bulundu, kaldırıldı. Yeni değer:', base);
  }
  
  // Remove trailing slash if present
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  
  // Always log the final URL (both dev and prod for debugging)
  if (typeof window !== 'undefined') {
    const finalURL = `${cleanBase}/api`;
    console.log('🔗 API Base URL:', finalURL);
    console.log('🔗 Environment Variable:', process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set (using default)');
  }
  
  return cleanBase;
};

const baseURL = getBaseURL();

export const apiClient = axios.create({
  baseURL: `${baseURL}/api`, // Always append /api here
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Set to true if using cookies
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Log request URL in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const fullURL = `${config.baseURL}${config.url}`;
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${fullURL}`);
    }
    
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
    // Handle network errors (backend not running, CORS, timeout)
    if (
      error.code === "ERR_NETWORK" || 
      error.message === "Network Error" ||
      error.code === "ECONNABORTED" ||
      error.code === "ERR_FAILED"
    ) {
      const baseURL = apiClient.defaults.baseURL;
      const isTimeout = error.code === "ECONNABORTED";
      const errorMessage = isTimeout 
        ? `Backend sunucusuna bağlanılamıyor (timeout). URL: ${baseURL}\nLütfen backend'in çalıştığından ve doğru port'ta olduğundan emin olun.`
        : `Backend sunucusuna bağlanılamıyor. URL: ${baseURL}\nLütfen backend'in çalıştığından emin olun.`;
      
      console.error("❌ Network Error:", errorMessage);
      console.error("❌ Error details:", {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
      });
      
      // Create a custom error with user-friendly message
      const networkError = new Error(errorMessage);
      (networkError as any).isNetworkError = true;
      (networkError as any).isRetryable = true;
      (networkError as any).originalError = error;
      return Promise.reject(networkError);
    }

    // Handle 502 Bad Gateway - backend is down or crashed
    if (error.response?.status === 502) {
      const errorMessage = "Backend sunucusu geçici olarak kullanılamıyor. Lütfen birkaç saniye sonra tekrar deneyin.";
      console.error("502 Bad Gateway:", errorMessage);
      const gatewayError = new Error(errorMessage);
      (gatewayError as any).isGatewayError = true;
      (gatewayError as any).isRetryable = true;
      (gatewayError as any).originalError = error;
      return Promise.reject(gatewayError);
    }

    // Handle CORS errors
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CORS')) {
      const errorMessage = "CORS hatası: Backend yapılandırmasını kontrol edin.";
      console.error("CORS Error:", errorMessage);
      const corsError = new Error(errorMessage);
      (corsError as any).isCORSError = true;
      (corsError as any).originalError = error;
      return Promise.reject(corsError);
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

