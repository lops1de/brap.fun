/**
 * db.js - Database operations for the Bulletin Board application
 * Handles all Supabase interactions for CRUD operations on notes
 */

// Initialize Supabase client
let supabase;

/**
 * Initialize the Supabase client
 */
function initSupabase() {
    // Create Supabase client
    supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    console.log('Supabase client initialized');
}

/**
 * Load all notes from the database
 * @returns {Promise<Array>} Array of notes
 */
async function loadNotesFromDB() {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('Error loading notes:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in loadNotesFromDB:', error);
        return [];
    }
}

/**
 * Create a new note in the database
 * @param {Object} note - The note to create
 * @returns {Promise<Object>} The created note with ID
 */
async function createNoteInDB(note) {
    try {
        const { data, error } = await supabase
            .from('notes')
            .insert([note])
            .select();
        
        if (error) {
            console.error('Error creating note:', error);
            return null;
        }
        
        return data[0];
    } catch (error) {
        console.error('Error in createNoteInDB:', error);
        return null;
    }
}

/**
 * Update an existing note in the database
 * @param {string} id - The note ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} The updated note
 */
async function updateNoteInDB(id, updates) {
    try {
        const { data, error } = await supabase
            .from('notes')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Error updating note:', error);
            return null;
        }
        
        return data[0];
    } catch (error) {
        console.error('Error in updateNoteInDB:', error);
        return null;
    }
}

/**
 * Delete a note from the database
 * @param {string} id - The note ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteNoteFromDB(id) {
    try {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting note:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error in deleteNoteFromDB:', error);
        return false;
    }
}

/**
 * Set up real-time subscription for note changes
 * @param {Function} callback - Function to call when notes change
 */
function setupRealtimeSubscription(callback) {
    try {
        const subscription = supabase
            .channel('notes_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'notes' }, 
                (payload) => {
                    console.log('Realtime change received:', payload);
                    callback(payload);
                }
            )
            .subscribe();
        
        return subscription;
    } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        return null;
    }
}

// Expose functions to window
window.initSupabase = initSupabase;
window.loadNotesFromDB = loadNotesFromDB;
window.createNoteInDB = createNoteInDB;
window.updateNoteInDB = updateNoteInDB;
window.deleteNoteFromDB = deleteNoteFromDB;
window.setupRealtimeSubscription = setupRealtimeSubscription; 