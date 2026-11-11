import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function ComplaintsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const qs = filter !== 'All' ? `?status=${encodeURIComponent(filter)}` : '';
      const { data } = await api.get(`/complaints${qs}`);
      setItems(Array.isArray(data) ? data : data.complaints || []);
    } catch (e) { setError(getApiErrorMessage(e)); }
    finally { if (!silent) setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [filter]));
  const onRefresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  const filters = ['All', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Reopened'];

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.title}>Complaints</Text>
        <Text style={styles.sub}>Manage and resolve reported issues</Text>
        <FlatList horizontal data={filters} keyExtractor={(i) => i} showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setFilter(item)} style={[styles.chip, filter === item && styles.chipOn]}>
              <Text style={[styles.chipText, filter === item && styles.chipTextOn]}>{item}</Text>
            </TouchableOpacity>
          )} />
      </View>
      {loading ? <View style={{ padding: 20 }}><LoadingSkeleton rows={4} /></View> : error ? <View style={{ padding: 20 }}><ErrorState message={error} onRetry={() => load()} /></View> : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No complaints" message="No complaints match this filter." />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('ComplaintDetail', { id: item._id, item })}>
              <Card>
                <View style={styles.row}><Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text><StatusBadge status={item.status} /></View>
                <Text style={styles.meta}>{item.category} • {item.priority || 'Medium'} • {new Date(item.createdAt).toLocaleDateString()}</Text>
                {!!item.user?.name && <Text style={styles.meta}>By: {item.user.name}</Text>}
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
  top: { paddingHorizontal: 20, paddingTop: 54, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 13, color: colors.gray, marginTop: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8 },
  chipOn: { backgroundColor: colors.careGreen },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.gray },
  chipTextOn: { color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, flex: 1, marginRight: 8 },
  meta: { fontSize: 12, color: colors.gray, marginTop: 4 },
});
