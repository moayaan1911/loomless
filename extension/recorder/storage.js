/**
 * IndexedDB Storage for LoomLess Video Recordings
 * Handles temporary storage of recorded videos for editing
 */

class VideoStorage {
  constructor() {
    this.dbName = "LoomLessDB";
    this.version = 1;
    this.storeName = "recordings";
    this.db = null;
  }

  /**
   * Initialize IndexedDB database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB initialized successfully");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create recordings store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });

          // Create indexes for efficient querying
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("filename", "filename", { unique: false });

          console.log("Created recordings object store");
        }
      };
    });
  }

  /**
   * Store a video recording
   * @param {Blob} videoBlob - The video blob to store
   * @param {string} mimeType - The MIME type of the video
   * @param {Object} metadata - Additional metadata (optional)
   * @returns {Promise<string>} The ID of the stored recording
   */
  async storeRecording(videoBlob, mimeType, metadata = {}) {
    if (!this.db) {
      await this.init();
    }

    const id = `recording_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const filename = metadata.filename || `loomless-recording-${id}.webm`;

    const recording = {
      id,
      timestamp,
      filename,
      mimeType,
      size: videoBlob.size,
      duration: metadata.duration || null,
      videoBlob,
      ...metadata,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      const request = store.add(recording);

      request.onsuccess = () => {
        console.log(`Video stored successfully with ID: ${id}`);
        resolve(id);
      };

      request.onerror = () => {
        console.error("Error storing video:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Retrieve a video recording by ID
   * @param {string} id - The recording ID
   * @returns {Promise<Object>} The recording object
   */
  async getRecording(id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          reject(new Error(`Recording with ID ${id} not found`));
        }
      };

      request.onerror = () => {
        console.error("Error retrieving video:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all stored recordings
   * @returns {Promise<Array>} Array of recording objects
   */
  async getAllRecordings() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("Error retrieving recordings:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete a recording by ID
   * @param {string} id - The recording ID to delete
   * @returns {Promise<void>}
   */
  async deleteRecording(id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`Recording ${id} deleted successfully`);
        resolve();
      };

      request.onerror = () => {
        console.error("Error deleting recording:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear all recordings (cleanup)
   * @returns {Promise<void>}
   */
  async clearAllRecordings() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      const request = store.clear();

      request.onsuccess = () => {
        console.log("All recordings cleared");
        resolve();
      };

      request.onerror = () => {
        console.error("Error clearing recordings:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get storage usage information
   * @returns {Promise<Object>} Storage usage stats
   */
  async getStorageStats() {
    const recordings = await this.getAllRecordings();

    const stats = {
      totalRecordings: recordings.length,
      totalSize: recordings.reduce((sum, recording) => sum + recording.size, 0),
      oldestRecording:
        recordings.length > 0
          ? recordings.reduce((oldest, current) =>
              new Date(current.timestamp) < new Date(oldest.timestamp)
                ? current
                : oldest
            ).timestamp
          : null,
      newestRecording:
        recordings.length > 0
          ? recordings.reduce((newest, current) =>
              new Date(current.timestamp) > new Date(newest.timestamp)
                ? current
                : newest
            ).timestamp
          : null,
    };

    return stats;
  }
}

// Create global instance for Chrome extension compatibility
window.videoStorage = new VideoStorage();
