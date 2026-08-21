import { router } from 'expo-router';

import { OnboardingFlow, useOnboardingGate } from '@/features/onboarding';

// Full-screen first-run route (a Stack sibling of the (tabs) group, so no tab bar).
export default function OnboardingScreen() {
  const { complete } = useOnboardingGate();
  return (
    <OnboardingFlow
      onComplete={async (result) => {
        await complete(result);
        router.replace('/');
      }}
    />
  );
}
