// Browser persistence for game state. Reads happen after mount so the server
// render and the first client render match (avoids hydration mismatches).

export const STORAGE_KEY = 'yahtzeeState';

export function loadSaved<T>(key = STORAGE_KEY): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    // Missing storage or corrupt JSON: start fresh rather than crash.
    console.error('Failed to read saved game', error);
    return null;
  }
}

export function save<T>(value: T, key = STORAGE_KEY) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage full or blocked (e.g. private mode); the game still works in memory.
    console.error('Failed to save game', error);
  }
}
