// Warm, centralized onboarding copy (kept out of components so it's easy to tune + test).
// Voice: gentle, encouraging, plain-spoken. Never clinical, never accusatory. See docs/02.

export const onboardingCopy = {
  welcome: {
    title: 'Watch yourself heal',
    body: 'Real healing — recovery, clearer skin, new hair — is slow and easy to miss. ReBloom turns it into something you can see: a gentle scan, and a bloom that grows as you do.',
    cta: 'Get started',
  },
  consent: {
    title: 'Your healing stays yours',
    body: 'Before anything, here is the deal — in plain words.',
    capture: {
      label: 'Take or choose a photo',
      help: 'ReBloom uses your camera or photo library for a scan. You choose each time.',
    },
    analysis: {
      label: 'Analyze my photo',
      help: 'Your photo is sent once to score your skin, then it is gone — we keep the numbers, never the picture.',
    },
    footer:
      'Everything stays on your device unless you turn on sync later. ReBloom is for encouragement — not medical advice, not detecting anything, never monitoring you.',
    cta: 'Continue',
  },
  tracks: {
    title: 'Choose your journey',
    body: 'Pick what you would like to follow. You can change it anytime.',
    freeNote: 'ReBloom is free for one journey. Add every journey later with Pro.',
    cta: (n: number) =>
      n === 0 ? 'Pick at least one' : n === 1 ? 'Start my garden' : `Start my garden (${n})`,
  },
} as const;

/** ReBloom accent — a hopeful bloom green. Mirrors `Colors.light.bloom` for non-themed accents. */
export const BLOOM = '#2FA36B';
/** Deeper green that reads on the warm paper ground (shadows, emphasis). */
export const BLOOM_DEEP = '#1E7A4E';
