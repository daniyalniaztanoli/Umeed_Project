import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function BloodDonorsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true); setError('');
    try { const { data } = await api.get('/blood-donors'); setItems(Array.isArray(data) ? data : []); }
    catch (e) { setError(getApiErrorMessage(e)); }
    finally { if (!silent) setLoading(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  return (
    <View style={styles.screen}>
      {loading ? <View style={{ padding: 20 }}><LoadingSkeleton rows={3} /></View> : error ? <View style={{ padding: 20 }}><ErrorState message={error} onRetry={() => load()} /></View> : (
        <FlatList data={items} keyExtractor={(i) => String(i.id || i._id || Math.random())} contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No blood donors" message="Consented donor entries will appear here." />}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.title}>{item.name} • {item.bloodGroup}</Text>
              <Text style={styles.meta}>Phone: {item.phone}</Text>
              <Text style={styles.meta}>City: {item.city || '-'} • Availability: {item.availability || '-'}</Text>
              <Text style={styles.meta}>Status: {item.requestStatus || '-'}</Text>
            </Card>
          )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 16, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 12, color: colors.gray, marginTop: 3 },
});
