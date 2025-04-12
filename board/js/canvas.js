/**
 * canvas.js - Canvas management for Bulletin Board
 * Handles zooming, dragging, and rendering
 */

// Initialize appState if it doesn't exist
window.appState = window.appState || {
    notes: [],
    isContextMenuOpen: false,
    isEditing: false,
    currentEditingNote: null,
    lastClickX: 0,
    lastClickY: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    momentumX: 0,
    momentumY: 0
};

// Canvas constants
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1500;
const MIN_SCALE = 0.1;
const MAX_SCALE = 2;
const MOMENTUM_FACTOR = 0.95;
const MOMENTUM_THRESHOLD = 0.1;

/**
 * Initialize the canvas
 */
function initCanvas() {
    console.log('Initializing canvas...');
    
    // Get canvas element
    const canvas = document.getElementById('mainCanvas');
    const container = document.getElementById('canvasContainer');
    
    // Set canvas dimensions
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Store canvas reference
    window.appState.canvas = canvas;
    window.appState.ctx = canvas.getContext('2d');
    window.appState.container = container;
    
    // Center the canvas initially
    window.appState.offsetX = (window.innerWidth - CANVAS_WIDTH * window.appState.scale) / 2;
    window.appState.offsetY = (window.innerHeight - CANVAS_HEIGHT * window.appState.scale) / 2;
    
    // Setup event listeners
    setupCanvasEventListeners();
    
    // Set up viewport gizmo
    setupViewportGizmo();
    
    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
    
    // Initial render
    renderNotes();
    
    // Start animation loop
    requestAnimationFrame(animateCanvas);
}

/**
 * Set up canvas event listeners
 */
function setupCanvasEventListeners() {
    const canvas = window.appState.canvas;
    const container = window.appState.container;
    
    // Mouse events on container
    container.addEventListener('mousedown', handleCanvasMouseDown);
    container.addEventListener('mousemove', handleCanvasMouseMove);
    container.addEventListener('mouseup', handleCanvasMouseUp);
    container.addEventListener('mouseleave', handleCanvasMouseUp);
    container.addEventListener('click', handleCanvasClick);
    
    // Wheel event for zooming
    container.addEventListener('wheel', handleCanvasWheel, { passive: false });
    
    // Right-click handling for context menu
    container.addEventListener('contextmenu', handleContextMenu);
}

/**
 * Handle mouse wheel events for zooming
 * @param {WheelEvent} e - The wheel event
 */
function handleCanvasWheel(e) {
    e.preventDefault();
    
    // Get mouse position
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate mouse position relative to canvas content
    const mouseCanvasX = (mouseX - window.appState.offsetX) / window.appState.scale;
    const mouseCanvasY = (mouseY - window.appState.offsetY) / window.appState.scale;
    
    // Calculate new scale
    let newScale = window.appState.scale;
    const delta = -Math.sign(e.deltaY) * 0.1;
    newScale += delta * newScale;
    
    // Clamp scale
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    
    // Calculate new offsets to zoom toward mouse position
    const newOffsetX = mouseX - mouseCanvasX * newScale;
    const newOffsetY = mouseY - mouseCanvasY * newScale;
    
    // Update scale and offsets
    window.appState.scale = newScale;
    window.appState.offsetX = newOffsetX;
    window.appState.offsetY = newOffsetY;
    
    // Apply boundary constraints
    applyBoundaryConstraints();
    
    // Re-render notes
    renderNotes();
}

/**
 * Handle mouse down event on canvas
 * @param {MouseEvent} e - The mouse event
 */
function handleCanvasMouseDown(e) {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    // Store click position
    window.appState.lastClickX = e.clientX;
    window.appState.lastClickY = e.clientY;
    
    // Check if clicked on a note
    const note = findNoteAtPosition(e.clientX, e.clientY);
    
    if (note) {
        // Handle note click
        window.handleNoteClick(note, e);
    } else {
        // Start dragging
        window.appState.isDragging = true;
        window.appState.lastMouseX = e.clientX;
        window.appState.lastMouseY = e.clientY;
        
        // Reset momentum
        window.appState.momentumX = 0;
        window.appState.momentumY = 0;
        
        // Change cursor and class
        window.appState.container.classList.add('canvas-container--dragging');
    }
}

/**
 * Handle mouse move event on canvas
 * @param {MouseEvent} e - The mouse event
 */
function handleCanvasMouseMove(e) {
    if (window.appState.isDragging) {
        // Calculate movement
        const deltaX = e.clientX - window.appState.lastMouseX;
        const deltaY = e.clientY - window.appState.lastMouseY;
        
        // Update offsets
        window.appState.offsetX += deltaX;
        window.appState.offsetY += deltaY;
        
        // Update momentum
        window.appState.momentumX = deltaX * 0.3;
        window.appState.momentumY = deltaY * 0.3;
        
        // Apply boundary constraints
        applyBoundaryConstraints();
        
        // Update last mouse position
        window.appState.lastMouseX = e.clientX;
        window.appState.lastMouseY = e.clientY;
        
        // Re-render notes
        renderNotes();
    }
}

/**
 * Handle mouse up event on canvas
 * @param {MouseEvent} e - The mouse event
 */
function handleCanvasMouseUp() {
    // If was dragging
    if (window.appState.isDragging) {
        window.appState.isDragging = false;
        
        // Reset cursor and class
        window.appState.container.classList.remove('canvas-container--dragging');
        
        // Apply momentum if significant
        if (Math.abs(window.appState.momentumX) > MOMENTUM_THRESHOLD || 
            Math.abs(window.appState.momentumY) > MOMENTUM_THRESHOLD) {
            applyMomentum();
        }
    }
}

/**
 * Apply momentum to canvas movement
 */
function applyMomentum() {
    if (!window.appState.isDragging && 
        (Math.abs(window.appState.momentumX) > MOMENTUM_THRESHOLD || 
         Math.abs(window.appState.momentumY) > MOMENTUM_THRESHOLD)) {
        
        // Apply momentum
        window.appState.offsetX += window.appState.momentumX;
        window.appState.offsetY += window.appState.momentumY;
        
        // Reduce momentum
        window.appState.momentumX *= MOMENTUM_FACTOR;
        window.appState.momentumY *= MOMENTUM_FACTOR;
        
        // Apply boundary constraints
        applyBoundaryConstraints();
        
        // Re-render notes
        renderNotes();
        
        // Continue momentum
        requestAnimationFrame(applyMomentum);
    }
}

/**
 * Handle right-click event for context menu
 * @param {MouseEvent} e - The context menu event
 */
function handleContextMenu(e) {
    e.preventDefault();
    
    // Check if a note was clicked
    const note = findNoteAtPosition(e.clientX, e.clientY);
    
    if (note) {
        // Show note-specific context menu
        window.openNoteContextMenu(e.clientX, e.clientY, note);
    } else {
        // Show regular context menu for empty canvas area
        window.openContextMenu(e.clientX, e.clientY);
    }
}

/**
 * Handle click event on canvas
 * @param {MouseEvent} e - The mouse event
 */
function handleCanvasClick(e) {
    // Store click position
    window.appState.lastClickX = e.clientX;
    window.appState.lastClickY = e.clientY;
}

/**
 * Apply boundary constraints to canvas offsets
 */
function applyBoundaryConstraints() {
    // Get canvas and container dimensions
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const canvasScaledWidth = CANVAS_WIDTH * window.appState.scale;
    const canvasScaledHeight = CANVAS_HEIGHT * window.appState.scale;
    
    // Calculate minimum offsets to keep canvas in view
    const minOffsetX = containerWidth - canvasScaledWidth - 100;
    const minOffsetY = containerHeight - canvasScaledHeight - 100;
    
    // Calculate maximum offsets to keep canvas in view
    const maxOffsetX = 100;
    const maxOffsetY = 100;
    
    // Apply constraints
    if (canvasScaledWidth > containerWidth) {
        // Canvas is wider than container
        window.appState.offsetX = Math.min(maxOffsetX, Math.max(minOffsetX, window.appState.offsetX));
    } else {
        // Canvas is narrower than container
        window.appState.offsetX = (containerWidth - canvasScaledWidth) / 2;
    }
    
    if (canvasScaledHeight > containerHeight) {
        // Canvas is taller than container
        window.appState.offsetY = Math.min(maxOffsetY, Math.max(minOffsetY, window.appState.offsetY));
    } else {
        // Canvas is shorter than container
        window.appState.offsetY = (containerHeight - canvasScaledHeight) / 2;
    }
}

/**
 * Convert screen coordinates to normalized canvas coordinates
 * @param {number} x - Screen X coordinate
 * @param {number} y - Screen Y coordinate
 * @returns {Object} Normalized coordinates (0-1 range)
 */
function normalizeCoordinates(x, y) {
    // Convert screen coordinates to canvas coordinates
    const canvasX = (x - window.appState.offsetX) / window.appState.scale;
    const canvasY = (y - window.appState.offsetY) / window.appState.scale;
    
    // Convert to normalized coordinates (0-1 range)
    return {
        x: canvasX / CANVAS_WIDTH,
        y: canvasY / CANVAS_HEIGHT
    };
}

/**
 * Find a note at the specified screen position
 * @param {number} x - Screen X coordinate
 * @param {number} y - Screen Y coordinate
 * @returns {Object|null} The note at the position, or null if none
 */
function findNoteAtPosition(x, y) {
    // Convert screen coordinates to canvas coordinates
    const canvasX = (x - window.appState.offsetX) / window.appState.scale;
    const canvasY = (y - window.appState.offsetY) / window.appState.scale;
    
    // Check notes in reverse order (top to bottom visually)
    for (let i = window.appState.notes.length - 1; i >= 0; i--) {
        const note = window.appState.notes[i];
        
        // Convert normalized coordinates to canvas coordinates
        const noteX = note.x_coord * CANVAS_WIDTH;
        const noteY = note.y_coord * CANVAS_HEIGHT;
        
        // Note dimensions (approximate)
        const noteWidth = note.type === 'text' ? 200 : 200;
        const noteHeight = note.type === 'text' ? 100 : 150;
        
        // Check if point is inside note
        if (canvasX >= noteX && canvasX <= noteX + noteWidth &&
            canvasY >= noteY && canvasY <= noteY + noteHeight) {
            return note;
        }
    }
    
    return null;
}

/**
 * Render all notes on the canvas
 */
function renderNotes() {
    const canvas = window.appState.canvas;
    const ctx = window.appState.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground(ctx, canvas);
    
    // Apply canvas transformations
    ctx.save();
    ctx.translate(window.appState.offsetX, window.appState.offsetY);
    ctx.scale(window.appState.scale, window.appState.scale);
    
    // Render each note
    window.appState.notes.forEach(note => {
        if (note.type === 'text') {
            renderTextNote(note, ctx);
        } else if (note.type === 'drawing') {
            renderDrawingNote(note, ctx);
        }
    });
    
    // Restore canvas state
    ctx.restore();
    
    // Update viewport gizmo
    updateViewportGizmo();
}

/**
 * Draw the canvas background
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function drawBackground(ctx, canvas) {
    // Draw solid background
    ctx.fillStyle = '#f6f6f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid pattern
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

/**
 * Render a text note on the canvas
 * @param {Object} note - The note to render
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function renderTextNote(note, ctx) {
    // Get note position
    const x = note.x_coord * CANVAS_WIDTH;
    const y = note.y_coord * CANVAS_HEIGHT;
    
    // Get note content
    const content = note.content;
    
    // Note dimensions
    const width = 200;
    const height = 100;
    
    // Create slight random rotation for Wii-like feel
    const rotation = (note.id.charCodeAt(0) % 10) * 0.5 - 2.5; // -2.5 to 2.5 degrees
    
    // Draw note background with rotation
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-(x + width/2), -(y + height/2));
    
    // Draw note background
    ctx.fillStyle = '#fff8e1';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(x, y, width, height);
    
    // Draw pin
    ctx.beginPath();
    ctx.arc(x + width/2, y + 5, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    
    // Draw note content
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = content.color || '#333333';
    ctx.font = `${content.weight || '500'} 16px ${content.font || 'Quicksand'}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Wrap text
    const text = content.text || '';
    const lineHeight = 20;
    const padding = 15;
    const maxWidth = width - padding * 2;
    let words = text.split(' ');
    let line = '';
    let y1 = y + padding + 5; // Extra 5px for pin
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x + padding, y1);
            line = words[n] + ' ';
            y1 += lineHeight;
            
            // Check if we exceed the note height
            if (y1 > y + height - padding) {
                ctx.fillText('...', x + padding, y1 - lineHeight);
                break;
            }
        } else {
            line = testLine;
        }
    }
    
    // Last line
    if (y1 <= y + height - padding) {
        ctx.fillText(line, x + padding, y1);
    }
    
    // Restore canvas state
    ctx.restore();
}

/**
 * Render a drawing note on the canvas
 * @param {Object} note - The note to render
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function renderDrawingNote(note, ctx) {
    // Get note position
    const x = note.x_coord * CANVAS_WIDTH;
    const y = note.y_coord * CANVAS_HEIGHT;
    
    // Note dimensions
    const width = 200;
    const height = 150;
    
    // Create slight random rotation for Wii-like feel
    const rotation = (note.id.charCodeAt(0) % 10) * 0.5 - 2.5; // -2.5 to 2.5 degrees
    
    // Draw note background with rotation
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-(x + width/2), -(y + height/2));
    
    // Draw note background
    ctx.fillStyle = '#fff8e1';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillRect(x, y, width, height);
    
    // Draw pin
    ctx.beginPath();
    ctx.arc(x + width/2, y + 5, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    
    // Draw drawing content if available
    if (note.content) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Create temporary image element
        const img = new Image();
        img.src = note.content;
        
        // If the image is loaded, draw it with proper sizing
        if (img.complete) {
            const padding = 15;
            ctx.drawImage(img, x + padding, y + padding + 5, width - padding * 2, height - padding * 2 - 5);
        } else {
            // If not loaded, draw placeholder
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(x + 15, y + 20, width - 30, height - 35);
            
            // Add loading text
            ctx.fillStyle = '#555555';
            ctx.font = '12px Quicksand';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Loading...', x + width/2, y + height/2);
            
            // Set up load event
            img.onload = () => {
                // Re-render when loaded
                renderNotes();
            };
        }
    } else {
        // Draw empty placeholder
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(x + 15, y + 20, width - 30, height - 35);
        
        // Add empty text
        ctx.fillStyle = '#555555';
        ctx.font = '12px Quicksand';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Empty Drawing', x + width/2, y + height/2);
    }
    
    // Restore canvas state
    ctx.restore();
}

/**
 * Animate the canvas (called by requestAnimationFrame)
 */
function animateCanvas() {
    // Perform any continuous animations here
    requestAnimationFrame(animateCanvas);
}

/**
 * Set up the viewport gizmo
 */
function setupViewportGizmo() {
    // Get viewport gizmo elements
    const gizmo = document.getElementById('viewportGizmo');
    const indicator = document.getElementById('viewportIndicator');
    
    // Store references
    window.appState.gizmo = gizmo;
    window.appState.gizmoIndicator = indicator;
    
    // Initial update
    updateViewportGizmo();
}

/**
 * Update the viewport gizmo to reflect current view
 */
function updateViewportGizmo() {
    const gizmo = window.appState.gizmo;
    const indicator = window.appState.gizmoIndicator;
    
    if (!gizmo || !indicator) return;
    
    // Get dimensions
    const gizmoWidth = gizmo.clientWidth;
    const gizmoHeight = gizmo.clientHeight;
    const totalWidth = CANVAS_WIDTH;
    const totalHeight = CANVAS_HEIGHT;
    
    // Calculate visible area
    const scale = window.appState.scale;
    const viewWidth = window.innerWidth / scale;
    const viewHeight = window.innerHeight / scale;
    
    // Calculate normalized offset
    const viewX = -window.appState.offsetX / scale;
    const viewY = -window.appState.offsetY / scale;
    
    // Calculate gizmo indicator dimensions
    const indicatorWidth = (viewWidth / totalWidth) * gizmoWidth;
    const indicatorHeight = (viewHeight / totalHeight) * gizmoHeight;
    const indicatorX = (viewX / totalWidth) * gizmoWidth;
    const indicatorY = (viewY / totalHeight) * gizmoHeight;
    
    // Update indicator style
    indicator.style.width = `${Math.min(indicatorWidth, gizmoWidth)}px`;
    indicator.style.height = `${Math.min(indicatorHeight, gizmoHeight)}px`;
    indicator.style.left = `${Math.max(0, indicatorX)}px`;
    indicator.style.top = `${Math.max(0, indicatorY)}px`;
}

/**
 * Handle window resize event
 */
function handleWindowResize() {
    // Update canvas size
    const canvas = window.appState.canvas;
    
    // Apply boundary constraints
    applyBoundaryConstraints();
    
    // Re-render notes
    renderNotes();
}

// Expose functions to window
window.initCanvas = initCanvas;
window.renderNotes = renderNotes;
window.normalizeCoordinates = normalizeCoordinates;
window.findNoteAtPosition = findNoteAtPosition;
window.handleCanvasClick = handleCanvasClick;
window.handleContextMenu = handleContextMenu; 