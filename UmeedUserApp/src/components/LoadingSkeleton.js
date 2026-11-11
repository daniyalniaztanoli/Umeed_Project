import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../theme';

export default function LoadingSkeleton({ rows = 3, variant = 'card', style }) {
  if (variant === 'spinner') {
    return (
      <View style={[styles.spinnerWrap, style]}>
        <ActivityIndicator color={colors.careGreen} size="large" />
      </View>
    );
  }

  return (
    <View style={style}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={[styles.line, { width: '62%', height: 14 }]} />
          <View style={[styles.line, { width: '92%', marginTop: 10 }]} />
          <View style={[styles.line, { width: '74%', marginTop: 8 }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  spinnerWrap: { paddingVertical: spacing.xxxl, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  line: {
    height: 10,
    borderRadius: radii.sm,
    backgroundColor: '#E8EDF3',
  },
});
