import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import Button from './Button';

export default function EmptyState({ icon, title = 'Nothing here yet', message, actionLabel, onAction, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {!!icon && <View style={{ marginBottom: 8 }}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!actionLabel && !!onAction && <View style={styles.action}><Button title={actionLabel} onPress={onAction} variant="outline" /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.lightGray },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  message: { fontSize: 13, color: colors.gray, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  action: { width: '100%', marginTop: 8 },
});
