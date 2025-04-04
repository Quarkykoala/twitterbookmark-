/**
 * Export Module
 * Handles exporting bookmarks to various formats
 */

import { getBookmarks, isPremiumUser } from './storage.js';
import { exportBookmarksToMarkdown } from './storage-import-export.js';

/**
 * Export bookmarks to Markdown format
 * 
 * @param {Array} [bookmarks] - Optional array of bookmarks to export 
 *                            If not provided, all bookmarks will be exported
 * @returns {Promise<string>} Markdown string containing exported bookmarks
 */
export async function exportToMarkdown(bookmarks) {
  // ⬇️ PREMIUM START
  try {
    // Check if user is premium
    const isPremium = await isPremiumUser();
    if (!isPremium) {
      throw new Error('Export to Markdown is a premium feature');
    }
    
    return await exportBookmarksToMarkdown(bookmarks);
  } catch (error) {
    console.error('Error exporting to Markdown:', error);
    throw error;
  }
  // ⬆️ PREMIUM END
}

/**
 * Download bookmarks as a file
 * 
 * @param {string} content - Content to download
 * @param {string} filename - Filename for the download
 * @param {string} type - MIME type of the file
 */
export function downloadFile(content, filename, type = 'text/markdown') {
  // Create blob
  const blob = new Blob([content], { type });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

/**
 * Copy content to clipboard
 * 
 * @param {string} content - Content to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(content) {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    
    // Fallback method
    try {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (fallbackError) {
      console.error('Clipboard fallback failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Export bookmarks to JSON format
 * 
 * @param {Array} [bookmarks] - Optional array of bookmarks to export
 * @returns {Promise<string>} JSON string containing exported bookmarks
 */
export async function exportToJson(bookmarks) {
  // ⬇️ PREMIUM START
  try {
    // Check if user is premium
    const isPremium = await isPremiumUser();
    if (!isPremium) {
      throw new Error('Export to JSON is a premium feature');
    }
    
    // Get all bookmarks if not provided
    if (!bookmarks) {
      bookmarks = await getBookmarks();
    }
    
    // Convert to JSON with pretty formatting
    return JSON.stringify({
      bookmarks,
      meta: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        count: bookmarks.length
      }
    }, null, 2);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw error;
  }
  // ⬆️ PREMIUM END
} 