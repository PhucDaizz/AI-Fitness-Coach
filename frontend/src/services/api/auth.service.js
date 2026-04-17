import { authApi } from './axiosInstances';

/**
 * Common handler to unwrap the backend's ApiResponse structure
 * @param {Promise} apiPromise
 */
const handleResponse = async (apiPromise) => {
  try {
    const response = await apiPromise;
    console.log('API Raw Response:', response);
    const apiResponse = response.data;
    // ...

    if (apiResponse.success) {
      return apiResponse.data;
    } else {
      // Create an error that looks like the backend's error message
      const error = new Error(apiResponse.message || 'Operation failed');
      error.errors = apiResponse.errors;
      throw error;
    }
  } catch (err) {
    if (err.response?.data) {
      // Extract ApiResponse data from Axios error
      const apiResponse = err.response.data;
      const error = new Error(apiResponse.message || err.message);
      error.errors = apiResponse.errors || [];
      throw error;
    }
    throw err;
  }
};

export const login = async (email, password) => {
  const data = await handleResponse(authApi.post('/Auth/Login', { email, password }));

  // Data here is { token, refreshToken }
  if (data?.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  return data;
};

export const register = async (fullName, email, password, phoneNumber) => {
  return await handleResponse(
    authApi.post('/Auth/register-customer', {
      fullName,
      email,
      password,
      phoneNumber,
    }),
  );
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};
