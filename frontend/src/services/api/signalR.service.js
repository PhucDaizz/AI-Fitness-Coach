import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.baseUrl = import.meta.env.VITE_WORKOUT_API_URL || 'http://localhost:7002';
    
    // Event listeners storage
    this.listeners = {
      ReceiveMessageChunk: [],
      MessageCompleted: [],
      ReceiveMessage: [],
      ReceiveError: [],
      SessionTitleUpdated: [],
      UpdateOnlineUsersCount: []
    };

    // Cache latest status data to provide to newly mounted components immediately
    this.cachedData = {
      onlineCount: 0
    };
  }

  async connect() {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/chat`, {
        // Automatically inject auth token for authenticated hubs
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect() // Auto reconnect on network failure
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Map backend IChatClient events locally
    this.connection.on('ReceiveMessageChunk', (messageId, chunk) => {
      this.notifyListeners('ReceiveMessageChunk', messageId, chunk);
    });

    this.connection.on('MessageCompleted', (messageId) => {
      this.notifyListeners('MessageCompleted', messageId);
    });

    this.connection.on('ReceiveMessage', (messageId, role, content) => {
      this.notifyListeners('ReceiveMessage', messageId, role, content);
    });

    this.connection.on('ReceiveError', (errorMessage) => {
      this.notifyListeners('ReceiveError', errorMessage);
    });

    this.connection.on('SessionTitleUpdated', (sessionId, title) => {
      this.notifyListeners('SessionTitleUpdated', sessionId, title);
    });

    this.connection.on('UpdateOnlineUsersCount', (count) => {
      this.cachedData.onlineCount = count; // Save to cache
      this.notifyListeners('UpdateOnlineUsersCount', count);
    });

    try {
      await this.connection.start();
      console.log('🚀 SignalR Chat Hub Connected Successfully');
    } catch (err) {
      console.error('❌ SignalR Connection Error: ', err);
    }
  }

  /**
   * Subscribe to a specific SignalR event
   * @param {string} eventName Name of the event to subscribe to
   * @param {function} callback Callback function
   */
  on(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].push(callback);
      
      // If subscribing to online count, immediately provide the cached value
      if (eventName === 'UpdateOnlineUsersCount' && this.cachedData.onlineCount > 0) {
        callback(this.cachedData.onlineCount);
      }
    } else {
      console.warn(`SignalRService: Unknown event '${eventName}'`);
    }
  }

  /**
   * Unsubscribe from a specific SignalR event
   * @param {string} eventName Name of the event
   * @param {function} callback Reference to the callback function to remove
   */
  off(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    }
  }

  /**
   * Internal helper to trigger callbacks
   */
  notifyListeners(eventName, ...args) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(...args));
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('🛑 SignalR Chat Hub Disconnected');
      
      // Clear listeners
      Object.keys(this.listeners).forEach(key => {
        this.listeners[key] = [];
      });
    }
  }
}

// Export as a singleton
export const chatSignalRService = new SignalRService();
