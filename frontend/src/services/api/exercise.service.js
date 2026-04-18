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

export const createExercise = async (exerciseData) => {
  return await handleResponse(workoutApi.post('/exercises', exerciseData));
};

export const updateExercise = async (id, exerciseData) => {
  return await handleResponse(workoutApi.put(`/exercises/${id}`, exerciseData));
};

export const deleteExercise = async (id) => {
  return await handleResponse(workoutApi.delete(`/exercises/${id}`));
};

export const getExercises = async (params = {}) => {
  return await handleResponse(workoutApi.get('/exercises', { params }));
};

export const getExerciseById = async (id) => {
  return await handleResponse(workoutApi.get(`/exercises/${id}`));
};
