import React from 'react';
import { ActivityIndicator, View, Text, Pressable, StyleSheet } from 'react-native';
import type { AppError } from '../../core/errors/AppError';
import { useTheme } from './useTheme';

export function LoadingState() {
  const theme = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.background }]} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <ActivityIndicator size="large" color={theme.accent} />
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.center} accessibilityRole="text">
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}

function messageFor(error: AppError): string {
  switch (error.type) {
    case 'network':
      return error.retryable ? "Couldn't reach the server. Check your connection." : 'Something went wrong on our end.';
    case 'unauthorized':
      return 'Please log in again to continue.';
    case 'forbidden':
      return "You don&apos;t have permission to do that.";
    case 'not_found':
      return "That listing isn&apos;t available anymore.";
    case 'conflict':
      return 'This changed elsewhere - refresh and try again.';
    default:
      return 'Something unexpected happened.';
  }
}

export function ErrorState({ error, onRetry }: { error: AppError; onRetry: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.center} accessibilityRole="alert">
      <Text style={[styles.subtitle, { color: theme.text, marginBottom: 16 }]}>{messageFor(error)}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        style={[styles.button, { backgroundColor: theme.accent }]}
      >
        <Text style={styles.buttonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

/** Shown over stale-but-usable cached data, not a full-screen error. */
export function OfflineBanner() {
  const theme = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: theme.border }]} accessibilityRole="alert">
      <Text style={{ color: theme.textMuted, fontSize: 13 }}>You&apos;re offline - showing saved listings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  subtitle: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '600' },
  banner: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
});
