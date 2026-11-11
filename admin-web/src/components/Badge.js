import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function Badge({ children, variant = 'yellow', style }) {
  const variants = {
    yellow: { bg: '#fef3c7', text: '#92400e' },
    green: { bg: '#dcfce7', text: '#166534' },
    teal: { bg: '#cffafe', text: '#0f766e' },
    red: { bg: '#fee2e2', text: '#991b1b' },
    primary: { bg: '#dbeafe', text: '#1d4ed8' },
  };
  const v = variants[variant] || variants.yellow;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});
