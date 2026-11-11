import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import api from '../../api/client';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import ErrorState from '../../components/ErrorState';
import { getApiErrorMessage } from '../../api/apiHandler';

const Row = ({ label, value }) => value ? (
  <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
) : null;

export default function DonationReceiptScreen({ route }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get(`/donations/${id}`);
      setItem(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.careGreen} /></View>;
  if (error || !item) return <View style={{ flex: 1, padding: 16 }}><ErrorState message={error || 'Receipt not found'} onRetry={load} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.brand}>Umeed Foundation</Text>
        <Text style={styles.receipt}>Donation Receipt</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
      </Card>
      <Card>
        <Row label="Receipt number" value={item.receiptNumber} />
        <Row label="Amount" value={`PKR ${Number(item.amount || 0).toLocaleString()}`} />
        <Row label="Category" value={(item.category || item.fundType || '').toUpperCase()} />
        <Row label="Method" value={item.method} />
        <Row label="Reference" value={item.reference} />
        <Row label="Submitted" value={item.createdAt ? new Date(item.createdAt).toLocaleString() : ''} />
        <Row label="Anonymous" value={item.isAnonymous ? 'Yes' : 'No'} />
        <Row label="Proof" value={item.proofUrl ? 'Uploaded' : 'Not uploaded'} />
      </Card>
      <Text style={styles.note}>Pending donations require manual verification. Keep this receipt number for reference.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 20, fontWeight: '800', color: colors.ink },
  receipt: { fontSize: 14, color: colors.trustTeal, fontWeight: '700', marginTop: 4 },
  status: { fontSize: 13, color: colors.gray, marginTop: 8, textTransform: 'capitalize' },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  label: { fontSize: 12, color: colors.gray },
  value: { fontSize: 15, color: colors.ink, fontWeight: '600', marginTop: 2 },
  note: { fontSize: 12, color: colors.gray, lineHeight: 18, paddingHorizontal: 4 },
});