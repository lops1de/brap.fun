/**
 * drawing.js - Drawing functionality for Bulletin Board
 * Handles drawing tools, canvas interactions, and note creation
 */

// Drawing state
const drawingState = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    activeNote: null,
    currentTool: 'pen',
    currentColor: '#000000',
    currentSize: 'medium',
    lastX: 0,
    lastY: 0
};

// Tool sizes
const TOOL_SIZES = {
    small: 2,
    medium: 5,
    large: 10
};

// Tool colors
const COLORS = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

/**
 * Initialize drawing functionality
 */
function initDrawing() {
    console.log('Initializing drawing system...');
    
    // Set up drawing canvas
    drawingState.canvas = document.getElementById('drawingCanvas');
    drawingState.ctx = drawingState.canvas.getContext('2d');
    
    // Set up drawing event listeners
    setupDrawingEventListeners();
    
    // Set up tool buttons
    setupToolButtons();
}

/**
 * Set up drawing event listeners
 */
function setupDrawingEventListeners() {
    // Canvas drawing events
    drawingState.canvas.addEventListener('mousedown', handleDrawingMouseDown);
    drawingState.canvas.addEventListener('mousemove', handleDrawingMouseMove);
    drawingState.canvas.addEventListener('mouseup', handleDrawingMouseUp);
    drawingState.canvas.addEventListener('mouseleave', handleDrawingMouseUp);
    
    // Modal buttons
    document.getElementById('saveDrawingBtn').addEventListener('click', saveDrawing);
    document.getElementById('cancelDrawingBtn').addEventListener('click', closeDrawingModal);
    document.getElementById('closeDrawingBtn').addEventListener('click', closeDrawingModal);
}

/**
 * Set up tool buttons
 */
function setupToolButtons() {
    const toolsContainer = document.getElementById('drawingTools');
    const colorsContainer = document.getElementById('drawingColors');
    const sizesContainer = document.getElementById('drawingSizes');
    
    // Create tool buttons
    toolsContainer.innerHTML = `
        <button class="btn btn--tool active" data-tool="pen">✏️</button>
        <button class="btn btn--tool" data-tool="eraser">🧽</button>
        <button class="btn btn--tool" data-tool="clear">🗑️</button>
    `;
    
    // Create color buttons
    colorsContainer.innerHTML = COLORS.map(color => `
        <button class="btn btn--color ${color === '#000000' ? 'active' : ''}" 
                data-color="${color}" 
                style="background-color: ${color}">
        </button>
    `).join('');
    
    // Create size buttons
    sizesContainer.innerHTML = `
        <button class="btn btn--size" data-size="small">
            <div class="size-indicator"></div>
        </button>
        <button class="btn btn--size active" data-size="medium">
            <div class="size-indicator size-indicator--medium"></div>
        </button>
        <button class="btn btn--size" data-size="large">
            <div class="size-indicator size-indicator--large"></div>
        </button>
    `;
    
    // Add event listeners for tools
    const toolButtons = document.querySelectorAll('[data-tool]');
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update tool
            drawingState.currentTool = button.dataset.tool;
            
            // Update UI
            toolButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            // Clear canvas if clear button
            if (drawingState.currentTool === 'clear') {
                clearDrawingCanvas();
                
                // Reset to pen after clearing
                drawingState.currentTool = 'pen';
                toolButtons[0].classList.add('active');
                button.classList.remove('active');
            }
        });
    });
    
    // Add event listeners for colors
    const colorButtons = document.querySelectorAll('[data-color]');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update color
            drawingState.currentColor = button.dataset.color;
            
            // Update UI
            colorButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Add event listeners for sizes
    const sizeButtons = document.querySelectorAll('[data-size]');
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update size
            drawingState.currentSize = button.dataset.size;
            
            // Update UI
            sizeButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

/**
 * Handle drawing mouse down
 * @param {MouseEvent} event - The mouse event
 */
function handleDrawingMouseDown(event) {
    drawingState.isDrawing = true;
    
    // Get canvas position
    const rect = drawingState.canvas.getBoundingClientRect();
    drawingState.lastX = event.clientX - rect.left;
    drawingState.lastY = event.clientY - rect.top;
}

/**
 * Handle drawing mouse move
 * @param {MouseEvent} event - The mouse event
 */
function handleDrawingMouseMove(event) {
    if (!drawingState.isDrawing) return;
    
    // Get canvas position
    const rect = drawingState.canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    
    // Draw line
    drawingState.ctx.beginPath();
    
    if (drawingState.currentTool === 'pen') {
        // Set line properties
        drawingState.ctx.strokeStyle = drawingState.currentColor;
        drawingState.ctx.lineWidth = TOOL_SIZES[drawingState.currentSize];
        drawingState.ctx.lineCap = 'round';
        drawingState.ctx.lineJoin = 'round';
        
        // Draw line
        drawingState.ctx.moveTo(drawingState.lastX, drawingState.lastY);
        drawingState.ctx.lineTo(currentX, currentY);
        drawingState.ctx.stroke();
    } else if (drawingState.currentTool === 'eraser') {
        // Set eraser properties
        drawingState.ctx.strokeStyle = '#FFFFFF';
        drawingState.ctx.lineWidth = TOOL_SIZES[drawingState.currentSize] * 2;
        drawingState.ctx.lineCap = 'round';
        drawingState.ctx.lineJoin = 'round';
        
        // Erase
        drawingState.ctx.moveTo(drawingState.lastX, drawingState.lastY);
        drawingState.ctx.lineTo(currentX, currentY);
        drawingState.ctx.stroke();
    }
    
    // Update last position
    drawingState.lastX = currentX;
    drawingState.lastY = currentY;
}

/**
 * Handle drawing mouse up
 */
function handleDrawingMouseUp() {
    drawingState.isDrawing = false;
}

/**
 * Clear the drawing canvas
 */
function clearDrawingCanvas() {
    drawingState.ctx.fillStyle = '#FFFFFF';
    drawingState.ctx.fillRect(0, 0, drawingState.canvas.width, drawingState.canvas.height);
}

/**
 * Save the current drawing
 */
function saveDrawing() {
    if (!drawingState.activeNote) {
        // Create new drawing note
        const base64Data = drawingState.canvas.toDataURL('image/png');
        
        // Get coordinates from last click
        const x = window.appState.lastClickX;
        const y = window.appState.lastClickY;
        
        // Create drawing note
        window.createDrawingNote(x, y, base64Data);
    } else {
        // Update existing note
        const base64Data = drawingState.canvas.toDataURL('image/png');
        
        // Find note index
        const noteIndex = window.appState.notes.findIndex(note => note.id === drawingState.activeNote.id);
        
        if (noteIndex !== -1) {
            // Update note content
            window.appState.notes[noteIndex].content = base64Data;
            
            // Re-render notes
            window.renderNotes();
        }
    }
    
    // Close drawing modal
    closeDrawingModal();
}

/**
 * Start drawing mode for a note
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {Object} note - Optional existing note to edit
 */
function startDrawingMode(x, y, note = null) {
    // Store active note if editing
    drawingState.activeNote = note;
    
    // Store coordinates
    window.appState.lastClickX = x;
    window.appState.lastClickY = y;
    
    // Clear canvas and open modal
    clearDrawingCanvas();
    
    // Load existing drawing if editing
    if (note) {
        loadDrawing(note.content);
    }
    
    // Open drawing modal
    openDrawingModal();
}

/**
 * Open the drawing modal
 */
function openDrawingModal() {
    const modal = document.getElementById('drawingModal');
    modal.classList.add('drawing-modal--open');
    
    // Resize canvas to fit container
    const container = modal.querySelector('.drawing-canvas');
    drawingState.canvas.width = container.clientWidth;
    drawingState.canvas.height = container.clientHeight;
    
    // Clear canvas background to white
    clearDrawingCanvas();
}

/**
 * Close the drawing modal
 */
function closeDrawingModal() {
    const modal = document.getElementById('drawingModal');
    modal.classList.remove('drawing-modal--open');
    
    // Reset active note
    drawingState.activeNote = null;
}

/**
 * Load an existing drawing into the canvas
 * @param {string} base64Data - The base64 image data
 */
function loadDrawing(base64Data) {
    // Create image from base64 data
    const img = new Image();
    img.onload = function() {
        // Draw image on canvas, scaling to fit
        drawingState.ctx.drawImage(img, 0, 0, drawingState.canvas.width, drawingState.canvas.height);
    };
    img.src = base64Data;
}

// Expose functions to window
window.initDrawing = initDrawing;
window.startDrawingMode = startDrawingMode; 