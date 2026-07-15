// BYOK key handling — mirrors mos-seo (§0 audit): stored ONLY in sessionStorage,
// never sent to any Start-X server. Cleared when the tab closes.
const STORAGE_KEY = "mos-creative-ai-keys";

export interface AiKeys {
  gemini?: string;
}

export function loadAiKeys(): AiKeys {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AiKeys) : {};
  } catch {
    return {};
  }
}

export function saveAiKeys(keys: AiKeys): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function hasGeminiKey(): boolean {
  return Boolean(loadAiKeys().gemini);
}
