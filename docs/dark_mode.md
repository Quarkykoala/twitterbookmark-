# Dark Mode Implementation

## Overview

The Bookmark OS extension includes a dark mode feature that allows users to switch between light and dark themes based on their preference. The implementation follows these key principles:

- System preference detection on first load
- Persistent user preference via localStorage
- Seamless theme switching with a toggle button
- Consistent styling across all components

By default, the extension will check the user's system preference and apply the appropriate theme on first load. Once the user manually toggles the theme, their preference is saved and used for subsequent sessions.

## Technical Implementation

### HTML Structure

In `popup/index.html`, the dark mode is implemented using TailwindCSS dark mode classes:

```html
<body class="font-sans bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
  <!-- Theme toggle button -->
  <button id="themeToggleBtn" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
    <svg id="themeIconLight" class="h-6 w-6 text-gray-700 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <!-- Sun icon path -->
    </svg>
    <svg id="themeIconDark" class="h-6 w-6 text-gray-300 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <!-- Moon icon path -->
    </svg>
  </button>
</body>
```

The HTML uses the `dark:` variant classes that are applied when the `dark` class is present on the `html` element.

### CSS Styles

In `popup/styles.css`, we include both light and dark mode styles:

```css
/* Base styles (light mode) */
body {
  background-color: #ffffff;
  color: #1f2937;
}

/* Dark mode styles applied when .dark class is present on html element */
.dark body {
  background-color: #1f2937;
  color: #f9fafb;
}

/* System preference media query (optional fallback) */
@media (prefers-color-scheme: dark) {
  body:not(.light) {
    background-color: #1f2937;
    color: #f9fafb;
  }
}
```

### JavaScript Logic

The dark mode functionality is implemented in `popup/script.js`:

1. **Theme Initialization**: On app load, we check the saved preference or system preference
2. **Theme Toggle**: We provide a function to toggle between light and dark modes
3. **Theme Icons**: We update the visible icon based on the current mode

```javascript
// Initialize theme based on stored preference or system preference
async function initTheme() {
  try {
    const settings = await getUserSettings();
    applyTheme(settings.darkMode);
  } catch (error) {
    // Fallback to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
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
}
```

### BookmarkList Component

In `components/BookmarkList.js`, we ensure that dynamically created elements follow the dark mode:

```javascript
function createBookmarkElement(bookmark) {
  const bookmarkEl = document.createElement('div');
  bookmarkEl.className = 'p-4 mb-3 border border-gray-200 dark:border-gray-700 rounded-lg';
  
  // ... other bookmark markup ...
  
  return bookmarkEl;
}
```

## Storage

The dark mode preference is stored using the `storage.js` module:

```javascript
// In storage.js
function getDefaultSettings() {
  return {
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    // other settings...
  };
}

export async function saveDarkModePreference(isDarkMode) {
  try {
    const settings = await getUserSettings();
    settings.darkMode = isDarkMode;
    return saveUserSettings(settings);
  } catch (error) {
    console.error('Error saving dark mode preference:', error);
    return false;
  }
}
```

## Example Usage

To check and toggle dark mode programmatically:

```javascript
import { getUserSettings, saveDarkModePreference } from '../lib/storage.js';

// Check if dark mode is enabled
async function isDarkModeEnabled() {
  const settings = await getUserSettings();
  return settings.darkMode;
}

// Toggle dark mode
async function toggleDarkMode() {
  const settings = await getUserSettings();
  const newState = !settings.darkMode;
  await saveDarkModePreference(newState);
  return newState;
}
```

## Color Palette

The dark mode implementation uses the following TailwindCSS colors:

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | bg-white | dark:bg-gray-800 |
| Text | text-gray-900 | dark:text-gray-100 |
| Borders | border-gray-200 | dark:border-gray-700 |
| Inputs | bg-white | dark:bg-gray-700 |
| Buttons | bg-gray-100 | dark:bg-gray-700 |
| Hover States | hover:bg-gray-200 | dark:hover:bg-gray-600 |

## Accessibility Considerations

The dark mode implementation ensures:

1. Sufficient contrast ratios between text and backgrounds
2. Visible focus indicators in both modes
3. Clear toggle button with accessible label
4. Smooth transitions between modes to avoid jarring changes

By implementing these techniques, the dark mode feature provides a comfortable viewing experience across different lighting conditions while maintaining accessibility and usability. 