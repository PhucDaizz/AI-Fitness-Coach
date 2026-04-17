import axios from 'axios';

// Helper to create an instance with common config
const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for Auth Token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for global error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const refreshToken = localStorage.getItem('refreshToken');
        const token = localStorage.getItem('token');

        if (refreshToken && token) {
          try {
            console.log('Token expired. Attempting refresh...');
            
            // Call the refresh endpoint directly using axios to avoid loops
            const response = await axios.post(`${import.meta.env.VITE_AUTH_API_URL}/api/Auth/Refreshtoken`, {
              token,
              refreshToken
            });

            if (response.data.success) {
              const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
              
              localStorage.setItem('token', newToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              // Update the header and retry
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
            // Refresh failed, clear everything and go to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token available
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create specialized instances
export const authApi = createInstance(`${import.meta.env.VITE_AUTH_API_URL}/api`);
export const workoutApi = createInstance(`${import.meta.env.VITE_WORKOUT_API_URL}/api`);
export const progressApi = createInstance(`${import.meta.env.VITE_PROGRESS_API_URL}/api`);
