/**
 * Modal Component
 * Handles modal dialogs with proper focus management and keyboard interactions
 */

let activeModal = null;
const modalStack = [];

// Open a modal by ID
export function openModal(modalId) {
  if (!modalId) {
    console.error('Modal ID is required');
    return;
  }

  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal with ID "${modalId}" not found`);
    return;
  }

  // Store current active modal if exists
  if (activeModal) {
    modalStack.push(activeModal);
  }

  activeModal = modal;
  modal.classList.remove('hidden');
  
  // Set up event handlers and focus management
  setupModalEventHandlers(modal, modalId);
  setupFocusTrap(modalId);

  // Prevent background scrolling
  document.body.style.overflow = 'hidden';
}

// Close a modal by ID
export function closeModal(modalId) {
  if (!modalId) {
    console.error('Modal ID is required');
    return;
  }

  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal with ID "${modalId}" not found`);
    return;
  }

  // Clean up event handlers
  cleanupModalEventHandlers(modal);
  
  modal.classList.add('hidden');
  
  // Restore previous modal if exists
  activeModal = modalStack.pop() || null;
  
  if (!activeModal) {
    // No more modals, restore scrolling
    document.body.style.overflow = '';
  } else {
    // Re-setup the previous modal
    setupModalEventHandlers(activeModal, activeModal.id);
    setupFocusTrap(activeModal.id);
  }

  // Reset any form inside the modal
  const form = modal.querySelector('form');
  if (form) {
    form.reset();
  }
}

// Set up modal event handlers
function setupModalEventHandlers(modal, modalId) {
  if (!modal || !modalId) return;

  // Clean up existing handlers first
  cleanupModalEventHandlers(modal);

  // Store handlers on the modal element for cleanup
  modal._handleOutsideClick = (e) => handleOutsideClick(e, modalId);
  modal._handleEscapeKey = (e) => handleEscapeKey(e, modalId);

  // Add event listeners
  modal.addEventListener('click', modal._handleOutsideClick);
  document.addEventListener('keydown', modal._handleEscapeKey);
}

// Clean up modal event handlers
function cleanupModalEventHandlers(modal) {
  if (!modal) return;

  // Remove stored handlers if they exist
  if (modal._handleOutsideClick) {
    modal.removeEventListener('click', modal._handleOutsideClick);
    delete modal._handleOutsideClick;
  }

  if (modal._handleEscapeKey) {
    document.removeEventListener('keydown', modal._handleEscapeKey);
    delete modal._handleEscapeKey;
  }
}

// Handle clicks outside the modal content
function handleOutsideClick(e, modalId) {
  const modalContent = e.currentTarget.querySelector('.modal-content');
  if (!modalContent) return;

  // Close if click is outside modal content
  if (!modalContent.contains(e.target)) {
    closeModal(modalId);
  }
}

// Handle escape key press
function handleEscapeKey(e, modalId) {
  if (e.key === 'Escape' && activeModal) {
    e.preventDefault();
    closeModal(modalId);
  }
}

// Set up focus trap within modal
function setupFocusTrap(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  // Store the element that had focus before opening the modal
  modal._previousFocus = document.activeElement;

  // Focus the first focusable element
  firstFocusable.focus();

  // Set up the focus trap
  modal._handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  modal.addEventListener('keydown', modal._handleTabKey);
}

// Clean up focus trap
function cleanupFocusTrap(modal) {
  if (!modal) return;

  if (modal._handleTabKey) {
    modal.removeEventListener('keydown', modal._handleTabKey);
    delete modal._handleTabKey;
  }

  // Restore focus to the previous element
  if (modal._previousFocus && typeof modal._previousFocus.focus === 'function') {
    modal._previousFocus.focus();
    delete modal._previousFocus;
  }
}

// Export cleanup function for use when unmounting
export function cleanup() {
  // Close any open modals
  while (activeModal || modalStack.length > 0) {
    const currentModal = activeModal || modalStack.pop();
    if (currentModal && currentModal.id) {
      closeModal(currentModal.id);
    }
  }

  // Reset state
  activeModal = null;
  modalStack.length = 0;
  document.body.style.overflow = '';
} 