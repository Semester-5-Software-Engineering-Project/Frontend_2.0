import axios from 'axios';

// Function to get JWT token from various sources - exported for use in other components
export const getAuthToken = (): string | null => {
    try {
        // Try localStorage first
        const tokenFromLS = localStorage.getItem('token');
        if (tokenFromLS) return tokenFromLS;

        // Try cookies - check both possible names
        if (typeof document !== 'undefined') {
            // Check for jwtToken first (backend preference)
            let match = document.cookie.match(/(?:^|; )jwtToken=([^;]+)/);
            if (match) return decodeURIComponent(match[1]);
            
            // Fallback to jwt_token
            match = document.cookie.match(/(?:^|; )jwt_token=([^;]+)/);
            if (match) return decodeURIComponent(match[1]);
        }
    } catch (error) {
        console.warn('Error getting auth token:', error);
    }
    return null;
};

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true,
});

// Add request interceptor to include Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // For production HTTPS deployment, ensure proper headers
        if (process.env.NODE_ENV === 'production') {
            config.headers['Accept'] = 'application/json';
            config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if this is a core auth endpoint like /api/getuser
            // Don't redirect for resource-specific 401s like enrollment endpoints
            const url = error.config?.url || '';
            const isAuthEndpoint = url.includes('/api/getuser') || url.includes('/api/auth/');
            
            if (isAuthEndpoint) {
                // Clear token and redirect to login if unauthorized on auth endpoints
                localStorage.removeItem('token');
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
                    console.warn('Unauthorized access on auth endpoint, redirecting to login');
                    window.location.href = '/auth';
                }
            } else {
                // For other endpoints, just log the error but don't redirect
                console.warn('401 error on non-auth endpoint:', url);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;