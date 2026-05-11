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

const handlePlainResponse = async (apiPromise) => {
  try {
    const response = await apiPromise;
    return response.data; // Just return the body
  } catch (err) {
    if (err.response?.data) {
      throw new Error(err.response.data.message || err.message);
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

/**
 * Fetch RAG tool usage chart data (Workout Service)
 * @param {number} timeFrame 1: 7 Days, 2: This Month, 3: This Year, 4: All Time
 */
export const getToolUsageChartData = async (timeFrame = 1) => {
  return await handleResponse(workoutApi.get('/System/tool-usage-chart', { params: { timeFrame } }));
};

/**
 * Requeue pending exercises for embedding (Workout Service)
 */
export const requeueExercises = async () => {
  return await handlePlainResponse(workoutApi.post('/Maintenance/requeue-exercises', {}));
};

/**
 * Requeue pending meals for embedding (Workout Service)
 */
export const requeueMeals = async () => {
  return await handlePlainResponse(workoutApi.post('/Maintenance/requeue-meals', {}));
};
