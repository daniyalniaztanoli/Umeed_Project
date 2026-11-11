import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusColors } from '../theme/colors';

export default function StatusBadge({ status }) {
  const key = status || '';
  const color = statusColors[key] || statusColors[String(key).toLowerCase()] || '#64748B';
  const label = String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
});
