/**
 * Twitter Bookmark Scraper
 * Content script that runs on Twitter bookmark pages to extract bookmarks
 */

// Initialize message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scrapeBookmarks') {
    scrapeTwitterBookmarks()
      .then(bookmarks => {
        sendResponse({ success: true, count: bookmarks.length });
      })
      .catch(error => {
        console.error('Error scraping bookmarks:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Main scraping function
async function scrapeTwitterBookmarks() {
  // First, check if we're on the Twitter bookmarks page
  if (!window.location.href.includes('twitter.com/i/bookmarks')) {
    throw new Error('Not on Twitter bookmarks page');
  }
  
  // Wait for bookmarks to load
  await waitForElements('article');
  
  // Get all bookmark tweets
  const tweetElements = Array.from(document.querySelectorAll('article'));
  
  if (tweetElements.length === 0) {
    throw new Error('No bookmarks found on the page');
  }
  
  // Process each tweet
  const bookmarks = [];
  
  for (const tweetEl of tweetElements) {
    try {
      const bookmark = await processTweet(tweetEl);
      if (bookmark) {
        bookmarks.push(bookmark);
      }
    } catch (error) {
      console.error('Error processing tweet:', error);
      // Continue with next tweet
    }
  }
  
  // Save bookmarks to storage
  if (bookmarks.length > 0) {
    await saveTweetBookmarks(bookmarks);
  }
  
  return bookmarks;
}

// Process a single tweet element
async function processTweet(tweetEl) {
  // Extract tweet URL
  const linkEl = tweetEl.querySelector('a[href*="/status/"]');
  if (!linkEl) return null;
  
  const tweetUrl = new URL(linkEl.href).href;
  
  // Extract tweet text
  const textEl = tweetEl.querySelector('[data-testid="tweetText"]');
  const tweetText = textEl ? textEl.textContent.trim() : '';
  
  // Extract author info
  const authorEl = tweetEl.querySelector('[data-testid="User-Name"]');
  const authorName = authorEl ? authorEl.textContent.split('@')[0].trim() : 'Twitter User';
  
  // Extract timestamp
  const timeEl = tweetEl.querySelector('time');
  const timestamp = timeEl ? timeEl.getAttribute('datetime') : new Date().toISOString();
  
  // Create bookmark object
  const bookmark = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    url: tweetUrl,
    title: `${authorName}: ${tweetText.substring(0, 60)}${tweetText.length > 60 ? '...' : ''}`,
    tags: ['twitter'],
    notes: '',
    createdAt: new Date().toISOString(),
    isRead: false,
    source: 'twitter',
    aiSummary: null,
    metadata: {
      authorName,
      tweetContent: tweetText,
      tweetDate: timestamp,
      isThread: false // This would need additional logic to detect threads
    }
  };
  
  return bookmark;
}

// Save scraped bookmarks
async function saveTweetBookmarks(bookmarks) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'saveScrapedBookmarks',
        bookmarks
      },
      response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      }
    );
  });
}

// Helper: Wait for elements to be available in DOM
function waitForElements(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElements = () => {
      const elements = document.querySelectorAll(selector);
      
      if (elements.length > 0) {
        resolve(elements);
        return;
      }
      
      const elapsed = Date.now() - startTime;
      
      if (elapsed > timeout) {
        reject(new Error(`Timeout waiting for elements: ${selector}`));
        return;
      }
      
      // Check again in 500ms
      setTimeout(checkElements, 500);
    };
    
    checkElements();
  });
}

// Helper: Detect if we're at the bottom of the page to handle infinite scroll
function isAtBottom() {
  return window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
}

// Scroll down to load more tweets if needed
async function scrollForMoreTweets(attempts = 3) {
  let prevCount = 0;
  
  for (let i = 0; i < attempts; i++) {
    const tweets = document.querySelectorAll('article');
    const currentCount = tweets.length;
    
    if (currentCount === prevCount) {
      // No new tweets loaded, we're probably at the end
      break;
    }
    
    prevCount = currentCount;
    
    // Scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);
    
    // Wait for new content to load
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}
