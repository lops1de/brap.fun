/**
 * main.js - Main entry point for the bulletin board application
 * Handles app initialization, state management, and coordinates between components
 */

// Initialize global app state if it doesn't exist yet
window.appState = window.appState || {
    notes: [],
    isContextMenuOpen: false,
    contextMenuPosition: { x: 0, y: 0 },
    isEditing: false,
    currentEditingNote: null,
    lastClickX: 0,
    lastClickY: 0,
    selectedFont: 'Quicksand',
    selectedWeight: 'normal',
    selectedColor: '#000000'
};

/**
 * Initialize the application
 */
async function initApp() {
    console.log('Initializing Bulletin Board app...');
    
    // Hide loading screen
    document.querySelector('.loading').classList.add('hidden');
    
    // Initialize Supabase
    window.initSupabase();
    
    // Initialize canvas
    window.initCanvas();
    
    // Initialize notes system
    window.initNotes();
    
    // Initialize drawing system
    window.initDrawing();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load notes from Supabase
    await loadNotes();
    
    // Setup real-time subscription for note changes
    setupRealtimeSubscription();
    
    console.log('App initialized successfully');
}

/**
 * Set up event listeners for the application
 */
function setupEventListeners() {
    // Window resize handling
    window.addEventListener('resize', handleWindowResize);
    
    // Global click handler for closing context menu and note editor
    document.addEventListener('click', window.handleGlobalClick);
    
    // Global keydown handler for keyboard shortcuts
    document.addEventListener('keydown', window.handleKeyDown);
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    const canvas = document.getElementById('mainCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Re-render notes after resize
    window.renderNotes();
}

/**
 * Handle global click events
 * @param {MouseEvent} e - The click event
 */
function handleGlobalClick(e) {
    // Store last click position for context menu
    window.appState.lastClickX = e.clientX;
    window.appState.lastClickY = e.clientY;
    
    // Close context menu if open and click is outside
    if (window.appState.isContextMenuOpen) {
        const contextMenu = document.querySelector('.context-menu');
        if (contextMenu && !contextMenu.contains(e.target)) {
            closeContextMenu();
        }
    }
    
    // If editing a note and clicking outside, stop editing
    if (window.appState.isEditing) {
        const editor = document.querySelector('.note-editor');
        if (editor && !editor.contains(e.target)) {
            window.stopEditingNote();
        }
    }
}

/**
 * Handle keydown events
 * @param {KeyboardEvent} e - The keydown event
 */
function handleKeyDown(e) {
    if (e.key === 'Escape') {
        // Close context menu if open
        if (window.appState.isContextMenuOpen) {
            closeContextMenu();
        }
        
        // Close note editor if open
        if (window.appState.isEditing) {
            window.stopEditingNote();
        }
    }
}

/**
 * Open the context menu at the specified position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
function openContextMenu(x, y) {
    // Store click position
    window.appState.lastClickX = x;
    window.appState.lastClickY = y;
    
    // Create context menu if it doesn't exist
    let contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'contextMenu';
        contextMenu.className = 'context-menu';
        document.body.appendChild(contextMenu);
    }
    
    // Set context menu content
    contextMenu.innerHTML = `
        <div class="menu-item" id="addTextNote">
            <span class="menu-icon">✍️</span>
            <span class="menu-text">Text Note</span>
        </div>
        <div class="menu-item" id="addDrawingNote">
            <span class="menu-icon">✏️</span>
            <span class="menu-text">Draw Note</span>
        </div>
        <div class="menu-item" id="cancelContextMenu">
            <span class="menu-icon">❌</span>
            <span class="menu-text">Cancel</span>
        </div>
    `;
    
    // Position the context menu
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    
    // Add event listeners to menu items
    document.getElementById('addTextNote').addEventListener('click', () => {
        closeContextMenu();
        window.createTextNote(x, y);
    });
    
    document.getElementById('addDrawingNote').addEventListener('click', () => {
        closeContextMenu();
        window.startDrawingMode(x, y);
    });
    
    document.getElementById('cancelContextMenu').addEventListener('click', closeContextMenu);
    
    // Mark context menu as open
    window.appState.isContextMenuOpen = true;
    
    // Show the context menu with animation
    setTimeout(() => {
        contextMenu.classList.add('context-menu--open');
    }, 10);
}

/**
 * Open a note-specific context menu at the specified position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} note - The note object that was clicked
 */
function openNoteContextMenu(x, y, note) {
    // Store click position
    window.appState.lastClickX = x;
    window.appState.lastClickY = y;
    
    // Create context menu if it doesn't exist
    let contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'contextMenu';
        contextMenu.className = 'context-menu';
        document.body.appendChild(contextMenu);
    }
    
    // Set context menu content based on note type
    if (note.type === 'text') {
        contextMenu.innerHTML = `
            <div class="menu-item" id="editNote">
                <span class="menu-icon">✏️</span>
                <span class="menu-text">Edit Note</span>
            </div>
            <div class="menu-item menu-item--danger" id="deleteNote">
                <span class="menu-icon">🗑️</span>
                <span class="menu-text">Delete Note</span>
            </div>
            <div class="menu-item" id="cancelContextMenu">
                <span class="menu-icon">❌</span>
                <span class="menu-text">Cancel</span>
            </div>
        `;
    } else if (note.type === 'drawing') {
        contextMenu.innerHTML = `
            <div class="menu-item" id="editNote">
                <span class="menu-icon">✏️</span>
                <span class="menu-text">Edit Drawing</span>
            </div>
            <div class="menu-item menu-item--danger" id="deleteNote">
                <span class="menu-icon">🗑️</span>
                <span class="menu-text">Delete Drawing</span>
            </div>
            <div class="menu-item" id="cancelContextMenu">
                <span class="menu-icon">❌</span>
                <span class="menu-text">Cancel</span>
            </div>
        `;
    }
    
    // Position the context menu
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    
    // Add event listeners to menu items
    document.getElementById('editNote').addEventListener('click', () => {
        closeContextMenu();
        if (note.type === 'text') {
            window.startEditingNote(note);
        } else if (note.type === 'drawing') {
            window.startDrawingMode(x, y, note);
        }
    });
    
    document.getElementById('deleteNote').addEventListener('click', () => {
        closeContextMenu();
        window.deleteNote(note.id);
    });
    
    document.getElementById('cancelContextMenu').addEventListener('click', closeContextMenu);
    
    // Mark context menu as open
    window.appState.isContextMenuOpen = true;
    
    // Show the context menu with animation
    setTimeout(() => {
        contextMenu.classList.add('context-menu--open');
    }, 10);
}

/**
 * Close the context menu
 */
function closeContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
        contextMenu.classList.remove('context-menu--open');
        setTimeout(() => {
            if (contextMenu.parentNode) {
                contextMenu.parentNode.removeChild(contextMenu);
            }
        }, 300); // Match the transition duration
    }
    window.appState.isContextMenuOpen = false;
}

/**
 * Load notes from Supabase
 */
async function loadNotes() {
    try {
        // Show loading indicator
        document.querySelector('.loading').classList.remove('hidden');
        
        // Load notes from database
        const notes = await window.loadNotesFromDB();
        
        // Update app state with notes
        window.appState.notes = notes;
        
        // Render notes
        window.renderNotes();
        
        // Hide loading indicator
        document.querySelector('.loading').classList.add('hidden');
        
        console.log(`Loaded ${notes.length} notes from database`);
    } catch (error) {
        console.error('Error loading notes:', error);
        document.querySelector('.loading').classList.add('hidden');
    }
}

/**
 * Set up real-time subscription for note changes
 */
function setupRealtimeSubscription() {
    window.setupRealtimeSubscription((payload) => {
        console.log('Realtime change received:', payload);
        
        // Handle different event types
        if (payload.eventType === 'INSERT') {
            // New note added
            window.appState.notes.push(payload.new);
            window.renderNotes();
        } else if (payload.eventType === 'UPDATE') {
            // Note updated
            const index = window.appState.notes.findIndex(note => note.id === payload.new.id);
            if (index !== -1) {
                window.appState.notes[index] = payload.new;
                window.renderNotes();
            }
        } else if (payload.eventType === 'DELETE') {
            // Note deleted
            const index = window.appState.notes.findIndex(note => note.id === payload.old.id);
            if (index !== -1) {
                window.appState.notes.splice(index, 1);
                window.renderNotes();
            }
        }
    });
}

// Expose functions to window
window.initApp = initApp;
window.handleGlobalClick = handleGlobalClick;
window.handleKeyDown = handleKeyDown;
window.openContextMenu = openContextMenu;
window.openNoteContextMenu = openNoteContextMenu;
window.closeContextMenu = closeContextMenu;

// Initialize app when document is ready and fonts are loaded
document.addEventListener('DOMContentLoaded', function() {
    document.fonts.ready.then(() => {
        initApp();
    });
}); 