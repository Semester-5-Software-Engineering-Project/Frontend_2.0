import axios from 'axios';

// Function to get JWT token from various sources - exported for use in other components
export const getAuthToken = (): string | null => {
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
            // Clear token and redirect to login if unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
                console.warn('Unauthorized access, redirecting to login');
                window.location.href = '/auth';
            }
        } else if (error.response?.status === 404 && 
                   (error.config?.url?.includes('/tutor-profile') || 
                    error.config?.url?.includes('/student-profile')) &&
                   error.response?.data?.includes?.('profile not found')) {
            // Handle missing profile errors
            console.error('BACKEND ISSUE: Profile not found for authenticated user');
            console.error('URL:', error.config?.url);
            console.error('This is a backend database issue - profile needs to be created');
            
            // Don't redirect automatically for profile errors, let the component handle it
            console.warn('Profile missing - this should be handled by the calling component');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;