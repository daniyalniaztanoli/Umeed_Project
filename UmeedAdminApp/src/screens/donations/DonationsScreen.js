import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function DonationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [d, t] = await Promise.all([api.get('/donations'), api.get('/donations/transparency').catch(() => ({ data: null }))]);
      setItems(Array.isArray(d.data) ? d.data : []);
      setSummary(t.data);
    } catch (e) { setError(getApiErrorMessage(e)); }
    finally { if (!silent) setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.title}>Donations</Text>
        <Text style={styles.sub}>Verify donations and monitor transparency</Text>
      </View>
      {loading ? <View style={{ padding: 20 }}><LoadingSkeleton rows={4} /></View> : error ? <View style={{ padding: 20 }}><ErrorState message={error} onRetry={() => load()} /></View> : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={summary ? (
            <Card>
              <Text style={styles.h2}>Transparency Summary</Text>
              <Text style={styles.meta}>Received: PKR {Number(summary.totalReceived || 0).toLocaleString()} • Spent: PKR {Number(summary.totalSpent || 0).toLocaleString()}</Text>
              <Text style={styles.meta}>Remaining: PKR {Number(summary.remainingBalance || 0).toLocaleString()} • Pending: PKR {Number(summary.pendingVerification || 0).toLocaleString()}</Text>
            </Card>
          ) : null}
          ListEmptyComponent={<EmptyState title="No donations" message="No donation records found." />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('DonationDetail', { id: item._id })}>
              <Card>
                <View style={styles.row}><Text style={styles.cardTitle}>PKR {Number(item.amount || 0).toLocaleString()}</Text><StatusBadge status={item.status || 'pending'} /></View>
                <Text style={styles.meta}>{item.category} • {item.method} • {item.isAnonymous ? 'Anonymous' : (item.donorName || item.donor?.name || 'Donor')}</Text>
                <Text style={styles.meta}>Receipt: {item.receiptNumber || '-'} • {new Date(item.createdAt).toLocaleDateString()}</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 13, color: colors.gray, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 12, color: colors.gray, marginTop: 4 },
  h2: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 4 },
});
