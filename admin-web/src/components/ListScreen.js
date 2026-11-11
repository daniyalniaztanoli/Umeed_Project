import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

export function ListScreen({ title, endpoint, keyExtractor = 'id', columns, emptyMessage = 'No records found', itemTitle }) {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(endpoint);
      setData((res.data || []).slice());
    } catch (e) {
      setError('Failed to load ' + title.toLowerCase());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [endpoint, title]);

  useEffect(() => { load(); }, [load]);

  const filtered = data.filter((item) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return String(itemTitle ? item[itemTitle] : item.name || item.title || '').toLowerCase().includes(s);
  });

  const renderItem = ({ item }) => (
    <Pressable style={styles.row} onPress={() => { }}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{itemTitle ? item[itemTitle] : item.name || item.title || item.id}</Text>
        <Text style={styles.rowSub}>{JSON.stringify(item).slice(0, 60)}</Text>
      </View>
      <BadgePill variant="primary">{item.status || item.role || ''}</BadgePill>
    </Pressable>
  );

  if (loading && data.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.text}>Loading {title}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>{title}</Text>
      </View>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${title}...`}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item[keyExtractor] || item._id || item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>{error || emptyMessage}</Text></View>}
      />
    </View>
  );
}

function BadgePill({ children, variant = 'primary' }) {
  const colors = { primary: '#dbeafe', text: '#1d4ed8' };
  return (
    <View style={[styles.badge, { backgroundColor: colors[variant]?.bg || colors.primary.bg }]}>
      <Text style={{ color: colors[variant]?.text || colors.primary.text, fontSize: 10, fontWeight: '700' }}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  pageTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  searchWrap: { padding: 12, backgroundColor: '#fff' },
  searchInput: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: '#111827' },
  error: { paddingHorizontal: 14, color: '#ef4444', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  listContent: { paddingHorizontal: 12, paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#f2f2f2', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  rowSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#f2f2f2' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#6b7280' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { marginTop: 8, color: '#6b7280' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
});
