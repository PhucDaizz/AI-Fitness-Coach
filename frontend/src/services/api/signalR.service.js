import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.startPromise = null;
    this.handlersRegistered = false;
    this.hubUrl =
      import.meta.env.VITE_SIGNALR_CHAT_URL ||
      `${import.meta.env.VITE_WORKOUT_API_URL || 'http://localhost:7002'}/hubs/chat`;

    // Event listeners storage
    this.listeners = {
      ReceiveMessageChunk: [],
      MessageCompleted: [],
      ReceiveMessage: [],
      ReceiveError: [],
      SessionTitleUpdated: [],
      WorkoutPlanGenerationUpdated: [],
      ConnectionReconnected: [],
      UpdateOnlineUsersCount: [],
    };

    // Cache latest status data to provide to newly mounted components immediately
    this.cachedData = {
      onlineCount: 0,
    };
  }

  async connect() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          // Automatically inject auth token for authenticated hubs
          accessTokenFactory: () => localStorage.getItem('token') || '',
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.onreconnected(() => {
        this.notifyListeners('ConnectionReconnected');
      });
    }

    if (!this.handlersRegistered) {
      // Register once per connection so React StrictMode cannot duplicate
      // SignalR chunk handlers during development.
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

      this.connection.on('WorkoutPlanGenerationUpdated', (job) => {
        this.notifyListeners('WorkoutPlanGenerationUpdated', job);
      });

      this.connection.on('UpdateOnlineUsersCount', (count) => {
        this.cachedData.onlineCount = count;
        this.notifyListeners('UpdateOnlineUsersCount', count);
      });

      this.handlersRegistered = true;
    }

    this.startPromise = this.connection
      .start()
      .then(() => {
        console.log('SignalR Chat Hub Connected Successfully');
      })
      .catch((err) => {
        console.error('SignalR Connection Error: ', err);
        this.connection = null;
        this.handlersRegistered = false;
        throw err;
      })
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
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
      this.listeners[eventName] = this.listeners[eventName].filter((cb) => cb !== callback);
    }
  }

  /**
   * Internal helper to trigger callbacks
   */
  notifyListeners(eventName, ...args) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((callback) => callback(...args));
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.startPromise = null;
      this.handlersRegistered = false;
      console.log('SignalR Chat Hub Disconnected');

      // Clear listeners
      Object.keys(this.listeners).forEach((key) => {
        this.listeners[key] = [];
      });
    }
  }
}

// Export as a singleton
export const chatSignalRService = new SignalRService();
