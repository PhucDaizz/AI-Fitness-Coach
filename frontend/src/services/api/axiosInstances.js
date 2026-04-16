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
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized (e.g., redirect to login or refresh token)
        console.warn('Unauthorized! Logging out...');
        localStorage.removeItem('token');
        // window.location.href = '/login';
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
