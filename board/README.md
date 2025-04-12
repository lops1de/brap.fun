# Bulletin Board Web App

A simple, clean, and intuitive bulletin board web application where users can create text and drawing notes on a large, draggable canvas.

## Features

- **Large Canvas**: 2000px × 1500px canvas that can be zoomed and dragged
- **Text Notes**: Create text notes with different fonts, weights, and colors
- **Drawing Notes**: Create drawings with pen and eraser tools
- **Intuitive UI**: Clean, Nintendo Wii-like interface with smooth animations
- **Real-time Updates**: Notes are shared and updated in real-time
- **Anonymous Posting**: No login required

## Technical Details

- **Pure Vanilla**: Built with HTML5, CSS3, and vanilla JavaScript (no frameworks)
- **Backend**: Uses Supabase for storage and real-time updates
- **Performance**: Optimized for smooth performance, even with many notes
- **Responsive**: Works on desktop browsers (best on Chrome, Firefox, Safari)

## Getting Started

1. Clone this repository
2. Open `index.html` in a web browser
3. Start adding notes to the board!

## Structure

- `index.html` - Main entry point
- `css/styles.css` - Styling for the entire application
- `js/main.js` - Main application logic and initialization
- `js/canvas.js` - Canvas handling, zooming, and dragging
- `js/notes.js` - Note creation and management
- `js/drawing.js` - Drawing tools and interfaces
- `js/config.js` - Configuration settings for Supabase

## Usage

- **Navigate**: Drag to move around the canvas, use mouse wheel to zoom
- **Add Notes**: Right-click anywhere to open the context menu
- **Text Notes**: Click on "Text Note" in the context menu to add a text note
- **Drawing Notes**: Click on "Draw Note" in the context menu to open the drawing interface
- **Edit Notes**: Click on any existing note to edit it

## License

MIT 