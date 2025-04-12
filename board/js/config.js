/**
 * config.js - Configuration for the Bulletin Board application
 * Contains Supabase connection details and other app settings
 */

// Supabase configuration
const SUPABASE_URL = 'https://your-supabase-project-url.supabase.co';
const SUPABASE_KEY = 'your-supabase-anon-key';

// Canvas dimensions
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1500;

// Animation settings
const ANIMATION_DURATION = 300; // ms
const TRANSITION_SPEED = '0.3s';

// Expose configuration to window
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_KEY = SUPABASE_KEY;
window.CANVAS_WIDTH = CANVAS_WIDTH;
window.CANVAS_HEIGHT = CANVAS_HEIGHT;
window.ANIMATION_DURATION = ANIMATION_DURATION;
window.TRANSITION_SPEED = TRANSITION_SPEED;