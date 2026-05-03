import { progressApi, workoutApi } from './axiosInstances';

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

export const getWorkoutPlans = async (params) => {
  return await handleResponse(progressApi.get('v1/workout-plans', { params }));
};

export const deleteWorkoutPlan = async (planId) => {
  return await handleResponse(progressApi.delete(`v1/workout-plans/${planId}`));
};

export const generateWorkoutPlan = async (data) => {
  return await handleResponse(workoutApi.post('WorkoutPlan/generate', data, { timeout: 300000 }));
};

export const getWorkoutPlanDays = async (planId) => {
  return await handleResponse(progressApi.get(`v1/workout-plans/${planId}/days`));
};

export const submitWorkoutLog = async (logData) => {
  return await handleResponse(progressApi.post('v1/workout-logs', logData));
};

export const getWorkoutLogStatus = async (planId, dayId) => {
  return await handleResponse(progressApi.get(`v1/workout-plans/${planId}/days/${dayId}/log-status`));
};
