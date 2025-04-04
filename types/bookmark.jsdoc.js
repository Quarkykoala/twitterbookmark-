/**
 * @typedef {Object} Bookmark
 * @property {string} id - Unique identifier for the bookmark
 * @property {string} url - URL of the bookmarked content
 * @property {string} title - Title of the bookmark
 * @property {string[]} tags - Array of tags associated with the bookmark
 * @property {string} notes - User notes about the bookmark
 * @property {string} createdAt - ISO date string of when the bookmark was created
 * @property {boolean} isRead - Whether the bookmark has been read
 * @property {'manual' | 'twitter' | 'contextMenu'} source - Source of the bookmark
 * @property {string|null} aiSummary - AI-generated summary (premium feature)
 * @property {Object} [metadata] - Additional metadata about the bookmark
 * @property {string} [metadata.authorName] - Author name for Twitter bookmarks
 * @property {string} [metadata.tweetContent] - Full content of the tweet
 * @property {string} [metadata.tweetDate] - Original date of the tweet
 * @property {boolean} [metadata.isThread] - Whether this is part of a thread
 */

/**
 * @typedef {Object} Settings
 * @property {boolean} darkMode - Whether dark mode is enabled
 * @property {'all' | 'unread' | 'today'} defaultFilter - Default filter for bookmarks
 * @property {boolean} isPremium - Whether user has premium features
 * @property {string|null} lastSyncDate - ISO date string of last Twitter sync
 */

// Export for ESM modules
export {}; 