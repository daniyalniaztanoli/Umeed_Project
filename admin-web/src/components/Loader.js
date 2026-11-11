import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export function Loader({ fullScreen = false, message = 'Loading...' }) {
  const container = fullScreen
    ? { ...styles.full, ...styles.center }
    : styles.center;
  return (
    <View style={container}>
      <ActivityIndicator size="large" color="#22C55E" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  full: { backgroundColor: '#f9fafb' },
  text: { marginTop: 10, fontSize: 14, color: '#6b7280' },
});
