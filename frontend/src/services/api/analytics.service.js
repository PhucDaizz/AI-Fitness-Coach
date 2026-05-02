import { progressApi } from './axiosInstances';

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

export const getAnalyticsSummary = async () => {
  return await handleResponse(progressApi.get('v1/analytics/summary'));
};

export const getMuscleVolume = async () => {
  return await handleResponse(progressApi.get('v1/analytics/muscle-volume'));
};
