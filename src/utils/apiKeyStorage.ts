/**
 * Utility for persisting and retrieving user's personal Google Gemini API Key
 * Allows users to activate Nano Banana Pro / Gemini Image generation without hitting shared server quota limits.
 */

const STORAGE_KEY = 'nep_user_gemini_api_key';

export function getSavedGeminiApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveGeminiApiKey(key: string): void {
  try {
    const cleanKey = key.trim();
    if (cleanKey) {
      localStorage.setItem(STORAGE_KEY, cleanKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore local storage restrictions
  }
}

export function clearGeminiApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasSavedGeminiApiKey(): boolean {
  const key = getSavedGeminiApiKey();
  return Boolean(key && key.length > 15 && key.startsWith('AIza'));
}
