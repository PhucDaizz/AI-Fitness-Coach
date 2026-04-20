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

export const createExerciseCategory = async (categoryData) => {
  return await handleResponse(workoutApi.post('/exercise-categories', categoryData));
};

export const updateExerciseCategory = async (id, categoryData) => {
  return await handleResponse(workoutApi.put(`/exercise-categories/${id}`, categoryData));
};

export const deleteExerciseCategory = async (id) => {
  return await handleResponse(workoutApi.delete(`/exercise-categories/${id}`));
};

export const getExerciseCategories = async (params = {}) => {
  // params can include pageNumber, pageSize, searchTerm
  return await handleResponse(workoutApi.get('/exercise-categories', { params }));
};

export const getExerciseCategoryById = async (id) => {
  return await handleResponse(workoutApi.get(`/exercise-categories/${id}`));
};
