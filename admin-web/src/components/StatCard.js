import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const colorStyles = {
  primary: { bg: '#dcfce7', text: '#166534' },
  yellow: { bg: '#fef3c7', text: '#92400e' },
  red: { bg: '#fee2e2', text: '#991b1b' },
  blue: { bg: '#dbeafe', text: '#1d4ed8' },
  green: { bg: '#dcfce7', text: '#166534' },
};

export function StatCard({ icon: Icon, label, value, color = 'primary', trend }) {
  const c = colorStyles[color] || colorStyles.primary;
  return (
    <View style={[styles.card, { backgroundColor: c.bg }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
          {trend && <Text style={styles.trend}>{trend}</Text>}
        </View>
        <View style={[styles.iconWrap, { backgroundColor: c.text }]}>
          <Icon size={22} strokeWidth={2.5} color="#fff" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '800', color: '#111827' },
  trend: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
