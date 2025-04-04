# Bookmark OS

Transform Twitter bookmarks into a searchable, organized second brain with AI summarization.

## Features

- **Manual Bookmark Addition**: Add bookmarks with title, URL, tags, and notes
- **Search & Filter**: Find bookmarks by text or use predefined filters (All, Unread, Random)
- **Dark Mode**: Toggle between light and dark themes based on preference
- **Responsive UI**: Clean and minimalist interface optimized for the Chrome extension popup
- **Premium Features** (coming soon):
  - AI Summarization: Automatically generate summaries of Twitter threads
  - Export as Markdown: Save your bookmarks locally
  - Digest Reminders: Get periodic reminders of your unread bookmarks

## Installation

### Development Mode

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/bookmark-os.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in the top right)

4. Click "Load unpacked" and select the project directory

5. Pin the extension to your toolbar for easy access

### From Chrome Web Store (Coming Soon)

Once published, you'll be able to install directly from the Chrome Web Store.

## Usage

### Adding Bookmarks

1. Click the Bookmark OS icon in your toolbar
2. Click the "+" button in the bottom right
3. Enter the URL, title, and optional tags/notes
4. Click "Save Bookmark"

### Searching & Filtering

- Type in the search bar to find bookmarks by title, URL, tags, or notes
- Use the filter buttons at the bottom to switch between views:
  - All: Show all bookmarks
  - Unread: Show only unread bookmarks
  - Random: Show a random selection of bookmarks

### Dark Mode

- Click the sun/moon icon in the top right to toggle between light and dark modes
- Your preference is saved for future sessions

## Documentation

For more detailed information on specific features, check the docs directory:

- [Dark Mode Implementation](docs/dark_mode.md)

## Project Structure

```
bookmark-os/
├── popup/               # Extension popup UI
│   ├── index.html       # Main popup HTML
│   ├── script.js        # Popup logic
│   └── styles.css       # Styles
├── components/          # Reusable UI components
│   ├── BookmarkList.js  # Bookmark list rendering
│   └── Modal.js         # Modal dialog component
├── lib/                 # Core functionality
│   ├── storage.js       # Data storage and retrieval
│   ├── export.js        # Bookmark export functionality
│   └── aiSummary.js     # AI summarization (premium)
├── background.js        # Background service worker
├── content-scripts/     # Twitter integration
│   └── twitter-scraper.js # Scrapes bookmarks from Twitter
├── manifest.json        # Extension manifest
└── assets/              # Icons and images
```

## Development

### Prerequisites

- Modern web browser (Chrome, Edge, or other Chromium-based browser)
- Basic understanding of HTML, CSS, and JavaScript

### Code Style

- ES6 modules for code organization
- Tailwind CSS for styling
- JSDoc for type definitions and documentation

## License

[MIT](LICENSE)

## Acknowledgements

- Icons provided by [Heroicons](https://heroicons.com/)
- Built with [TailwindCSS](https://tailwindcss.com/) 