import axios from "axios";

// Backend URL'i environment variable'dan al
// Production'da: Render backend URL'i (örn: https://your-backend.onrender.com/api)
// Development'ta: localhost:5000
function getAPIURL() {
  // Build-time environment variable
  let url = process.env.NEXT_PUBLIC_API_BASE_URL || 
            process.env.NEXT_PUBLIC_API_URL || 
            "http://localhost:5000/api";
  
  // Runtime'da production kontrolü yap
  if (typeof window !== 'undefined') {
    const isProduction = !window.location.hostname.includes('localhost');
    
    // Production'da /api suffix'i yoksa ekle
    if (isProduction && url && !url.includes('/api')) {
      url = url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    
    // Fallback: Eğer environment variable yoksa ve production'daysa hardcoded URL kullan
    if (isProduction && (!process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_URL)) {
      url = "https://gaun-mudek.onrender.com/api";
      console.warn('⚠️ Using fallback API URL:', url);
    }
    
    console.log('🔗 Environment Variable:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('✅ API Base URL:', url);
  }
  
  return url;
}

const baseAPIURL = getAPIURL();

export const apiClient = axios.create({
  baseURL: baseAPIURL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Runtime'da baseURL'i düzelt (/api suffix'i eksikse ekle)
    if (typeof window !== 'undefined' && config.baseURL) {
      const isProduction = !window.location.hostname.includes('localhost');
      if (isProduction && !config.baseURL.includes('/api')) {
        config.baseURL = config.baseURL.endsWith('/') 
          ? `${config.baseURL}api` 
          : `${config.baseURL}/api`;
        console.warn('⚠️ Fixed baseURL in request:', config.baseURL);
      }
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
      const errorMessage = "Backend sunucusuna bağlanılamıyor. Lütfen backend'in çalıştığından emin olun.";
      console.error("Network Error:", errorMessage, error);
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

