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

export const createEquipment = async (equipmentData) => {
  return await handleResponse(workoutApi.post('/equipments', equipmentData));
};

export const updateEquipment = async (id, equipmentData) => {
  return await handleResponse(workoutApi.put(`/equipments/${id}`, equipmentData));
};

export const deleteEquipment = async (id) => {
  return await handleResponse(workoutApi.delete(`/equipments/${id}`));
};

export const getEquipments = async (params = {}) => {
  return await handleResponse(workoutApi.get('/equipments', { params }));
};

export const getEquipmentById = async (id) => {
  return await handleResponse(workoutApi.get(`/equipments/${id}`));
};
