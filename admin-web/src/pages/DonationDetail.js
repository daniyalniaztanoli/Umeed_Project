import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function DonationDetail() {
  const route = useRoute();
  const id = route.params?.id;
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Donation Detail</Text>
      <Text style={styles.sub}>Donation ID: {id || '—'}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: '#f9fafb' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 14, color: '#6b7280', marginTop: 8 },
});
