/** Default chat model for new Google Gemini requests. */
export const DEFAULT_GOOGLE_MODEL = 'gemini-3.6-flash';

/**
 * Gemini 2.5 / 2.0 / 1.5 chat models are blocked for new API projects.
 * Google's replacement for 2.0 Flash is 3.6 Flash; 2.5 Flash-Lite maps to 3.5 Flash-Lite.
 * Image, TTS, and Live/audio models are left unchanged.
 */
const RETIRED_GOOGLE_MODEL_MAP: Record<string, string> = {
  'gemini-2.5-flash': DEFAULT_GOOGLE_MODEL,
  'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
  'gemini-2.5-pro': DEFAULT_GOOGLE_MODEL,
  'gemini-2.5-flash-preview-04-17': DEFAULT_GOOGLE_MODEL,
  'gemini-2.5-pro-preview-05-06': DEFAULT_GOOGLE_MODEL,
  'gemini-2.0-flash': DEFAULT_GOOGLE_MODEL,
  'gemini-2.0-flash-001': DEFAULT_GOOGLE_MODEL,
  'gemini-2.0-flash-lite': DEFAULT_GOOGLE_MODEL,
  'gemini-2.0-flash-exp': DEFAULT_GOOGLE_MODEL,
  'gemini-1.5-flash': DEFAULT_GOOGLE_MODEL,
  'gemini-1.5-flash-8b': DEFAULT_GOOGLE_MODEL,
  'gemini-1.5-pro': DEFAULT_GOOGLE_MODEL,
  'gemini-1.5-pro-latest': DEFAULT_GOOGLE_MODEL,
  'gemini-pro': DEFAULT_GOOGLE_MODEL,
  'gemini-pro-vision': DEFAULT_GOOGLE_MODEL,
};

const NON_CHAT_RETIRED_MODEL = /image|tts|audio|computer-use|live/;

/**
 * Maps retired Gemini chat model IDs to a currently available model.
 * Unknown or already-current IDs are returned as-is.
 */
export function resolveGoogleModel(model?: string | null): string {
  if (typeof model !== 'string' || !model.trim()) {
    return DEFAULT_GOOGLE_MODEL;
  }

  const normalized = model.replace(/^models\//i, '').trim();
  const mapped = RETIRED_GOOGLE_MODEL_MAP[normalized];
  if (mapped) {
    return mapped;
  }

  if (NON_CHAT_RETIRED_MODEL.test(normalized)) {
    return normalized;
  }

  if (/^gemini-2\.5-flash-lite(?:-preview)?/.test(normalized)) {
    return 'gemini-3.5-flash-lite';
  }

  if (/^gemini-2\.(5|0)-(flash|pro)/.test(normalized) || /^gemini-1\.5-/.test(normalized)) {
    return DEFAULT_GOOGLE_MODEL;
  }

  return normalized;
}

/** True when the requested model is listed, or remaps to a listed Google model. */
export function isGoogleModelAllowed(model: string, availableModels: string[] = []): boolean {
  if (!model || !availableModels.length) {
    return false;
  }

  if (availableModels.includes(model)) {
    return true;
  }

  const resolved = resolveGoogleModel(model);
  return availableModels.includes(resolved);
}

export function isGemini3Model(model?: string | null): boolean {
  return typeof model === 'string' && /gemini-3/i.test(model);
}

/**
 * Gemini 3 streams thought signatures that @google/generative-ai 0.24 cannot parse
 * ("Failed to parse stream"). Gemini 3 also rejects thinking_budget in favor of thinking_level.
 */
export function shouldEnableGoogleThoughtStreaming(model?: string | null): boolean {
  return !isGemini3Model(model);
}

