import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import api from '../../api/client';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import { getApiErrorMessage } from '../../api/apiHandler';

const Stat = ({ label, value, tone }) => (
  <View style={[styles.stat, tone ? { borderColor: tone + '55' } : null]}>
    <Text style={[styles.value, tone ? { color: tone } : null]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

export default function TransparencyScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (opts = {}) => {
    if (!opts.silent) setLoading(true);
    setError('');
    try {
      const res = await api.get('/donations/transparency');
      setData(res.data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !refreshing) return <View style={{ padding: 16 }}><LoadingSkeleton rows={4} /></View>;
  if (error && !data) return <View style={{ padding: 16 }}><ErrorState message={error} onRetry={load} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load({ silent: true }); setRefreshing(false); }} />}>
      <Card>
        <Text style={styles.title}>Transparency</Text>
        <Text style={styles.sub}>Confirmed donations and recorded spending summary.</Text>
      </Card>
      <View style={styles.grid}>
        <Stat label="Total received" value={`PKR ${Number(data?.totalReceived || 0).toLocaleString()}`} tone={colors.careGreen} />
        <Stat label="Total spent" value={`PKR ${Number(data?.totalSpent || 0).toLocaleString()}`} tone={colors.warmAmber} />
        <Stat label="Remaining" value={`PKR ${Number(data?.remainingBalance || 0).toLocaleString()}`} tone={colors.trustTeal} />
        <Stat label="Pending verify" value={`PKR ${Number(data?.pendingVerification || 0).toLocaleString()}`} />
      </View>
      <Card>
        <Text style={styles.heading}>By category (confirmed)</Text>
        {(data?.byCategory || []).length ? data.byCategory.map((r) => (
          <View key={r.category} style={styles.row}><Text style={styles.cat}>{String(r.category || '').toUpperCase()}</Text><Text style={styles.catVal}>PKR {Number(r.amount).toLocaleString()} ({r.count})</Text></View>
        )) : <Text style={styles.sub}>No confirmed donations yet.</Text>}
      </Card>
      {!!data?.note && <Text style={styles.note}>{data.note}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 13, color: colors.gray, marginTop: 4, lineHeight: 19 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  stat: { width: '48%', backgroundColor: colors.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.lightGray },
  value: { fontSize: 17, fontWeight: '800', color: colors.ink },
  label: { fontSize: 12, color: colors.gray, marginTop: 4, fontWeight: '600' },
  heading: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  cat: { fontSize: 13, fontWeight: '700', color: colors.ink },
  catVal: { fontSize: 13, color: colors.gray },
  note: { fontSize: 12, color: colors.gray, lineHeight: 18, paddingHorizontal: 4 },
});