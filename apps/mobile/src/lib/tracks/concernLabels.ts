// Friendly, encouraging labels for YouCam concern keys. Framed so higher = better (ui_scores
// are 1..100, higher = healthier), matching the bloom direction. Not diagnostic language.

const CONCERN_LABELS: Record<string, string> = {
  hd_moisture: 'Hydration',
  hd_redness: 'Calm skin',
  hd_radiance: 'Radiance',
  hd_texture: 'Smooth texture',
  hd_age_spot: 'Even tone',
  hd_acne: 'Clear skin',
  hd_oiliness: 'Balanced oil',
  hd_pore: 'Refined pores',
  hd_dark_circle: 'Bright under-eyes',
  hd_eye_bag: 'Rested eyes',
  hd_tear_trough: 'Smooth under-eye',
  hair_density: 'Hair density',
};

export const concernLabel = (key: string): string => CONCERN_LABELS[key] ?? key;
