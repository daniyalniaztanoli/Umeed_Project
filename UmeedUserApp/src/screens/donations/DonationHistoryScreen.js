import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { HeartHandshake } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

const statusColor = { pending: colors.warmAmber, confirmed: colors.careGreen, failed: colors.red, rejected: colors.red };

export default function DonationHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/donations/mine');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={{ padding: 16 }}><LoadingSkeleton rows={4} /></View>
      ) : error && items.length === 0 ? (
        <View style={{ padding: 16 }}><ErrorState message={error} onRetry={load} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load({ silent: true }); setRefreshing(false); }} />}
          ListEmptyComponent={<EmptyState icon={<HeartHandshake size={34} color={colors.careGreen} strokeWidth={2} />} title="No donations yet" message="Your donation submissions and receipts will appear here." actionLabel="Donate" onAction={() => navigation.navigate('Donate')} />}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('DonationReceipt', { id: item._id })}>
              <Card>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>PKR {Number(item.amount || 0).toLocaleString()} • {(item.category || item.fundType || 'donation').toUpperCase()}</Text>
                    <Text style={styles.meta}>{item.method} • {new Date(item.createdAt).toLocaleDateString()}</Text>
                    {!!item.receiptNumber && <Text style={styles.meta}>Receipt: {item.receiptNumber}</Text>}
                  </View>
                  <Text style={[styles.status, { color: statusColor[item.status] || colors.gray }]}>{item.status}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 12, color: colors.gray, marginTop: 4 },
  status: { fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
});