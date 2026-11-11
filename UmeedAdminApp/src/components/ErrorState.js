import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import Button from './Button';

export default function ErrorState({ title = 'Could not load data', message = 'Please check your connection and try again.', onRetry, retryLabel = 'Retry', style }) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!onRetry && <View style={styles.action}><Button title={retryLabel} onPress={onRetry} /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 22, paddingHorizontal: 20, backgroundColor: '#FEF2F2', borderRadius: 16, borderWidth: 1, borderColor: '#FECACA' },
  icon: { fontSize: 26, marginBottom: 6, color: colors.red, fontWeight: '800' },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  message: { fontSize: 13, color: colors.gray, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  action: { width: '100%', marginTop: 12 },
});
