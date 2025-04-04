/**
 * Storage Module
 * Handles all data storage operations for the extension
 * Uses localStorage for offline-first approach
 * 
 * This file follows the facade pattern and delegates to specialized modules
 * to stay under 300 lines per file, according to project rules.
 */

// Storage keys
const BOOKMARKS_KEY = 'bookmarkos_bookmarks';
const SETTINGS_KEY = 'bookmarkos_settings';

// Storage type check
const storageType = typeof chrome !== 'undefined' && chrome.storage ? 'chrome' : 'local';
console.log('Using storage type:', storageType);

/**
 * Get all bookmarks from storage
 * @returns {Promise<Array>} Array of bookmark objects
 */
export async function getBookmarks() {
  console.log('Getting bookmarks from storage...');
  return new Promise((resolve) => {
    try {
      if (storageType === 'chrome') {
        chrome.storage.local.get([BOOKMARKS_KEY], (result) => {
          console.log('Chrome storage get result:', result);
          const bookmarks = result[BOOKMARKS_KEY] || [];
          resolve(bookmarks);
        });
      } else {
        const bookmarksJson = localStorage.getItem(BOOKMARKS_KEY);
        console.log('localStorage get result:', bookmarksJson);
        const bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
        resolve(bookmarks);
      }
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      resolve([]);
    }
  });
}

/**
 * Save a new bookmark to storage
 * @param {Object} bookmark - Bookmark object to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveBookmark(bookmark) {
  console.log('Saving bookmark:', bookmark);
  return new Promise(async (resolve, reject) => {
    try {
      // Get existing bookmarks
      const bookmarks = await getBookmarks();
      console.log('Current bookmarks:', bookmarks);
      
      // Add new bookmark
      bookmarks.unshift(bookmark);
      
      // Save to storage
      if (storageType === 'chrome') {
        chrome.storage.local.set({ [BOOKMARKS_KEY]: bookmarks }, () => {
          if (chrome.runtime.lastError) {
            console.error('Chrome storage error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('Bookmark saved to chrome.storage.local');
            resolve(true);
          }
        });
      } else {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        console.log('Bookmark saved to localStorage');
        resolve(true);
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
      reject(error);
    }
  });
}

/**
 * Update an existing bookmark
 * @param {Object} bookmark - Updated bookmark object (must include id)
 * @returns {Promise<boolean>} Success status
 */
export async function updateBookmark(bookmark) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get existing bookmarks
      const bookmarks = await getBookmarks();
      
      // Find bookmark index
      const index = bookmarks.findIndex(b => b.id === bookmark.id);
      
      if (index === -1) {
        reject(new Error('Bookmark not found'));
        return;
      }
      
      // Update bookmark
      bookmarks[index] = bookmark;
      
      // Save to localStorage
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      
      resolve(true);
    } catch (error) {
      console.error('Error updating bookmark:', error);
      reject(error);
    }
  });
}

/**
 * Delete a bookmark by ID
 * @param {string} id - Bookmark ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteBookmark(id) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get existing bookmarks
      const bookmarks = await getBookmarks();
      
      // Filter out the bookmark to delete
      const updatedBookmarks = bookmarks.filter(b => b.id !== id);
      
      // Save to localStorage
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      
      resolve(true);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      reject(error);
    }
  });
}

/**
 * Search bookmarks by query
 * @param {Array} bookmarks - Array of bookmarks to search
 * @param {string} query - Search query
 * @returns {Array} Filtered bookmarks
 */
export function searchBookmarks(bookmarks, query) {
  if (!query) return bookmarks;
  
  const lowercaseQuery = query.toLowerCase();
  
  return bookmarks.filter(bookmark => {
    // Search in title
    const titleMatch = bookmark.title.toLowerCase().includes(lowercaseQuery);
    
    // Search in URL
    const urlMatch = bookmark.url.toLowerCase().includes(lowercaseQuery);
    
    // Search in notes
    const notesMatch = bookmark.notes 
      ? bookmark.notes.toLowerCase().includes(lowercaseQuery) 
      : false;
    
    // Search in tags
    const tagsMatch = bookmark.tags.some(tag => 
      tag.toLowerCase().includes(lowercaseQuery)
    );
    
    // Search in AI summary (if available)
    const summaryMatch = bookmark.aiSummary 
      ? bookmark.aiSummary.toLowerCase().includes(lowercaseQuery) 
      : false;
    
    return titleMatch || urlMatch || notesMatch || tagsMatch || summaryMatch;
  });
}

/**
 * Get user settings from storage
 * @returns {Promise<Object>} User settings object
 */
export async function getUserSettings() {
  return new Promise((resolve) => {
    try {
      const settingsJson = localStorage.getItem(SETTINGS_KEY);
      const settings = settingsJson ? JSON.parse(settingsJson) : getDefaultSettings();
      resolve(settings);
    } catch (error) {
      console.error('Error getting settings:', error);
      resolve(getDefaultSettings());
    }
  });
}

/**
 * Get default user settings
 * @returns {Object} Default settings object
 */
function getDefaultSettings() {
  return {
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    defaultFilter: 'all',
    isPremium: false,
    lastSyncDate: null
  };
}

/**
 * Check if user is premium
 * @returns {Promise<boolean>} Premium status
 */
export async function isPremiumUser() {
  const settings = await getUserSettings();
  return settings.isPremium === true;
}

/**
 * Save user settings to storage
 * @param {Object} settings - Settings object to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveUserSettings(settings) {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      resolve(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      reject(error);
    }
  });
}

/**
 * Save dark mode preference
 * @param {boolean} isDarkMode - Dark mode state
 * @returns {Promise<boolean>} Success status
 */
export async function saveDarkModePreference(isDarkMode) {
  try {
    const settings = await getUserSettings();
    settings.darkMode = isDarkMode;
    return saveUserSettings(settings);
  } catch (error) {
    console.error('Error saving dark mode preference:', error);
    return false;
  }
}
