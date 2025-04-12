# Use this scratchpad to create tasklists, keep track of progress, and to write mental notes for future reference if you gain any knowledge; keep this clean, organized, and readable:

# Bulletin Board Webapp Development Scratchpad

## Project Progress Tracking

### Phase 1: Project Setup
- [x] Create project directory structure
  - [x] index.html
  - [x] css/styles.css
  - [x] js/main.js
  - [x] js/canvas.js
  - [x] js/notes.js
  - [x] js/drawing.js
- [x] Initialize Supabase client configuration
- [x] Set up basic HTML5 canvas element
- [x] Establish CSS reset and base styles

### Phase 2: Canvas Foundation
- [ ] Implement canvas plane
  - [ ] Size: 2000px × 1500px
  - [ ] Zoom functionality (wheel/scroll)
  - [ ] Drag functionality (click + drag)
  - [ ] Boundary constraints
- [ ] Create dynamic background
  - [ ] Subtle pulsing pattern
  - [ ] Texture overlay
  - [ ] Breathing animation (opacity shift)
- [ ] Coordinate system
  - [ ] Normalized coordinate mapping
  - [ ] Position conversion utilities
  - [ ] Scale-independent positioning

### Phase 3: Core Interaction System
- [ ] Click detection
  - [ ] Empty space recognition
  - [ ] Note collision detection
- [ ] Context menu
  - [ ] HTML/CSS overlay
  - [ ] 3 options with icons
  - [ ] Position relative to click
  - [ ] Fade-in animation
- [ ] State management
  - [ ] Current tool tracking
  - [ ] Active note handling

### Phase 4: Note Types Implementation
#### Text Notes
- [ ] Input interface
  - [ ] Textarea with character limit
  - [ ] Font selector (3 options)
  - [ ] Weight options (light/medium/bold)
- [ ] Display styling
  - [ ] Quirky tilt/rotation
  - [ ] Subtle shadow effect
  - [ ] Pin-like attachment visual

#### Drawing Notes
- [ ] Drawing interface
  - [ ] Canvas overlay
  - [ ] Pen tool
    - [ ] 5 color options
    - [ ] 3 size options
  - [ ] Eraser tool
    - [ ] 3 size options
  - [ ] Clear button
- [ ] Output processing
  - [ ] PNG conversion
  - [ ] Size optimization

### Phase 5: Database Integration
- [ ] Supabase schema
  - [ ] notes table
    - [ ] id (uuid)
    - [ ] type (text/drawing)
    - [ ] x_coord (float)
    - [ ] y_coord (float)
    - [ ] content (text/json)
    - [ ] created_at (timestamp)
- [ ] CRUD operations
  - [ ] Create: new note insertion
  - [ ] Read: initial load + updates
  - [ ] Update: position changes
- [ ] Real-time subscription
  - [ ] Live note updates
  - [ ] Conflict resolution

### Phase 6: Visual Language & Polish
- [ ] Color palette
  - [ ] Primary colors (3-4)
  - [ ] Accent colors (2)
  - [ ] Neutral tones
- [ ] Typography
  - [ ] 3 custom fonts
  - [ ] Consistent hierarchy
- [ ] Animations
  - [ ] Note appearance (scale + fade)
  - [ ] Menu transitions
  - [ ] Canvas breathing
  - [ ] Hover states
- [ ] UI elements
  - [ ] Custom cursor
  - [ ] Subtle gradients
  - [ ] Rounded corners
  - [ ] Depth (shadows/layers)

### Phase 7: Performance Optimization
- [ ] Canvas rendering
  - [ ] Batch updates
  - [ ] Dirty rectangle redraw
- [ ] Asset management
  - [ ] Sprite sheets
  - [ ] Image compression
- [ ] Event handling
  - [ ] Debouncing
  - [ ] Throttling
- [ ] Memory management
  - [ ] Cleanup routines
  - [ ] Resource disposal

### Phase 8: User Experience Enhancements
- [ ] Onboarding
  - [ ] Subtle first-use hints
  - [ ] Tool tips
- [ ] Feedback
  - [ ] Note saving indicator
  - [ ] Error states
- [ ] Navigation
  - [ ] Home position button
  - [ ] Zoom level indicator

### Phase 9: Testing & Refinement
- [ ] Cross-browser testing
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
- [ ] Device testing
  - [ ] Desktop
  - [ ] Tablet
  - [ ] Mobile (view-only)
- [ ] Edge cases
  - [ ] Canvas bounds
  - [ ] Note overlap
  - [ ] Database failures
- [ ] Performance testing
  - [ ] Load time
  - [ ] Frame rate
  - [ ] Memory usage

### Phase 10: Deployment
- [ ] Hosting setup
  - [ ] Static file hosting
  - [ ] Supabase configuration
- [ ] Final validation
  - [ ] Data persistence
  - [ ] Real-time updates
- [ ] Launch checklist
  - [ ] Error monitoring
  - [ ] Backup system
  - [ ] Documentation

## Development Notes
- Current focus: Phase 1 - Project Setup
- Next steps: Create basic file structure and set up Supabase client
- Design considerations: Keep UI clean and intuitive with Wii-like polish
- Performance priorities: Optimize canvas rendering and minimize DOM manipulation

## Technical Decisions
- Using vanilla JavaScript with ES6+ syntax
- Implementing normalized coordinates (0-1 range) for future-proof positioning
- Using requestAnimationFrame for all animations
- Implementing debounce/throttle for event listeners

