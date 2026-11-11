import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radii } from '../theme';
import Button from './Button';

export default function ErrorState({
  title = 'Could not load data',
  message = 'Please check your connection and try again.',
  onRetry,
  retryLabel = 'Retry',
  style,
}) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!onRetry && <View style={styles.action}><Button title={retryLabel} onPress={onRetry} /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: '#FEF2F2',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  icon: { fontSize: 30, marginBottom: spacing.sm },
  title: { fontSize: fontSizes.base, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  message: { fontSize: fontSizes.body, color: colors.gray, textAlign: 'center', marginTop: spacing.xs, lineHeight: 20 },
  action: { width: '100%', marginTop: spacing.md },
});
