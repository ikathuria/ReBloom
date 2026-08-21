import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useOnboardingGate } from '@/features/onboarding';

// Gate the whole tab UI: first-run users are sent to the full-screen /onboarding route
// BEFORE the native tab bar mounts (so it never flashes during onboarding).
export default function TabsLayout() {
  const { status } = useOnboardingGate();
  if (status === 'loading') return null;
  if (status === 'needed') return <Redirect href="/onboarding" />;
  return <AppTabs />;
}
