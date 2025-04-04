import { renderBookmarkList, handleFilterChange } from '../components/BookmarkList.js';
import { openModal, closeModal, cleanup as cleanupModals } from '../components/Modal.js';
import { saveBookmark, getBookmarks, searchBookmarks, getUserSettings, saveDarkModePreference } from '../lib/storage.js';

// Diagnostic Logging
console.log('--- POPUP SCRIPT START ---', new Date().toISOString());
console.log('Scripts present:', Array.from(document.scripts).map(s => s.src || 'inline script'));

// State management
let currentFilter = 'all';
let bookmarks = [];

// Initialize the app
async function initializeApp() {
  console.log('--- INITIALIZING APP ---');
  console.log('Checking DOM elements needed for listeners:');
  console.log('Document ready state:', document.readyState);
  console.log('Actual HTML loaded:', document.documentElement.outerHTML.substring(0, 500) + '...');
  
  try {
    // Initialize theme before anything else
    await initTheme();
    
    // Check critical DOM elements
    console.log('Critical DOM elements check:');
    console.log('#addBookmarkForm exists?', !!document.getElementById('addBookmarkForm'));
    console.log('#bookmarkForm exists?', !!document.getElementById('bookmarkForm'));
    console.log('#searchInput exists?', !!document.getElementById('searchInput'));
    console.log('#filterButtons exists?', !!document.getElementById('filterButtons'));
    console.log('#addBookmarkBtn exists?', !!document.getElementById('addBookmarkBtn'));
    console.log('#themeToggleBtn exists?', !!document.getElementById('themeToggleBtn'));
    console.log('[data-close-modal] count:', document.querySelectorAll('[data-close-modal]').length);
    
    // Load bookmarks
    bookmarks = await getBookmarks();
    console.log('Bookmarks loaded:', bookmarks.length);
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial render
    await updateBookmarkList();
    
    // Update filter buttons
    updateFilterButtons(currentFilter);
  } catch (error) {
    console.error('Error initializing app:', error);
    showToast('Error loading bookmarks', 'error');
  }
}

// Initialize theme based on stored preference or system preference
async function initTheme() {
  try {
    const settings = await getUserSettings();
    applyTheme(settings.darkMode);
    console.log('Applied theme from settings:', settings.darkMode ? 'dark' : 'light');
  } catch (error) {
    console.error('Error initializing theme:', error);
    // Fallback to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
    console.log('Applied system theme preference (fallback):', prefersDark ? 'dark' : 'light');
  }
}

// Apply the selected theme
function applyTheme(isDarkMode) {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Update the theme icons visibility
  updateThemeIcons(isDarkMode);
}

// Toggle between light and dark mode
function toggleTheme() {
  const isDarkMode = document.documentElement.classList.toggle('dark');
  saveDarkModePreference(isDarkMode);
  
  // Update the theme icons
  updateThemeIcons(isDarkMode);
  
  console.log('Theme toggled to:', isDarkMode ? 'dark' : 'light');
}

// Update visibility of theme icons based on current mode
function updateThemeIcons(isDarkMode) {
  const lightIcon = document.getElementById('themeIconLight');
  const darkIcon = document.getElementById('themeIconDark');
  
  if (lightIcon && darkIcon) {
    if (isDarkMode) {
      lightIcon.classList.add('hidden');
      darkIcon.classList.remove('hidden');
    } else {
      lightIcon.classList.remove('hidden');
      darkIcon.classList.add('hidden');
    }
  }
}

// Set up event listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  console.log('Document readyState:', document.readyState);
  
  // Theme toggle button
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    console.log('Found themeToggleBtn, attaching click handler');
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  
  // Add bookmark form
  const bookmarkForm = document.getElementById('bookmarkForm');
  console.log('Found bookmarkForm:', bookmarkForm);
  if (bookmarkForm) {
    console.log('Adding submit listener to form');
    bookmarkForm.addEventListener('submit', (e) => {
      console.log('Raw form submit event triggered');
      handleAddBookmark(e);
    });
    
    // Add validation listeners
    Array.from(bookmarkForm.elements).forEach(element => {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.addEventListener('input', () => {
          console.log(`Input changed: ${element.name}=${element.value}`);
          console.log('Element validity:', element.validity);
        });
      }
    });
  } else {
    console.error('Bookmark form not found in DOM');
  }

  // Search input
  const searchInput = document.getElementById('searchInput');
  console.log('Found searchInput?', !!searchInput);
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
  
  // Filter buttons
  const filterContainer = document.getElementById('filterButtons');
  console.log('Found filterButtons container?', !!filterContainer);
  if (filterContainer) {
    filterContainer.addEventListener('click', handleFilterClick);
  }

  // Add bookmark button
  const addBtn = document.getElementById('addBookmarkBtn');
  console.log('Found addBookmarkBtn?', !!addBtn);
  if (addBtn) {
    addBtn.addEventListener('click', () => openModal('addBookmarkModal'));
  }

  // Close modal buttons
  const closeModalBtns = document.querySelectorAll('[data-close-modal]');
  console.log('Found close modal buttons:', closeModalBtns.length);
  closeModalBtns.forEach(btn => {
    const modalId = btn.dataset.closeModal;
    if (modalId) {
      btn.addEventListener('click', () => closeModal(modalId));
    }
  });
}

// Handle adding a new bookmark
async function handleAddBookmark(e) {
  console.log('Form submission event:', e);
  console.log('Form submission target:', e.target);
  console.log('Form submission currentTarget:', e.currentTarget);
  
  e.preventDefault();
  e.stopPropagation(); // Prevent any potential event bubbling issues

  const form = e.target;
  console.log('Form element:', form);
  console.log('Form validity:', form.checkValidity());
  console.log('Form elements:', Array.from(form.elements).map(el => ({
    id: el.id,
    name: el.name,
    value: el.value,
    validity: el.validity?.valid
  })));

  const url = form.url?.value?.trim();
  const title = form.title?.value?.trim();
  const notes = form.notes?.value?.trim();
  const tags = form.tags?.value?.split(',').map(tag => tag.trim()).filter(Boolean) || [];

  console.log('Parsed form values:', { url, title, notes, tags });

  if (!url || !title) {
    console.log('Validation failed - missing required fields');
    showToast('URL and title are required', 'error');
    return;
  }

  try {
    const newBookmark = {
    id: Date.now().toString(),
    url,
    title,
      notes,
    tags,
    createdAt: new Date().toISOString(),
      isRead: false
    };

    console.log('Created bookmark object:', newBookmark);
    console.log('Attempting to save bookmark...');
    
    await saveBookmark(newBookmark);
    console.log('Bookmark saved successfully');
    
    bookmarks.unshift(newBookmark);
    console.log('Bookmark added to local state, current bookmarks:', bookmarks);
    
    await updateBookmarkList();
    console.log('Bookmark list updated');
    
    closeModal('addBookmarkModal');
    form.reset();
    
    showToast('Bookmark added successfully');
  } catch (error) {
    console.error('Detailed error adding bookmark:', {
      error,
      errorMessage: error.message,
      errorStack: error.stack
    });
    showToast('Error adding bookmark', 'error');
  }
}

// Handle search input
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const inTitle = bookmark.title.toLowerCase().includes(searchTerm);
    const inNotes = bookmark.notes?.toLowerCase().includes(searchTerm);
    const inTags = bookmark.tags?.some(tag => 
      tag.toLowerCase().includes(searchTerm)
    );
    return inTitle || inNotes || inTags;
  });

  const container = document.getElementById('bookmarkList');
  if (container) {
    renderBookmarkList(filteredBookmarks, container);
  }
}

// Handle filter button clicks
function handleFilterClick(e) {
  const filterBtn = e.target.closest('[data-filter]');
  if (!filterBtn) return;

  const newFilter = filterBtn.dataset.filter;
  if (newFilter === currentFilter) return;

  currentFilter = newFilter;
  updateFilterButtons(currentFilter);
  updateBookmarkList();
}

// Update filter button states
function updateFilterButtons(activeFilter) {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    const isActive = btn.dataset.filter === activeFilter;
    btn.classList.toggle('filter-btn-active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

// Update bookmark list
async function updateBookmarkList() {
  const container = document.getElementById('bookmarkList');
  if (!container) return;

  try {
    const filtered = handleFilterChange(bookmarks, currentFilter);
    renderBookmarkList(filtered, container);
  } catch (error) {
    console.error('Error updating bookmark list:', error);
    showToast('Error updating bookmarks', 'error');
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Debounce helper
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Clean up on unload
window.addEventListener('unload', () => {
  cleanupModals();
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Add modal diagnostic logging function
function logModalDimensions() {
  console.log('--- MODAL DIMENSIONS DIAGNOSTICS ---');
  const modal = document.getElementById('addBookmarkModal');
  const modalContainer = modal?.querySelector('.bg-white');
  const formElement = document.getElementById('bookmarkForm');
  const contentArea = formElement?.querySelector('.overflow-y-auto');
  const buttonArea = formElement?.querySelector('.border-t');
  
  if (modal) {
    const modalRect = modal.getBoundingClientRect();
    console.log('Modal outer container:', {
      height: modalRect.height,
      width: modalRect.width,
      top: modalRect.top,
      bottom: modalRect.bottom,
      visible: getComputedStyle(modal).display !== 'none'
    });
  }
  
  if (modalContainer) {
    const containerRect = modalContainer.getBoundingClientRect();
    console.log('Modal white container:', {
      height: containerRect.height,
      width: containerRect.width,
      top: containerRect.top,
      bottom: containerRect.bottom,
      maxHeight: getComputedStyle(modalContainer).maxHeight,
      overflowY: getComputedStyle(modalContainer).overflowY
    });
  }
  
  if (formElement) {
    const formRect = formElement.getBoundingClientRect();
    console.log('Form element:', {
      height: formRect.height,
      width: formRect.width,
      top: formRect.top,
      bottom: formRect.bottom,
      display: getComputedStyle(formElement).display,
      overflow: getComputedStyle(formElement).overflow
    });
  }
  
  if (contentArea) {
    const contentRect = contentArea.getBoundingClientRect();
    console.log('Content area:', {
      height: contentRect.height,
      width: contentRect.width,
      scrollHeight: contentArea.scrollHeight,
      clientHeight: contentArea.clientHeight,
      overflowY: getComputedStyle(contentArea).overflowY
    });
  }
  
  if (buttonArea) {
    const buttonRect = buttonArea.getBoundingClientRect();
    console.log('Button area:', {
      height: buttonRect.height,
      width: buttonRect.width,
      top: buttonRect.top,
      bottom: buttonRect.bottom,
      position: getComputedStyle(buttonArea).position,
      zIndex: getComputedStyle(buttonArea).zIndex
    });
    
    // Check visibility relative to viewport
    const viewportHeight = window.innerHeight;
    console.log('Viewport height:', viewportHeight);
    console.log('Button area visible in viewport?', 
      buttonRect.top >= 0 && buttonRect.bottom <= viewportHeight);
  }
}

// Modify the openModal call to log dimensions
document.getElementById('addBookmarkBtn')?.addEventListener('click', () => {
  openModal('addBookmarkModal');
  
  // Wait for modal to be fully rendered
  setTimeout(logModalDimensions, 100);
  
  // Log again after a longer delay in case of animations
  setTimeout(logModalDimensions, 500);
  
  // Add resize listener for the modal
  window.addEventListener('resize', logModalDimensions, { once: true });
}); 