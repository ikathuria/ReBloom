import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { type ConsentState, initialConsent, markDecided, setConsent } from '@/features/privacy/consent';
import { useSkin } from '@/lib/skins';
import { TRACKS_META, TRACK_IDS, type TrackId } from '@/lib/tracks';
import { BLOOM, onboardingCopy as C } from './copy';
import { PrimaryButton } from './PrimaryButton';
import { SelectRow } from './SelectRow';

export interface OnboardingResult {
  consent: ConsentState;
  trackIds: TrackId[];
}

type Step = 'welcome' | 'consent' | 'tracks';
const STEP_INDEX: Record<Step, number> = { welcome: 0, consent: 1, tracks: 2 };

export interface OnboardingFlowProps {
  onComplete: (result: OnboardingResult) => void;
  /**
   * How many journeys the user may start now (free = 1; Pro = unlimited). At the cap, tapping a
   * new journey when only one is allowed *switches* to it; otherwise extra taps are ignored.
   * Defaults to unlimited.
   */
  maxTracks?: number;
}

/** Three-step first-run flow: welcome → consent → choose journeys. Pure UI; persistence is the caller's job. */
export function OnboardingFlow({ onComplete, maxTracks = Infinity }: OnboardingFlowProps) {
  const scheme = useColorScheme();
  const { skin } = useSkin();
  const [step, setStep] = useState<Step>('welcome');
  const [consent, setConsentState] = useState<ConsentState>(initialConsent);
  const [selected, setSelected] = useState<Set<TrackId>>(new Set());

  const toggleTrack = (id: TrackId) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < maxTracks) {
        next.add(id);
      } else if (maxTracks === 1) {
        // Single-journey (free): tapping another swaps the selection.
        return new Set([id]);
      }
      return next;
    });

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        {step === 'welcome' && (
          <Panel
            step={STEP_INDEX.welcome}
            title={C.welcome.title}
            body={C.welcome.body}
            footer={<PrimaryButton testID="welcome-start" label={C.welcome.cta} onPress={() => setStep('consent')} />}
          >
            <ThemedText style={styles.bloomMark}>🌱</ThemedText>
          </Panel>
        )}

        {step === 'consent' && (
          <Panel
            step={STEP_INDEX.consent}
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
            step={STEP_INDEX.tracks}
            title={C.tracks.title}
            body={C.tracks.body}
            footer={
              <>
                {Number.isFinite(maxTracks) && (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.footerNote}>
                    {C.tracks.freeNote}
                  </ThemedText>
                )}
                <PrimaryButton
                  testID="tracks-done"
                  label={C.tracks.cta(selected.size)}
                  disabled={selected.size === 0}
                  onPress={() => onComplete({ consent, trackIds: [...selected] })}
                />
              </>
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
                  emoji={skin.trackEmoji[id]}
                  hue={skin.hues[scheme === 'dark' ? 'dark' : 'light'][id]}
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

function Dots({ step }: { step: number }) {
  const theme = useTheme();
  return (
    <View style={styles.dots} accessible accessibilityLabel={`Step ${step + 1} of 3`}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i === step ? BLOOM : theme.line },
            i === step && styles.dotOn,
          ]}
        />
      ))}
    </View>
  );
}

function Panel({
  step,
  title,
  body,
  children,
  footer,
}: {
  step: number;
  title: string;
  body: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <View style={styles.panel}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Dots step={step} />
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
  scroll: { paddingTop: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.four },
  body: { lineHeight: 22 },
  rows: { gap: Spacing.two, marginTop: Spacing.two },
  footer: { gap: Spacing.two, paddingVertical: Spacing.three },
  footerNote: { lineHeight: 18 },
  bloomMark: { fontSize: 72, textAlign: 'center', marginTop: Spacing.four },
  dots: { flexDirection: 'row', gap: 6, marginBottom: Spacing.one },
  dot: { width: 8, height: 8, borderRadius: Radius.pill },
  dotOn: { width: 24 },
});
