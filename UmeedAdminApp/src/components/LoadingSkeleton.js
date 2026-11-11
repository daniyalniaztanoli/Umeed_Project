import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function LoadingSkeleton({ rows = 3, style }) {
  return (
    <View style={style}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.line, { width: '60%' }]} />
          <View style={[styles.line, { width: '90%', marginTop: 8 }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.lightGray },
  line: { height: 10, borderRadius: 6, backgroundColor: '#E2E8F0' },
});
