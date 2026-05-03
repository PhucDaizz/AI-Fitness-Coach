import { workoutApi } from './axiosInstances';

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
 * Fetch all meals with filters (Admin variant)
 */
export const getAdminMeals = async (params) => {
  return await handleResponse(workoutApi.get('/meals/admin', { params }));
};

/**
 * Fetch all meals with filters (Consumer variant)
 */
export const getMeals = async (params) => {
  return await handleResponse(workoutApi.get('/meals', { params }));
};

/**
 * Fetch a single meal by ID
 */
export const getMealById = async (id) => {
  return await handleResponse(workoutApi.get(`/meals/${id}`));
};

/**
 * Create a new meal record
 */
export const createMeal = async (mealData) => {
  return await handleResponse(workoutApi.post('/meals', mealData));
};

/**
 * Update an existing meal record
 */
export const updateMeal = async (id, mealData) => {
  return await handleResponse(workoutApi.put(`/meals/${id}`, mealData));
};

/**
 * Delete a meal record
 */
export const deleteMeal = async (id) => {
  return await handleResponse(workoutApi.delete(`/meals/${id}`));
};

export const syncMealEmbedding = async (id) => {
  return await handleResponse(workoutApi.post(`/meals/${id}/sync-embedding`));
};
