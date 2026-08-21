// YouCam AI Hair Density Detection returns a coarse 4-grade classification of scalp exposure
// (1 = most exposed / least dense … 4 = densest). Hair regrows slowly, so this is deliberately
// a COARSE, STABLE signal: one grade = one gentle step, and we never show a demoralizing near-zero.

const GRADE_TO_BLOOM: Record<number, number> = { 1: 45, 2: 62, 3: 78, 4: 92 };

export function hairBloom(grade: number): number {
  const g = Math.max(1, Math.min(4, Math.round(grade)));
  return GRADE_TO_BLOOM[g];
}
