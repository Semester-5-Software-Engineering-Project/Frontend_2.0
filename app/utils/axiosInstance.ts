import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true,
});

// Function to get JWT token from various sources
const getAuthToken = (): string | null => {
    try {
        // Try localStorage first
        const tokenFromLS = localStorage.getItem('token');
        if (tokenFromLS) return tokenFromLS;

        // Try cookies - handle production environment properly
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(/(?:^|; )jwt_token=([^;]+)/);
            if (match) return decodeURIComponent(match[1]);
        }
    } catch (error) {
        console.warn('Error getting auth token:', error);
    }
    return null;
};

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
            // Clear token and redirect to login if unauthorized
            localStorage.removeItem('token');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
                console.warn('Unauthorized access, redirecting to login');
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;