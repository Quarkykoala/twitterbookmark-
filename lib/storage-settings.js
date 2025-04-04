/**
 * Storage Settings Module
 * Handles user settings and preferences
 */

import { SETTINGS_KEY } from './storage-core.js';

/**
 * Get user settings from storage
 * @returns {Promise<Object>} User settings object
 */
export async function getUserSettings() {
  return new Promise((resolve) => {
    try {
      const settingsJson = localStorage.getItem(SETTINGS_KEY);
      const settings = settingsJson ? JSON.parse(settingsJson) : getDefaultSettings();
      resolve(settings);
    } catch (error) {
      console.error('Error getting settings:', error);
      resolve(getDefaultSettings());
    }
  });
}

/**
 * Save user settings to storage
 * @param {Object} settings - Settings object to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveUserSettings(settings) {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      resolve(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      reject(error);
    }
  });
}

/**
 * Get default user settings
 * @returns {Object} Default settings object
 */
export function getDefaultSettings() {
  return {
    darkMode: false,
    defaultFilter: 'all',
    isPremium: false,
    lastSyncDate: null
  };
}

/**
 * Check if user is premium
 * @returns {Promise<boolean>} Premium status
 */
export async function isPremiumUser() {
  const settings = await getUserSettings();
  return settings.isPremium === true;
}

/**
 * Update a single setting
 * @param {string} key - Setting key to update
 * @param {any} value - New value
 * @returns {Promise<boolean>} Success status
 */
export async function updateSetting(key, value) {
  try {
    const settings = await getUserSettings();
    settings[key] = value;
    return await saveUserSettings(settings);
  } catch (error) {
    console.error('Error updating setting:', error);
    return false;
  }
}

/**
 * Clear all app data (for testing/reset)
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllData() {
  return new Promise((resolve) => {
    try {
      localStorage.removeItem(SETTINGS_KEY);
      resolve(true);
    } catch (error) {
      console.error('Error clearing settings data:', error);
      resolve(false);
    }
  });
} 