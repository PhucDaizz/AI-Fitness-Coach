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

export const createMuscleGroup = async (muscleData) => {
  return await handleResponse(workoutApi.post('/muscle-groups', muscleData));
};

export const updateMuscleGroup = async (id, muscleData) => {
  return await handleResponse(workoutApi.put(`/muscle-groups/${id}`, muscleData));
};

export const deleteMuscleGroup = async (id) => {
  return await handleResponse(workoutApi.delete(`/muscle-groups/${id}`));
};

export const getMuscleGroups = async (params = {}) => {
  return await handleResponse(workoutApi.get('/muscle-groups', { params }));
};

export const getMuscleGroupById = async (id) => {
  return await handleResponse(workoutApi.get(`/muscle-groups/${id}`));
};
