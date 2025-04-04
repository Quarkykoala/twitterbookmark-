/**
 * Storage Core Module
 * Contains core storage constants and basic operations
 */

// Storage keys
export const BOOKMARKS_KEY = 'bookmarkos_bookmarks';
export const SETTINGS_KEY = 'bookmarkos_settings';

/**
 * Get all bookmarks from storage
 * @returns {Promise<Array>} Array of bookmark objects
 */
export async function getBookmarks() {
  return new Promise((resolve) => {
    try {
      const bookmarksJson = localStorage.getItem(BOOKMARKS_KEY);
      const bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
      resolve(bookmarks);
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
  return new Promise(async (resolve, reject) => {
    try {
      // Get existing bookmarks
      const bookmarks = await getBookmarks();
      
      // Add new bookmark
      bookmarks.unshift(bookmark);
      
      // Save to localStorage
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      
      resolve(true);
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