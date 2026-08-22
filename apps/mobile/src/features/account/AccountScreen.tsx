import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { BLOOM } from '@/features/onboarding/copy';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';
import { canCustomizeEmojis, useTier } from '@/lib/purchases';
import { EMOJI_PALETTE, SKINS, SKIN_IDS, STAGE_LABELS, STAGE_ORDER, useSkin, type StageKey } from '@/lib/skins';
import {
  buildExport,
  deleteAllData,
  NOT_MEDICAL,
  serializeExport,
} from '@/features/privacy';
import { getDb } from '@/lib/db';
import {
  deleteCloudData,
  getSupabase,
  isSupabaseConfigured,
  isSyncEnabled,
  pushToCloud,
  setSyncEnabled,
  signInEmail,
  signOut,
  signUpEmail,
  useAuth,
} from '@/lib/supabase';

export default function AccountScreen() {
  const auth = useAuth();

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <Pressable testID="account-back" onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <ThemedText style={[styles.backText, { color: BLOOM }]}>‹ Garden</ThemedText>
        </Pressable>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <ThemedText type="title">Account & sync</ThemedText>

          {!auth.configured ? (
            <ThemedText type="default" themeColor="textSecondary" style={styles.p}>
              Cloud sync isn’t set up in this build. Your data stays safely on this device.
            </ThemedText>
          ) : auth.session ? (
            <SignedIn email={auth.email} />
          ) : (
            <SignedOut />
          )}

          <Appearance />

          <DataRights signedIn={Boolean(auth.session)} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SignedOut() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (mode: 'in' | 'up') => {
    setBusy(true);
    setError(null);
    const { error } = mode === 'in' ? await signInEmail(email.trim(), password) : await signUpEmail(email.trim(), password);
    setBusy(false);
    if (error) setError(error.message);
  };

  const input = [styles.input, { borderColor: theme.backgroundSelected, color: theme.text }];
  return (
    <View style={styles.form}>
      <ThemedText type="default" themeColor="textSecondary" style={styles.p}>
        An account is optional — it lets you back up your journeys privately. The app works fully
        without one.
      </ThemedText>
      <TextInput
        testID="account-email"
        style={input}
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        testID="account-password"
        style={input}
        placeholder="Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <ThemedText type="small" style={{ color: '#c0392b' }}>{error}</ThemedText> : null}
      <PrimaryButton testID="account-signin" label={busy ? 'Working…' : 'Sign in'} onPress={() => run('in')} />
      <Pressable testID="account-signup" onPress={() => run('up')} accessibilityRole="button" style={styles.linkBtn}>
        <ThemedText style={[styles.linkText, { color: BLOOM }]}>Create an account</ThemedText>
      </Pressable>
    </View>
  );
}

function SignedIn({ email }: { email: string | null }) {
  const theme = useTheme();
  const [sync, setSync] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    getDb().then(isSyncEnabled).then(setSync);
  }, []);

  async function toggleSync(on: boolean) {
    setSync(on);
    const db = await getDb();
    await setSyncEnabled(db, on);
    if (on) {
      setStatus('Backing up…');
      try {
        const r = await pushToCloud(db, getSupabase());
        setStatus(r.synced ? `Backed up ${r.points} scan point(s).` : 'Sign in to back up.');
      } catch {
        setStatus('Backup failed — will retry later.');
      }
    } else {
      setStatus(null);
    }
  }

  return (
    <View style={styles.form}>
      <ThemedText type="default" themeColor="textSecondary" style={styles.p}>
        Signed in as {email}
      </ThemedText>

      <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.rowText}>
          <ThemedText type="smallBold">Back up to my account</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.p}>
            Encrypts and syncs your scores — never your photos. Off by default; turn it off anytime.
          </ThemedText>
        </View>
        <Switch
          testID="account-sync"
          value={sync}
          onValueChange={toggleSync}
          trackColor={{ true: BLOOM }}
          accessibilityLabel="Back up my scores to my account"
        />
      </View>
      {status ? <ThemedText type="small" themeColor="textSecondary">{status}</ThemedText> : null}

      <Pressable testID="account-signout" onPress={() => signOut()} accessibilityRole="button" style={styles.linkBtn}>
        <ThemedText style={[styles.linkText, { color: BLOOM }]}>Sign out</ThemedText>
      </Pressable>
    </View>
  );
}

function Appearance() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const { tier } = useTier();
  const pro = canCustomizeEmojis(tier);
  const { skin, skinId, setSkin, customEmoji, setCustomEmoji } = useSkin();

  return (
    <View style={styles.appearance}>
      <ThemedText type="smallBold">Garden style</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.p}>
        Pick the look that feels like yours. It changes how your garden looks — nothing else.
      </ThemedText>
      <View style={styles.skinRow}>
        {SKIN_IDS.map((id) => {
          const s = SKINS[id];
          const selected = id === skinId;
          const locked = id === 'custom' && !pro;
          // A tiny growth preview in this skin's own colors, so the card sells the vibe.
          const preview = s.hues[dark ? 'dark' : 'light'].recovery;
          // For the Custom card, preview the user's own picks.
          const pv = id === 'custom' ? customEmoji : s.stageEmoji;
          return (
            <Pressable
              key={id}
              testID={`skin-${id}`}
              onPress={() => (locked ? router.push('/paywall') : setSkin(id))}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${s.name} garden style${locked ? ', Pro' : ''}`}
              style={[
                styles.skinCard,
                { backgroundColor: preview.bg, borderColor: selected ? BLOOM : 'transparent' },
              ]}
            >
              <ThemedText style={styles.skinEmojis}>
                {pv.sprout}
                {pv.bloom}
                {pv.full}
              </ThemedText>
              <ThemedText style={[styles.skinName, { color: preview.ink }]}>{s.name}</ThemedText>
              <ThemedText style={[styles.skinBlurb, { color: preview.ink }]} numberOfLines={2}>
                {locked ? '🔒 Pro' : s.blurb}
              </ThemedText>
              <View style={[styles.skinCheck, { borderColor: selected ? BLOOM : theme.line }, selected && { backgroundColor: BLOOM }]}>
                {selected ? <ThemedText style={styles.skinTick}>✓</ThemedText> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {skinId === 'custom' && pro && (
        <EmojiEditor customEmoji={customEmoji} onPick={setCustomEmoji} accent={skin.hues[dark ? 'dark' : 'light'].recovery.ink} />
      )}
    </View>
  );
}

function EmojiEditor({
  customEmoji,
  onPick,
  accent,
}: {
  customEmoji: Record<StageKey, string>;
  onPick: (stage: StageKey, emoji: string) => void;
  accent: string;
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState<StageKey>('bloom');

  return (
    <View style={[styles.editor, { backgroundColor: theme.card, borderColor: theme.line }]}>
      <ThemedText type="smallBold">Your growth emojis</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.p}>
        Tap a stage, then pick an emoji. Your garden grows through these as your bloom climbs.
      </ThemedText>

      <View style={styles.stageRow}>
        {STAGE_ORDER.map((stage) => {
          const on = stage === focused;
          return (
            <Pressable
              key={stage}
              testID={`stage-${stage}`}
              onPress={() => setFocused(stage)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${STAGE_LABELS[stage]}, current emoji ${customEmoji[stage]}`}
              style={[styles.stageChip, { borderColor: on ? BLOOM : theme.line, backgroundColor: on ? theme.bloomSoft : 'transparent' }]}
            >
              <ThemedText style={styles.stageEmoji}>{customEmoji[stage]}</ThemedText>
              <ThemedText style={[styles.stageLabel, { color: on ? accent : theme.textSecondary }]} numberOfLines={1}>
                {STAGE_LABELS[stage]}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.palette}>
        {EMOJI_PALETTE.map((emoji) => (
          <Pressable
            key={emoji}
            testID={`palette-${emoji}`}
            onPress={() => onPick(focused, emoji)}
            accessibilityRole="button"
            accessibilityLabel={`Set ${STAGE_LABELS[focused]} to ${emoji}`}
            style={({ pressed }) => [styles.paletteCell, { borderColor: theme.line }, pressed && { backgroundColor: theme.bloomSoft }]}
          >
            <ThemedText style={styles.paletteEmoji}>{emoji}</ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function DataRights({ signedIn }: { signedIn: boolean }) {
  const theme = useTheme();
  const [busy, setBusy] = useState(false);

  async function exportData() {
    setBusy(true);
    try {
      const db = await getDb();
      const json = serializeExport(await buildExport(db));
      await Share.share({ title: 'My ReBloom data', message: json });
    } catch {
      // Share was dismissed or failed — nothing to persist, safe to ignore.
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete everything?',
      `This erases every journey and scan on this device${
        signedIn ? ' and any synced copy in your account' : ''
      }. This can’t be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: deleteEverything },
      ],
    );
  }

  async function deleteEverything() {
    setBusy(true);
    try {
      const db = await getDb();
      const cloud =
        signedIn && isSupabaseConfigured ? () => deleteCloudData(db, getSupabase()) : undefined;
      await deleteAllData(db, cloud);
      if (signedIn && isSupabaseConfigured) await signOut();
      router.replace('/'); // local is wiped → the first-run gate takes over
    } catch {
      setBusy(false);
      Alert.alert('That didn’t finish', 'Some data may remain. Please try again.');
    }
  }

  return (
    <View style={styles.dataRights}>
      <ThemedText type="smallBold">Your data</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.p}>
        Take everything with you, or erase it completely. {NOT_MEDICAL}
      </ThemedText>
      <PrimaryButton testID="data-export" label={busy ? 'Working…' : 'Export my data'} variant="secondary" onPress={exportData} disabled={busy} />
      <Pressable testID="data-delete" onPress={confirmDelete} disabled={busy} accessibilityRole="button" style={styles.deleteBtn}>
        <ThemedText style={[styles.deleteText, { color: theme.text }]}>Delete everything</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  back: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  backText: { fontFamily: Fonts.display, fontSize: 16 },
  body: { paddingHorizontal: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.five },
  p: { lineHeight: 20 },
  appearance: { marginTop: Spacing.four, gap: Spacing.two },
  skinRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  skinCard: {
    width: '48%',
    borderRadius: Radius.md,
    borderWidth: 2,
    padding: Spacing.three,
    gap: 3,
    minHeight: 110,
  },
  skinEmojis: { fontSize: 20, letterSpacing: 1 },
  skinName: { fontFamily: Fonts.display, fontSize: 15, marginTop: Spacing.one },
  skinBlurb: { fontFamily: Fonts.bodyBold, fontSize: 11, opacity: 0.75, lineHeight: 15 },
  skinCheck: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skinTick: { color: '#fff', fontSize: 12, fontWeight: '800', lineHeight: 14 },
  editor: { marginTop: Spacing.two, borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.three, gap: Spacing.two },
  stageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  stageChip: {
    width: '31%',
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    gap: 2,
  },
  stageEmoji: { fontSize: 26 },
  stageLabel: { fontFamily: Fonts.bodyBold, fontSize: 10.5 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  paletteCell: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteEmoji: { fontSize: 22 },
  form: { gap: Spacing.three, marginTop: Spacing.two },
  input: { borderWidth: 1.5, borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, fontSize: 16, fontFamily: Fonts.body },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.md },
  rowText: { flex: 1, gap: 2 },
  linkBtn: { alignSelf: 'flex-start', paddingVertical: Spacing.two },
  linkText: { fontFamily: Fonts.display, fontSize: 16 },
  dataRights: { marginTop: Spacing.five, gap: Spacing.two },
  deleteBtn: { alignSelf: 'center', paddingVertical: Spacing.two },
  deleteText: { fontFamily: Fonts.display, fontSize: 15, opacity: 0.7 },
});
