import { authApi, workoutApi } from './axiosInstances';

/**
 * Common handler to unwrap the backend's ApiResponse structure
 */
const handleResponse = async (apiPromise) => {
  try {
    const response = await apiPromise;
    const apiResponse = response.data;

    if (apiResponse.success) {
      return apiResponse.data;
    } else {
      const error = new Error(apiResponse.message || 'Operation failed');
      error.errors = apiResponse.errors;
      throw error;
    }
  } catch (err) {
    if (err.response?.data) {
      const apiResponse = err.response.data;
      const error = new Error(apiResponse.message || err.message);
      error.errors = apiResponse.errors || [];
      throw error;
    }
    throw err;
  }
};

/**
 * Fetch total number of registered users across the entire system (Auth Service)
 */
export const getTotalUsers = async () => {
  return await handleResponse(authApi.get('/System/total-users'));
};

/**
 * Fetch token consumption chart data (Workout Service)
 * @param {number} timeFrame 1: 24h, 2: 7d, 3: 12m
 */
export const getTokenChartData = async (timeFrame = 1) => {
  return await handleResponse(workoutApi.get('/System/token-chart', { params: { timeFrame } }));
};
