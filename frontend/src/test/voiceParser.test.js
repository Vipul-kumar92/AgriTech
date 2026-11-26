import { describe, it, expect } from 'vitest';
import { parseAgriVoiceTranscript } from '../utils/voiceParser';

const CATEGORIES = {
  crops: ['Rice', 'Wheat', 'Maize', 'Cotton(lint)', 'Sugarcane', 'Groundnut'],
  states: ['Punjab', 'Uttar Pradesh', 'Maharashtra', 'Haryana'],
  seasons: ['Kharif', 'Rabi', 'Summer', 'Whole Year'],
};

describe('parseAgriVoiceTranscript', () => {
  it('extracts English crop, state, season, area, and rainfall parameters', () => {
    const { updates } = parseAgriVoiceTranscript('50 hectare Rice Punjab Kharif 1100 mm', CATEGORIES);
    expect(updates.crop).toBe('Rice');
    expect(updates.state).toBe('Punjab');
    expect(updates.season).toBe('Kharif');
    expect(updates.area).toBe(50);
    expect(updates.annual_rainfall).toBe(1100);
  });

  it('extracts Hindi aliases and converts acres into hectares', () => {
    const { updates } = parseAgriVoiceTranscript('5 एकड़ गेहूं उत्तर प्रदेश रबी 700 mm 500 kg खाद', CATEGORIES);
    expect(updates.crop).toBe('Wheat');
    expect(updates.state).toBe('Uttar Pradesh');
    expect(updates.season).toBe('Rabi');
    expect(updates.area).toBeCloseTo(2.02, 1);
    expect(updates.annual_rainfall).toBe(700);
    expect(updates.fertilizer).toBe(500);
  });
});
