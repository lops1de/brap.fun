/**
 * notes.js - Handles note creation, editing, and management
 */

// Initialize app state if it doesn't exist yet
window.appState = window.appState || {
    notes: [],
    isContextMenuOpen: false,
    currentEditingNote: null,
    isEditing: false,
    selectedFont: 'Quicksand',
    selectedWeight: '500',
    selectedColor: '#333333',
    lastClickX: 0,
    lastClickY: 0
};

/**
 * Initialize notes system
 */
function initNotes() {
    console.log('Initializing notes system...');
    
    // Create note editor if it doesn't exist
    if (!document.getElementById('noteEditor')) {
        createNoteEditor();
    }
    
    console.log('Notes system initialized');
}

/**
 * Create a text note at the specified coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
async function createTextNote(x, y) {
    // Convert screen coordinates to normalized coordinates
    const { x: normX, y: normY } = window.normalizeCoordinates(x, y);
    
    // Create note object
    const note = {
        type: 'text',
        x_coord: normX,
        y_coord: normY,
        content: {
            text: 'New Note',
            font: window.appState.selectedFont,
            weight: window.appState.selectedWeight,
            color: window.appState.selectedColor
        }
    };
    
    try {
        // Create note in database
        const createdNote = await window.createNoteInDB(note);
        
        if (createdNote) {
            // Add note to app state
            window.appState.notes.push(createdNote);
            
            // Re-render notes
            window.renderNotes();
            
            // Start editing the new note
            startEditingNote(createdNote);
        } else {
            console.error('Failed to create note in database');
        }
    } catch (error) {
        console.error('Error creating note:', error);
    }
}

/**
 * Create a drawing note at the specified coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
async function createDrawingNote(x, y) {
    // Convert screen coordinates to normalized coordinates
    const { x: normX, y: normY } = window.normalizeCoordinates(x, y);
    
    // Create note object
    const note = {
        type: 'drawing',
        x_coord: normX,
        y_coord: normY,
        content: {
            imageData: null
        }
    };
    
    try {
        // Create note in database
        const createdNote = await window.createNoteInDB(note);
        
        if (createdNote) {
            // Add note to app state
            window.appState.notes.push(createdNote);
            
            // Re-render notes
            window.renderNotes();
            
            // Start drawing mode for the new note
            window.startDrawingMode(x, y, createdNote);
        } else {
            console.error('Failed to create drawing note in database');
        }
    } catch (error) {
        console.error('Error creating drawing note:', error);
    }
}

/**
 * Start editing a note
 * @param {Object} note - The note to edit
 */
function startEditingNote(note) {
    // Set editing state
    window.appState.isEditing = true;
    window.appState.currentEditingNote = note;
    
    // Get note editor
    const editor = document.getElementById('noteEditor');
    
    // Set editor content based on note type
    if (note.type === 'text') {
        // Set text content
        editor.querySelector('#noteText').value = note.content.text;
        
        // Set font selector
        editor.querySelector('#fontSelector').value = note.content.font;
        
        // Set weight selector
        editor.querySelector('#weightSelector').value = note.content.weight;
        
        // Set color selector
        editor.querySelector('#colorSelector').value = note.content.color;
        
        // Show text editor
        editor.querySelector('.text-editor').classList.remove('hidden');
        editor.querySelector('.drawing-editor').classList.add('hidden');
    } else if (note.type === 'drawing') {
        // Show drawing editor
        editor.querySelector('.text-editor').classList.add('hidden');
        editor.querySelector('.drawing-editor').classList.remove('hidden');
        
        // Start drawing mode
        window.startDrawingMode(
            window.appState.lastClickX,
            window.appState.lastClickY,
            note
        );
    }
    
    // Position editor near the note
    const canvas = document.getElementById('mainCanvas');
    const rect = canvas.getBoundingClientRect();
    
    // Convert normalized coordinates to screen coordinates
    const screenX = note.x_coord * rect.width;
    const screenY = note.y_coord * rect.height;
    
    // Position editor to the right of the note
    editor.style.left = `${screenX + 20}px`;
    editor.style.top = `${screenY}px`;
    
    // Show editor with animation
    editor.classList.remove('hidden');
    setTimeout(() => {
        editor.classList.add('note-editor--open');
    }, 10);
}

/**
 * Stop editing the current note
 */
async function stopEditingNote() {
    // Get current note
    const note = window.appState.currentEditingNote;
    
    if (note) {
        try {
            // Update note in database
            const updatedNote = await window.updateNoteInDB(note.id, note);
            
            if (updatedNote) {
                // Update note in app state
                const index = window.appState.notes.findIndex(n => n.id === note.id);
                if (index !== -1) {
                    window.appState.notes[index] = updatedNote;
                }
                
                // Re-render notes
                window.renderNotes();
            } else {
                console.error('Failed to update note in database');
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    }
    
    // Reset editing state
    window.appState.isEditing = false;
    window.appState.currentEditingNote = null;
    
    // Hide note editor
    const editor = document.getElementById('noteEditor');
    editor.classList.remove('note-editor--open');
    setTimeout(() => {
        editor.classList.add('hidden');
    }, 300); // Match the transition duration
}

/**
 * Delete a note
 * @param {string} id - The ID of the note to delete
 */
async function deleteNote(id) {
    try {
        // Delete note from database
        const success = await window.deleteNoteFromDB(id);
        
        if (success) {
            // Remove note from app state
            const index = window.appState.notes.findIndex(note => note.id === id);
            if (index !== -1) {
                window.appState.notes.splice(index, 1);
            }
            
            // Re-render notes
            window.renderNotes();
        } else {
            console.error('Failed to delete note from database');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
    }
}

/**
 * Create the note editor element
 */
function createNoteEditor() {
    // Create editor container
    const editor = document.createElement('div');
    editor.id = 'noteEditor';
    editor.className = 'note-editor hidden';
    
    // Create text editor
    const textEditor = document.createElement('div');
    textEditor.className = 'text-editor';
    textEditor.innerHTML = `
        <textarea id="noteText" placeholder="Enter note text..."></textarea>
        <div class="editor-controls">
            <select id="fontSelector">
                <option value="Quicksand">Quicksand</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Roboto">Roboto</option>
            </select>
            <select id="weightSelector">
                <option value="300">Light</option>
                <option value="500">Medium</option>
                <option value="700">Bold</option>
            </select>
            <input type="color" id="colorSelector" value="#000000">
            <button id="saveNote">Save</button>
            <button id="cancelNote">Cancel</button>
        </div>
    `;
    
    // Create drawing editor
    const drawingEditor = document.createElement('div');
    drawingEditor.className = 'drawing-editor hidden';
    drawingEditor.innerHTML = `
        <div class="drawing-controls">
            <button id="saveDrawing">Save</button>
            <button id="cancelDrawing">Cancel</button>
        </div>
    `;
    
    // Add editors to container
    editor.appendChild(textEditor);
    editor.appendChild(drawingEditor);
    
    // Add editor to document
    document.body.appendChild(editor);
    
    // Add event listeners
    setupEditorEventListeners(editor);
}

/**
 * Set up event listeners for the note editor
 * @param {HTMLElement} editor - The note editor element
 */
function setupEditorEventListeners(editor) {
    // Text editor event listeners
    const noteText = editor.querySelector('#noteText');
    const fontSelector = editor.querySelector('#fontSelector');
    const weightSelector = editor.querySelector('#weightSelector');
    const colorSelector = editor.querySelector('#colorSelector');
    const saveButton = editor.querySelector('#saveNote');
    const cancelButton = editor.querySelector('#cancelNote');
    
    // Update note content on input change
    noteText.addEventListener('input', () => {
        if (window.appState.currentEditingNote) {
            window.appState.currentEditingNote.content.text = noteText.value;
            window.renderNotes();
        }
    });
    
    // Update font on change
    fontSelector.addEventListener('change', () => {
        if (window.appState.currentEditingNote) {
            window.appState.currentEditingNote.content.font = fontSelector.value;
            window.renderNotes();
        }
    });
    
    // Update weight on change
    weightSelector.addEventListener('change', () => {
        if (window.appState.currentEditingNote) {
            window.appState.currentEditingNote.content.weight = weightSelector.value;
            window.renderNotes();
        }
    });
    
    // Update color on change
    colorSelector.addEventListener('change', () => {
        if (window.appState.currentEditingNote) {
            window.appState.currentEditingNote.content.color = colorSelector.value;
            window.renderNotes();
        }
    });
    
    // Save button click
    saveButton.addEventListener('click', () => {
        window.stopEditingNote();
    });
    
    // Cancel button click
    cancelButton.addEventListener('click', () => {
        window.stopEditingNote();
    });
    
    // Drawing editor event listeners
    const saveDrawingButton = editor.querySelector('#saveDrawing');
    const cancelDrawingButton = editor.querySelector('#cancelDrawing');
    
    // Save drawing button click
    saveDrawingButton.addEventListener('click', () => {
        window.stopDrawingMode();
        window.stopEditingNote();
    });
    
    // Cancel drawing button click
    cancelDrawingButton.addEventListener('click', () => {
        window.stopDrawingMode();
        window.stopEditingNote();
    });
}

/**
 * Handle clicking on a note
 * @param {Object} note - The clicked note
 * @param {MouseEvent} event - The click event
 */
function handleNoteClick(note, event) {
    // Prevent event propagation
    event.stopPropagation();
    
    // Handle based on note type
    if (note.type === 'text') {
        startEditingNote(note);
    } else if (note.type === 'drawing') {
        window.startDrawingMode(event.clientX, event.clientY, note);
    }
}

/**
 * Handle global clicks to close editors
 * @param {MouseEvent} event - The click event
 */
function handleGlobalClick(event) {
    // Close note editor if clicked outside
    if (window.appState.currentEditingNote) {
        const editor = document.getElementById('noteEditor');
        if (!editor.contains(event.target)) {
            // Check if click was on the associated note
            const noteElement = document.querySelector(`[data-id="${window.appState.currentEditingNote.id}"]`);
            if (!noteElement || !noteElement.contains(event.target)) {
                stopEditingNote();
            }
        }
    }
}

/**
 * Handle key presses for shortcuts
 * @param {KeyboardEvent} event - The key event
 */
function handleKeyDown(event) {
    // Close note editor on ESC
    if (event.key === 'Escape' && window.appState.currentEditingNote) {
        stopEditingNote();
    }
}

/**
 * Generate a UUID for new notes
 * @returns {string} A UUID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, 
              v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Expose functions to window
window.initNotes = initNotes;
window.createTextNote = createTextNote;
window.createDrawingNote = createDrawingNote;
window.startEditingNote = startEditingNote;
window.stopEditingNote = stopEditingNote;
window.deleteNote = deleteNote;
window.handleNoteClick = handleNoteClick;
window.handleGlobalClick = handleGlobalClick;
window.handleKeyDown = handleKeyDown; 