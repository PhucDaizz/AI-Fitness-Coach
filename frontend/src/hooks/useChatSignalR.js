import { useEffect, useRef } from 'react';
import { chatSignalRService } from '../services/api/signalR.service';

/**
 * A custom hook to bind React components to SignalR Chat events
 * Uses a Ref pattern to ensure handlers are always up-to-date without 
 * having to re-register listeners with the SignalR service on every render.
 */
const useChatSignalR = (eventHandlers = {}, autoConnect = true) => {
  const handlersRef = useRef(eventHandlers);
  
  // Update the ref whenever the handlers change
  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    if (autoConnect) {
      chatSignalRService.connect();
    }

    // Register proxy listeners that always call the latest handler from the Ref
    const registeredEvents = [];

    Object.keys(chatSignalRService.listeners).forEach(eventName => {
      const proxyHandler = (...args) => {
        if (handlersRef.current[eventName]) {
          handlersRef.current[eventName](...args);
        }
      };
      
      chatSignalRService.on(eventName, proxyHandler);
      registeredEvents.push({ eventName, proxyHandler });
    });

    return () => {
      // Cleanup all registered proxy listeners
      registeredEvents.forEach(({ eventName, proxyHandler }) => {
        chatSignalRService.off(eventName, proxyHandler);
      });
    };
  }, [autoConnect]); // Only run on mount or autoConnect change

  return {
    connect: () => chatSignalRService.connect(),
    disconnect: () => chatSignalRService.disconnect(),
  };
};

export default useChatSignalR;
