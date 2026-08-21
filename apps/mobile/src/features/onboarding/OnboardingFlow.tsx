import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { type ConsentState, initialConsent, markDecided, setConsent } from '@/features/privacy/consent';
import { TRACKS_META, TRACK_IDS, type TrackId } from '@/lib/tracks';
import { onboardingCopy as C } from './copy';
import { PrimaryButton } from './PrimaryButton';
import { SelectRow } from './SelectRow';

export interface OnboardingResult {
  consent: ConsentState;
  trackIds: TrackId[];
}

type Step = 'welcome' | 'consent' | 'tracks';

export interface OnboardingFlowProps {
  onComplete: (result: OnboardingResult) => void;
}

/** Three-step first-run flow: welcome → consent → choose journeys. Pure UI; persistence is the caller's job. */
export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [consent, setConsentState] = useState<ConsentState>(initialConsent);
  const [selected, setSelected] = useState<Set<TrackId>>(new Set());

  const toggleTrack = (id: TrackId) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        {step === 'welcome' && (
          <Panel
            title={C.welcome.title}
            body={C.welcome.body}
            footer={
              <PrimaryButton testID="welcome-start" label={C.welcome.cta} onPress={() => setStep('consent')} />
            }
          >
            <ThemedText style={styles.bloomMark}>🌱</ThemedText>
          </Panel>
        )}

        {step === 'consent' && (
          <Panel
            title={C.consent.title}
            body={C.consent.body}
            footer={
              <>
                <ThemedText type="small" themeColor="textSecondary" style={styles.footerNote}>
                  {C.consent.footer}
                </ThemedText>
                <PrimaryButton
                  testID="consent-continue"
                  label={C.consent.cta}
                  onPress={() => {
                    setConsentState((s) => markDecided(s));
                    setStep('tracks');
                  }}
                />
              </>
            }
          >
            <SelectRow
              testID="consent-capture"
              title={C.consent.capture.label}
              help={C.consent.capture.help}
              selected={consent.capture}
              onPress={() => setConsentState((s) => setConsent(s, 'capture', !s.capture))}
            />
            <SelectRow
              testID="consent-analysis"
              title={C.consent.analysis.label}
              help={C.consent.analysis.help}
              selected={consent.analysis}
              onPress={() => setConsentState((s) => setConsent(s, 'analysis', !s.analysis))}
            />
          </Panel>
        )}

        {step === 'tracks' && (
          <Panel
            title={C.tracks.title}
            body={C.tracks.body}
            footer={
              <PrimaryButton
                testID="tracks-done"
                label={C.tracks.cta(selected.size)}
                disabled={selected.size === 0}
                onPress={() => onComplete({ consent, trackIds: [...selected] })}
              />
            }
          >
            {TRACK_IDS.map((id) => {
              const meta = TRACKS_META[id];
              return (
                <SelectRow
                  key={id}
                  testID={`track-${id}`}
                  title={meta.sensitive ? `${meta.name}  ·  private` : meta.name}
                  help={meta.blurb}
                  selected={selected.has(id)}
                  onPress={() => toggleTrack(id)}
                />
              );
            })}
          </Panel>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function Panel({
  title,
  body,
  children,
  footer,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <View style={styles.panel}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemedText type="title">{title}</ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
          {body}
        </ThemedText>
        <View style={styles.rows}>{children}</View>
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  panel: { flex: 1, paddingHorizontal: Spacing.four },
  scroll: { paddingTop: Spacing.five, gap: Spacing.three, paddingBottom: Spacing.four },
  body: { lineHeight: 22 },
  rows: { gap: Spacing.two, marginTop: Spacing.two },
  footer: { gap: Spacing.two, paddingVertical: Spacing.three },
  footerNote: { lineHeight: 18 },
  bloomMark: { fontSize: 64, textAlign: 'center', marginTop: Spacing.four },
});
