import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Card>
        <Text style={styles.label}>Name</Text><Text style={styles.value}>{user?.name}</Text>
        <Text style={styles.label}>Email</Text><Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Role</Text><Text style={styles.value}>{String(user?.role || '').replace('_', ' ')}</Text>
        <Text style={styles.label}>Phone</Text><Text style={styles.value}>{user?.phone || '-'}</Text>
      </Card>
      <Button title="Logout" variant="danger" onPress={logout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, color: colors.gray, marginTop: 10, fontWeight: '600' },
  value: { fontSize: 15, color: colors.ink, marginTop: 2, fontWeight: '700' },
});
