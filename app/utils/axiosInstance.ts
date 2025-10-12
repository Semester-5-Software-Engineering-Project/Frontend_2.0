import axios from 'axios';



const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true,
});


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to auth on these specific endpoints AND if not already on auth page
    if (error.response?.status === 401 && 
        error.config?.url?.includes('/api/getuser') &&
        typeof window !== 'undefined' && 
        !(window.location.pathname.includes('/') || window.location.pathname.includes('/auth'))) {
      console.warn('Unauthorized access, redirecting to login')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance;