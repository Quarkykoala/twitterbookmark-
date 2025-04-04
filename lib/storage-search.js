/**
 * Storage Search Module
 * Handles searching and filtering of bookmark data
 */

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
 * Filter bookmarks by preset filters (all, unread, today)
 * @param {Array} bookmarks - Array of bookmarks to filter
 * @param {string} filter - Filter to apply ('all', 'unread', 'today')
 * @returns {Array} Filtered bookmarks
 */
export function filterBookmarks(bookmarks, filter) {
  if (filter === 'all') {
    return bookmarks;
  } else if (filter === 'unread') {
    return bookmarks.filter(bookmark => !bookmark.isRead);
  } else if (filter === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookmarks.filter(bookmark => {
      const bookmarkDate = new Date(bookmark.createdAt);
      return bookmarkDate >= today;
    });
  }
  
  return bookmarks;
}

/**
 * Sort bookmarks by various criteria
 * @param {Array} bookmarks - Array of bookmarks to sort
 * @param {string} sortBy - Field to sort by ('date', 'title', 'source')
 * @param {boolean} ascending - Sort direction
 * @returns {Array} Sorted bookmarks
 */
export function sortBookmarks(bookmarks, sortBy = 'date', ascending = false) {
  const sortedBookmarks = [...bookmarks];
  
  switch (sortBy) {
    case 'date':
      sortedBookmarks.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return ascending ? dateA - dateB : dateB - dateA;
      });
      break;
      
    case 'title':
      sortedBookmarks.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return ascending 
          ? titleA.localeCompare(titleB) 
          : titleB.localeCompare(titleA);
      });
      break;
      
    case 'source':
      sortedBookmarks.sort((a, b) => {
        const sourceA = a.source;
        const sourceB = b.source;
        return ascending 
          ? sourceA.localeCompare(sourceB) 
          : sourceB.localeCompare(sourceA);
      });
      break;
      
    default:
      // Default to date sort
      sortedBookmarks.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return ascending ? dateA - dateB : dateB - dateA;
      });
  }
  
  return sortedBookmarks;
} 