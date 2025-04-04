/**
 * AI Summary Module
 * Handles GPT-3.5 summarization for premium users
 * 
 * ⬇️ PREMIUM START
 * This file contains premium-only functionality
 * ⬆️ PREMIUM END
 */

import { isPremiumUser } from './storage.js';

// API configuration
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Generate a summary for a tweet or thread
 * @param {string} tweetContent - The content to summarize
 * @param {string} [apiKey] - User's OpenAI API key
 * @returns {Promise<string|null>} The generated summary or null if not available
 */
export async function generateSummary(tweetContent, apiKey) {
  // ⬇️ PREMIUM START
  try {
    // Check if user is premium
    const isPremium = await isPremiumUser();
    if (!isPremium) {
      console.warn('AI summary is a premium feature');
      return null;
    }
    
    // Check if there's sufficient content to summarize
    if (!tweetContent || tweetContent.length < 50) {
      return 'Tweet is too short to summarize';
    }
    
    // Validate API key (in a real app, this would be handled securely)
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    // Call OpenAI API with retries
    return await callOpenAIWithRetries(tweetContent, apiKey);
  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
  // ⬆️ PREMIUM END
}

/**
 * Call OpenAI API with automatic retries
 * @param {string} tweetContent - The content to summarize
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} Generated summary
 */
async function callOpenAIWithRetries(tweetContent, apiKey) {
  // ⬇️ PREMIUM START
  let retries = 0;
  let lastError = null;
  
  while (retries < MAX_RETRIES) {
    try {
      return await callOpenAI(tweetContent, apiKey);
    } catch (error) {
      lastError = error;
      retries++;
      
      // Wait before retry (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, retries - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Failed to generate summary after retries');
  // ⬆️ PREMIUM END
}

/**
 * Call OpenAI API to generate a summary
 * @param {string} tweetContent - The content to summarize
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} Generated summary
 */
async function callOpenAI(tweetContent, apiKey) {
  // ⬇️ PREMIUM START
  // Check if we're online
  if (!navigator.onLine) {
    throw new Error('Cannot generate summary while offline');
  }
  
  const prompt = `Please summarize the following tweet/thread concisely in 1-2 sentences: "${tweetContent}"`;
  
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes tweets and threads concisely.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.5
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || 'Unknown error'}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content.trim();
  // ⬆️ PREMIUM END
}

/**
 * Check if API key is valid
 * @param {string} apiKey - OpenAI API key to validate
 * @returns {Promise<boolean>} Whether the API key is valid
 */
export async function validateApiKey(apiKey) {
  // ⬇️ PREMIUM START
  try {
    // Simple test request to validate key
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
  // ⬆️ PREMIUM END
} 