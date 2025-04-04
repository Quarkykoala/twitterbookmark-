/**
 * Storage Import/Export Module
 * Handles importing and exporting bookmark data
 */

import { getBookmarks } from './storage.js';

// Storage key for bookmarks
const BOOKMARKS_KEY = 'bookmarkos_bookmarks';

/**
 * Bulk import bookmarks
 * @param {Array} bookmarks - Array of bookmarks to import
 * @returns {Promise<number>} Number of bookmarks imported
 */
export async function importBookmarks(bookmarks) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get existing bookmarks
      const existingBookmarks = await getBookmarks();
      
      // Create a set of existing URLs to check for duplicates
      const existingUrls = new Set(existingBookmarks.map(b => b.url));
      
      // Filter out duplicates
      const newBookmarks = bookmarks.filter(b => !existingUrls.has(b.url));
      
      // Combine bookmarks (new ones first)
      const combinedBookmarks = [...newBookmarks, ...existingBookmarks];
      
      // Save to localStorage
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(combinedBookmarks));
      
      resolve(newBookmarks.length);
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      reject(error);
    }
  });
}

/**
 * Export bookmarks to JSON
 * @returns {Promise<string>} JSON string of bookmarks
 */
export async function exportBookmarksToJson() {
  return new Promise(async (resolve, reject) => {
    try {
      const bookmarks = await getBookmarks();
      resolve(JSON.stringify({
        bookmarks,
        meta: {
          exportDate: new Date().toISOString(),
          version: '1.0',
          count: bookmarks.length
        }
      }, null, 2));
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      reject(error);
    }
  });
}

/**
 * Import bookmarks from JSON string
 * @param {string} jsonString - JSON string to import
 * @returns {Promise<number>} Number of bookmarks imported
 */
export async function importBookmarksFromJson(jsonString) {
  return new Promise(async (resolve, reject) => {
    try {
      // Parse JSON
      const data = JSON.parse(jsonString);
      
      // Validate structure
      if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
        reject(new Error('Invalid bookmark JSON format'));
        return;
      }
      
      // Import bookmarks
      const importCount = await importBookmarks(data.bookmarks);
      resolve(importCount);
    } catch (error) {
      console.error('Error importing bookmarks from JSON:', error);
      reject(error);
    }
  });
}

/**
 * Export bookmarks to Markdown
 * @param {Array} [bookmarks] - Optional array of bookmarks to export 
 * @returns {Promise<string>} Markdown string containing exported bookmarks
 */
export async function exportBookmarksToMarkdown(bookmarks) {
  try {
    // Get all bookmarks if not provided
    if (!bookmarks) {
      bookmarks = await getBookmarks();
    }
    
    // Generate markdown content
    let markdown = `# Bookmark OS Export\n\n`;
    markdown += `*Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*\n\n`;
    
    // Add each bookmark
    for (const bookmark of bookmarks) {
      // Bookmark title and URL
      markdown += `## [${bookmark.title}](${bookmark.url})\n\n`;
      
      // Tags
      if (bookmark.tags && bookmark.tags.length > 0) {
        markdown += `**Tags:** ${bookmark.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`;
      }
      
      // Notes
      if (bookmark.notes) {
        markdown += `**Notes:**\n\n${bookmark.notes}\n\n`;
      }
      
      // AI Summary (if available)
      if (bookmark.aiSummary) {
        markdown += `**AI Summary:**\n\n> ${bookmark.aiSummary}\n\n`;
      }
      
      // Metadata
      markdown += `**Added:** ${new Date(bookmark.createdAt).toLocaleString()}\n`;
      markdown += `**Source:** ${bookmark.source}\n`;
      markdown += `**Status:** ${bookmark.isRead ? 'Read' : 'Unread'}\n\n`;
      
      // Separator between bookmarks
      markdown += `---\n\n`;
    }
    
    return markdown;
  } catch (error) {
    console.error('Error exporting to Markdown:', error);
    throw error;
  }
}

/**
 * Clear all bookmark data
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllBookmarks() {
  return new Promise((resolve) => {
    try {
      localStorage.removeItem(BOOKMARKS_KEY);
      resolve(true);
    } catch (error) {
      console.error('Error clearing bookmark data:', error);
      resolve(false);
    }
  });
} 