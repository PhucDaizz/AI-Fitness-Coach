import { workoutApi } from './axiosInstances';

const handleResponse = async (apiPromise) => {
  try {
    const response = await apiPromise;
    const apiResponse = response.data;

    // Standard BE ApiResponse wrapper
    if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
      if (apiResponse.success) {
        return apiResponse.data;
      } else {
        const error = new Error(apiResponse.message || 'Operation failed');
        error.errors = apiResponse.errors;
        throw error;
      }
    }
    
    // Fallback for raw responses (like Accepted/Ok with custom objects)
    return apiResponse;
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
 * Lấy danh sách tất cả các session của người dùng hiện tại
 */
export const getSessions = async () => {
  return await handleResponse(workoutApi.get('/Session'));
};

/**
 * Lấy danh sách tin nhắn trong một session
 */
export const getSessionMessages = async (sessionId, before = null, pageSize = 20) => {
  const params = { sessionId, pageSize };
  if (before) params.before = before;
  
  return await handleResponse(workoutApi.get('/Session/messages', { params }));
};

/**
 * Thay đổi tiêu đề của session
 */
export const changeTitle = async (sessionId, newTitle) => {
  return await handleResponse(workoutApi.post('/Session', null, { 
    params: { sessionId, newTitle } 
  }));
};

/**
 * Gửi yêu cầu chat AI (Streaming)
 * BE: RagController.StreamAskFitness
 * Trả về: { messageId, status } (Không bọc trong ApiResponse)
 */
export const streamChat = async (question, sessionId) => {
  // BE: StreamChatRequest { Question, SessionId }
  // Lưu ý: userId được BE lấy từ Token, không cần gửi trong body
  return await handleResponse(workoutApi.post('/Rag/stream-chat', { 
    question, 
    sessionId 
  }));
};

export const deleteSession = async (sessionId) => {
  return await handleResponse(workoutApi.delete('/Session', { params: { sessionId } }));
};
