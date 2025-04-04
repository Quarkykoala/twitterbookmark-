// Diagnostic Logging
console.log('--- BACKGROUND SCRIPT START ---', new Date().toISOString());
console.log('chrome.contextMenus API available at start?', !!chrome.contextMenus);

/**
 * Background Script
 * Handles background tasks and messaging for the extension
 */

// Initialize extension when installed or updated
chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log('onInstalled triggered:', reason);
  console.log('chrome.contextMenus API available in onInstalled?', !!chrome.contextMenus);
  
  if (reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      'bookmarkos_settings': {
        darkMode: false,
        defaultFilter: 'all',
        isPremium: false,
        lastSyncDate: null
      }
    });
    console.log('Default settings initialized');
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message.action);
  
  if (message.action === 'checkPremiumStatus') {
    // In a real implementation, this would check with the server
    // For now, we're just reading from storage
    chrome.storage.local.get('bookmarkos_settings', (result) => {
      const settings = result.bookmarkos_settings || {};
      console.log('Premium status check:', settings.isPremium);
      sendResponse({ isPremium: settings.isPremium === true });
    });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }

  // Handle other message types here
});

// Optional: Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  console.log('Setting up context menu...');
  console.log('chrome.contextMenus API available before create?', !!chrome.contextMenus);
  
  try {
    chrome.contextMenus.create({
      id: 'saveTwitterBookmark',
      title: 'Save to Bookmark OS',
      contexts: ['link'],
      documentUrlPatterns: ['https://twitter.com/*']
    });
    console.log('Context menu created successfully');
  } catch (error) {
    console.error('Error creating context menu:', error);
  }
});

// Optional: Handle context menu clicks with retry logic
console.log('Setting up onClicked listener with delay...');
setTimeout(() => {
  console.log('Inside setTimeout: chrome.contextMenus available?', !!chrome.contextMenus);
  console.log('Inside setTimeout: chrome.contextMenus.onClicked available?', !!chrome.contextMenus?.onClicked);
  
  if (chrome.contextMenus && chrome.contextMenus.onClicked) {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      console.log('Context menu clicked:', info.menuItemId);
      
      if (info.menuItemId === 'saveTwitterBookmark') {
        // Create a bookmark from the link
        const bookmark = {
          id: Date.now().toString(),
          url: info.linkUrl,
          title: 'Tweet from Twitter',  // This would be better with actual tweet text
          tags: ['twitter'],
          notes: '',
          createdAt: new Date().toISOString(),
          isRead: false,
          source: 'contextMenu',
          aiSummary: null
        };

        // Send to popup for saving
        chrome.runtime.sendMessage({
          action: 'saveBookmarkFromContextMenu',
          bookmark
        });
        console.log('Bookmark message sent to popup');
      }
    });
    console.log('onClicked listener successfully added');
  } else {
    console.error('Failed to add onClicked listener: API not available');
  }
}, 500); // Delay of 500ms 