import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { getApiErrorMessage } from '../api/apiHandler';
import { colors } from '../theme/colors';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { ClipboardList } from 'lucide-react-native';

const FILTERS = ['All', 'Pending', 'In Progress', 'Resolved', 'Reopened'];
const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
];
const STATUS_ORDER = { Reopened: 0, Pending: 1, Assigned: 2, 'In Progress': 3, Resolved: 4, Rejected: 5 };
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

export default function MyComplaintsScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/complaints/mine');
      setComplaints(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const visible = useMemo(() => {
    const base = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);
    const q = query.trim().toLowerCase();
    const searched = !q ? base : base.filter((c) =>
      [c.title, c.category, c.status, c.priority, c.description, c.location?.building, c.location?.room]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
    return [...searched].sort((a, b) => {
      if (sort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sort === 'status') return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      if (sort === 'priority') return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [complaints, filter, query, sort]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 60 }}>
      <Text style={styles.title}>My Complaints</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search title, category, location..."
        placeholderTextColor={colors.gray}
        style={styles.search}
        clearButtonMode="while-editing"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, paddingHorizontal: 20 }} contentContainerStyle={{ alignItems: 'center' }}>
        {SORTS.map((s) => (
          <TouchableOpacity key={s.key} onPress={() => setSort(s.key)} style={[styles.chip, sort === s.key && styles.chipSortActive]}>
            <Text style={[styles.chipText, sort === s.key && { color: '#fff' }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(i) => i}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 50, paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setFilter(item)}
            style={[styles.chip, filter === item && styles.chipActive]}>
            <Text style={[styles.chipText, filter === item && { color: '#fff' }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading && !refreshing ? (
        <View style={{ padding: 20 }}>
          <LoadingSkeleton rows={4} />
        </View>
      ) : error && complaints.length === 0 ? (
        <View style={{ padding: 20 }}>
          <ErrorState message={error} onRetry={load} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 20, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => { setRefreshing(true); await load({ silent: true }); setRefreshing(false); }}
            />
          }
          ListHeaderComponent={error ? <ErrorState message={error} onRetry={load} style={{ marginBottom: 12 }} /> : null}
          ListEmptyComponent={
          <EmptyState
            icon={<ClipboardList size={34} color={colors.gray} strokeWidth={2} />}
              title={filter === 'All' && !query ? 'No complaints yet' : 'No matching complaints'}
              message={query ? 'Try a different search, sort, or filter.' : (filter === 'All' ? 'Tap the + button to report an issue.' : 'Try another filter or pull to refresh.')}
              actionLabel={filter === 'All' && !query ? 'Report an issue' : undefined}
              onAction={filter === 'All' && !query ? () => navigation.navigate('Report') : undefined}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('ComplaintDetail', { id: item._id })}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.cardSub} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.meta}>{item.category} • {new Date(item.createdAt).toLocaleDateString()}</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.ink, paddingHorizontal: 20, marginBottom: 10 },
  search: { marginHorizontal: 20, marginBottom: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: colors.ink },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginRight: 8, height: 36, justifyContent: 'center' },
  chipActive: { backgroundColor: colors.careGreen, borderColor: colors.careGreen },
  chipSortActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, flex: 1, marginRight: 8 },
  cardSub: { fontSize: 13, color: colors.gray, marginTop: 4 },
  meta: { fontSize: 11, color: colors.gray, marginTop: 8 },
});
