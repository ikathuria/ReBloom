import { router } from 'expo-router';

import { OnboardingFlow, useOnboardingGate } from '@/features/onboarding';
import { maxTracks, useTier } from '@/lib/purchases';

// Full-screen first-run route (a Stack sibling of the (tabs) group, so no tab bar).
export default function OnboardingScreen() {
  const { complete } = useOnboardingGate();
  const { tier } = useTier();
  return (
    <OnboardingFlow
      maxTracks={maxTracks(tier)}
      onComplete={async (result) => {
        await complete(result);
        router.replace('/');
      }}
    />
  );
}
