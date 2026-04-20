import { useEffect } from 'react';
import { chatSignalRService } from '../services/api/signalR.service';

/**
 * A custom hook to easily bind React components to SignalR Chat events
 * @param {Object} eventHandlers Object containing event names as keys and callback functions as values
 * @param {boolean} autoConnect Determine whether to connect automatically on mount
 */
const useChatSignalR = (eventHandlers = {}, autoConnect = true) => {
  useEffect(() => {
    // 1. Establish connection if autoConnect is true
    if (autoConnect) {
      chatSignalRService.connect();
    }

    // 2. Register all provided event listeners
    Object.entries(eventHandlers).forEach(([eventName, callback]) => {
      chatSignalRService.on(eventName, callback);
    });

    // 3. Cleanup on unmount
    return () => {
      Object.entries(eventHandlers).forEach(([eventName, callback]) => {
        chatSignalRService.off(eventName, callback);
      });
      // Do not auto-disconnect here so the connection persists across route changes.
      // Call chatSignalRService.disconnect() manually on logout instead.
    };
  }, [autoConnect, eventHandlers]);

  return {
    connect: () => chatSignalRService.connect(),
    disconnect: () => chatSignalRService.disconnect(),
  };
};

export default useChatSignalR;
