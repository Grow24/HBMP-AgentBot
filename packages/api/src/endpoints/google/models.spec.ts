import {
  DEFAULT_GOOGLE_MODEL,
  isGemini3Model,
  isGoogleModelAllowed,
  resolveGoogleModel,
  shouldEnableGoogleThoughtStreaming,
} from './models';

describe('resolveGoogleModel', () => {
  it('defaults empty values to the current flash model', () => {
    expect(resolveGoogleModel()).toBe(DEFAULT_GOOGLE_MODEL);
    expect(resolveGoogleModel('')).toBe(DEFAULT_GOOGLE_MODEL);
    expect(resolveGoogleModel(null)).toBe(DEFAULT_GOOGLE_MODEL);
  });

  it('remaps retired Gemini 2.5 chat models', () => {
    expect(resolveGoogleModel('gemini-2.5-flash')).toBe(DEFAULT_GOOGLE_MODEL);
    expect(resolveGoogleModel('models/gemini-2.5-flash')).toBe(DEFAULT_GOOGLE_MODEL);
    expect(resolveGoogleModel('gemini-2.5-flash-lite')).toBe('gemini-3.5-flash-lite');
    expect(resolveGoogleModel('gemini-2.5-pro')).toBe(DEFAULT_GOOGLE_MODEL);
  });

  it('remaps retired Gemini 2.0 chat models', () => {
    expect(resolveGoogleModel('gemini-2.0-flash')).toBe(DEFAULT_GOOGLE_MODEL);
    expect(resolveGoogleModel('gemini-2.0-flash-001')).toBe(DEFAULT_GOOGLE_MODEL);
  });

  it('leaves current and non-chat models unchanged', () => {
    expect(resolveGoogleModel('gemini-3.6-flash')).toBe('gemini-3.6-flash');
    expect(resolveGoogleModel('gemini-3.8-flash')).toBe('gemini-3.8-flash');
    expect(resolveGoogleModel('gemini-2.5-flash-preview-image')).toBe(
      'gemini-2.5-flash-preview-image',
    );
    expect(resolveGoogleModel('gemini-2.5-flash-preview-tts')).toBe('gemini-2.5-flash-preview-tts');
  });
});

describe('isGoogleModelAllowed', () => {
  const available = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];

  it('accepts listed models and remapped retired chat models', () => {
    expect(isGoogleModelAllowed('gemini-3.6-flash', available)).toBe(true);
    expect(isGoogleModelAllowed('gemini-2.5-flash', available)).toBe(true);
    expect(isGoogleModelAllowed('gemini-2.5-flash-lite', available)).toBe(true);
  });

  it('rejects unknown models', () => {
    expect(isGoogleModelAllowed('not-a-model', available)).toBe(false);
    expect(isGoogleModelAllowed('gemini-2.5-flash', [])).toBe(false);
  });
});

describe('Gemini 3 thought streaming', () => {
  it('detects Gemini 3 models', () => {
    expect(isGemini3Model('gemini-3.6-flash')).toBe(true);
    expect(isGemini3Model('gemini-3.5-flash-lite')).toBe(true);
    expect(isGemini3Model('gemini-2.5-flash')).toBe(false);
  });

  it('disables thought streaming for Gemini 3 because the legacy SDK cannot parse it', () => {
    expect(shouldEnableGoogleThoughtStreaming('gemini-3.6-flash')).toBe(false);
    expect(shouldEnableGoogleThoughtStreaming('gemini-3.8-flash')).toBe(false);
    expect(shouldEnableGoogleThoughtStreaming('gemini-2.5-flash')).toBe(true);
  });
});
