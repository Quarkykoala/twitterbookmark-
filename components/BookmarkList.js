/**
 * BookmarkList Component
 * Handles rendering and management of bookmark list items
 */

// Format a date to a readable string
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Get base domain from URL
function getDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch (e) {
    return url;
  }
}

// Helper function to safely create and set element attributes
function createElement(tag, attributes = {}, textContent = '') {
  const element = document.createElement(tag);
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}

// Create a single bookmark item element
export function createBookmarkItem(bookmark) {
  if (!bookmark || !bookmark.id) {
    console.error('Invalid bookmark data:', bookmark);
    return null;
  }

  const item = createElement('div', {
    class: 'bookmark-item',
    'data-id': bookmark.id,
  });

  // Title (as a link)
  const titleLink = createElement('a', {
    href: bookmark.url || '#',
    target: '_blank',
    rel: 'noopener noreferrer',
    class: 'bookmark-title',
  }, bookmark.title || 'Untitled');
  item.appendChild(titleLink);

  // URL Display with error handling
  if (bookmark.url) {
    const urlEl = createElement('span', { 
      class: 'bookmark-url dark:text-gray-400' 
    }, getDomain(bookmark.url));
    item.appendChild(urlEl);
  }

  // Description/Notes
  if (bookmark.notes?.trim()) {
    const descriptionEl = createElement('p', { 
      class: 'bookmark-description dark:text-gray-300' 
    }, bookmark.notes);
    item.appendChild(descriptionEl);
  }

  // Tags with validation
  if (Array.isArray(bookmark.tags) && bookmark.tags.length > 0) {
    const tagsContainer = createElement('div', { 
      class: 'bookmark-tags mt-2' 
    });
    
    const validTags = bookmark.tags
      .filter(tag => tag && typeof tag === 'string' && tag.trim())
      .map(tag => tag.trim());

    if (validTags.length > 0) {
      validTags.forEach(tag => {
        const tagEl = createElement('span', {
          class: 'tag dark:bg-gray-600 dark:text-gray-200'
        }, tag);
        tagsContainer.appendChild(tagEl);
      });
      item.appendChild(tagsContainer);
    }
  }

  return item;
}

// Render the entire list of bookmarks with error handling
export function renderBookmarkList(bookmarks, container) {
  if (!container) {
    console.error('Invalid container element for bookmark list');
    return;
  }

  container.innerHTML = '';
  
  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    const emptyState = createElement('div', {
      class: 'empty-state',
      id: 'emptyState'
    });
    container.appendChild(emptyState);
    return;
  }
  
  const fragment = document.createDocumentFragment();
  bookmarks.forEach(bookmark => {
    const bookmarkEl = createBookmarkItem(bookmark);
    if (bookmarkEl) {
      fragment.appendChild(bookmarkEl);
    }
  });

  container.appendChild(fragment);

  // Set up event delegation for the container
  setupBookmarkListeners(container);
}

// Set up event delegation for bookmark actions
function setupBookmarkListeners(container) {
  if (!container) return;

  // Remove any existing listeners
  container.removeEventListener('click', handleBookmarkClick);
  
  // Add new click listener for delegation
  container.addEventListener('click', handleBookmarkClick);
}

// Handle delegated click events
async function handleBookmarkClick(e) {
  const bookmarkItem = e.target.closest('.bookmark-item');
  if (!bookmarkItem) return;

  const bookmarkId = bookmarkItem.dataset.id;
  if (!bookmarkId) return;

  // Handle read toggle
  if (e.target.matches('.read-toggle')) {
    e.preventDefault();
    await toggleReadStatus(bookmarkId);
  }
  
  // Handle delete
  if (e.target.matches('.delete-btn')) {
    e.preventDefault();
    await deleteBookmark(bookmarkId);
  }
}

// Filter bookmarks based on selected filter
export function handleFilterChange(bookmarks, filter) {
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

// Toggle bookmark read status with error handling
async function toggleReadStatus(id) {
  if (!id) {
    console.error('Invalid bookmark ID for toggle');
    return;
  }

  try {
    const { getBookmarks, updateBookmark } = await import('../lib/storage.js');
    const bookmarks = await getBookmarks();
    
    const bookmarkIndex = bookmarks.findIndex(b => b.id === id);
    if (bookmarkIndex === -1) {
      console.error('Bookmark not found:', id);
      return;
    }
    
    const updatedBookmark = {
      ...bookmarks[bookmarkIndex],
      isRead: !bookmarks[bookmarkIndex].isRead
    };
    
    await updateBookmark(updatedBookmark);
    
    const bookmarkEl = document.querySelector(`.bookmark-item[data-id="${id}"]`);
    if (bookmarkEl) {
      const readButton = bookmarkEl.querySelector('.read-toggle');
      if (readButton) {
        readButton.textContent = updatedBookmark.isRead ? 'Read' : 'Unread';
        readButton.setAttribute('aria-pressed', updatedBookmark.isRead);
      }
    }
  } catch (error) {
    console.error('Error toggling read status:', error);
    throw error; // Re-throw to handle in the caller
  }
}

// Delete a bookmark with error handling
async function deleteBookmark(id) {
  if (!id) {
    console.error('Invalid bookmark ID for deletion');
    return;
  }
  
  try {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    const { deleteBookmark: removeBookmark } = await import('../lib/storage.js');
    await removeBookmark(id);
    
    const bookmarkEl = document.querySelector(`.bookmark-item[data-id="${id}"]`);
    if (bookmarkEl) {
      bookmarkEl.classList.add('opacity-0');
      setTimeout(() => {
        bookmarkEl.remove();
        checkEmptyState();
      }, 300);
    }
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    throw error; // Re-throw to handle in the caller
  }
}

// Check empty state
function checkEmptyState() {
  const container = document.getElementById('bookmarkList');
  const emptyState = document.getElementById('emptyState');
  
  if (!container) return;
  
  const hasBookmarks = container.querySelector('.bookmark-item');
      if (emptyState) {
    emptyState.style.display = hasBookmarks ? 'none' : 'block';
  }
} 