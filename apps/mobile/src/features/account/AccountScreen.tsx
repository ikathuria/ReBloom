import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BLOOM } from '@/features/onboarding/copy';
import { PrimaryButton } from '@/features/onboarding/PrimaryButton';
import { getDb } from '@/lib/db';
import {
  getSupabase,
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
        <View style={styles.body}>
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
        </View>
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
        <Switch testID="account-sync" value={sync} onValueChange={toggleSync} trackColor={{ true: BLOOM }} />
      </View>
      {status ? <ThemedText type="small" themeColor="textSecondary">{status}</ThemedText> : null}

      <Pressable testID="account-signout" onPress={() => signOut()} accessibilityRole="button" style={styles.linkBtn}>
        <ThemedText style={[styles.linkText, { color: BLOOM }]}>Sign out</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  back: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  backText: { fontSize: 16, fontWeight: '700' },
  body: { flex: 1, paddingHorizontal: Spacing.four, gap: Spacing.three },
  p: { lineHeight: 20 },
  form: { gap: Spacing.three, marginTop: Spacing.two },
  input: { borderWidth: 2, borderRadius: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Spacing.three },
  rowText: { flex: 1, gap: 2 },
  linkBtn: { alignSelf: 'flex-start', paddingVertical: Spacing.two },
  linkText: { fontSize: 16, fontWeight: '700' },
});
