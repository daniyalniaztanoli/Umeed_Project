import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';

const STATUSES = ['pending', 'approved', 'rejected', 'received'];

export default function DonationDetailScreen({ route }) {
  const { id } = route.params || {};
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try { const { data } = await api.get(`/donations/${id}`); setItem(data); }
    catch (e) { setError(getApiErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const setStatus = async (status) => {
    setSaving(true);
    try { await api.put(`/donations/${id}/status`, { status }); Alert.alert('Updated', `Donation marked as ${status}`); await load(); }
    catch (e) { Alert.alert('Error', getApiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <View style={{ padding: 20 }}><LoadingSkeleton rows={4} /></View>;
  if (error) return <View style={{ padding: 20 }}><ErrorState message={error} onRetry={load} /></View>;
  if (!item) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Card>
        <View style={styles.row}><Text style={styles.title}>PKR {Number(item.amount || 0).toLocaleString()}</Text><StatusBadge status={item.status || 'pending'} /></View>
        <Text style={styles.meta}>Receipt: {item.receiptNumber || '-'}</Text>
        <Text style={styles.meta}>Category: {item.category} • Fund: {item.fundType || '-'}</Text>
        <Text style={styles.meta}>Method: {item.method} • Ref: {item.reference || '-'}</Text>
        <Text style={styles.meta}>Donor: {item.isAnonymous ? 'Anonymous' : (item.donorName || item.donor?.name || item.user?.name || '-')}</Text>
        {!item.isAnonymous && <Text style={styles.meta}>Contact: {item.donorContact || item.donor?.contact || item.user?.email || '-'}</Text>}
        <Text style={styles.meta}>Date: {new Date(item.createdAt).toLocaleString()}</Text>
        {!!item.notes && <Text style={styles.body}>{item.notes}</Text>}
      </Card>

      <Card>
        <Text style={styles.h2}>Update Status</Text>
        <View style={styles.wrapRow}>
          {STATUSES.map((s) => (
            <TouchableOpacity key={s} style={[styles.statusBtn, item.status === s && { backgroundColor: colors.careGreen }]} onPress={() => setStatus(s)} disabled={saving}>
              <Text style={[styles.statusBtnText, item.status === s && { color: '#fff' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.meta}>Use pending/approved/rejected/received to verify and track donations.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 13, color: colors.gray, marginTop: 4 },
  body: { fontSize: 14, color: colors.ink, marginTop: 10, lineHeight: 21 },
  h2: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 10 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  statusBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  statusBtnText: { fontSize: 12, fontWeight: '700', color: colors.ink, textTransform: 'capitalize' },
});
