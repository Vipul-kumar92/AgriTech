import { describe, it, expect } from 'vitest';
import { buildFarmingAdvisory, calculateSoilHealthPrescription } from '../utils/farmingAdvisory';

describe('farmingAdvisory utilities', () => {
  it('computes commercial Urea/DAP/MOP split and bags for cereals', () => {
    const res = buildFarmingAdvisory({
      crop: 'Rice',
      season: 'Kharif',
      area: 4,
      fertilizerKg: 600,
      isHindi: false,
    });

    const ureaSum = res.splitStages.reduce((acc, s) => acc + s.ureaKg, 0);
    const dapSum = res.splitStages.reduce((acc, s) => acc + s.dapKg, 0);
    const mopSum = res.splitStages.reduce((acc, s) => acc + s.mopKg, 0);

    expect(ureaSum).toBe(res.totalUreaKg);
    expect(dapSum).toBe(res.totalDapKg);
    expect(mopSum).toBe(res.totalMopKg);
    expect(res.splitStages).toHaveLength(3);
    expect(res.sowingWindow).toContain('June');
    expect(res.irrigationStages.length).toBeGreaterThanOrEqual(3);
  });

  it('reduces top-dressed urea for nitrogen-fixing pulse crops', () => {
    const res = buildFarmingAdvisory({
      crop: 'Gram',
      season: 'Rabi',
      area: 2,
      fertilizerKg: 150,
      isHindi: true,
    });

    expect(res.splitStages).toHaveLength(2);
    expect(res.cropCategory).toContain('दलहन');
  });

  it('calculates Soil Health Card statuses, fertilizer bags, and pH Lime/Gypsum amendments', () => {
    const acidic = calculateSoilHealthPrescription({
      crop: 'Wheat',
      area: 4,
      predictedYield: 4.2,
      soilN: 190,
      soilP: 8,
      soilK: 95,
      soilPh: 5.3,
      organicCarbon: 0.41,
    });

    expect(acidic.statuses.n.code).toBe('LOW');
    expect(acidic.statuses.p.code).toBe('LOW');
    expect(acidic.statuses.k.code).toBe('LOW');
    expect(acidic.statuses.ph.code).toBe('STRONGLY_ACIDIC');
    expect(acidic.amendment?.type).toBe('LIME');
    expect(acidic.ureaBags45Kg).toBeGreaterThan(0);
    expect(acidic.dapBags50Kg).toBeGreaterThan(0);

    const sodic = calculateSoilHealthPrescription({
      crop: 'Rice',
      area: 2,
      predictedYield: 4.0,
      soilN: 340,
      soilP: 18,
      soilK: 210,
      soilPh: 8.6,
      organicCarbon: 0.6,
    });

    expect(sodic.statuses.ph.code).toBe('SODIC');
    expect(sodic.amendment?.type).toBe('GYPSUM');
  });
});
