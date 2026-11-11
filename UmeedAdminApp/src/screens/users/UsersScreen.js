import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function UsersScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true); setError('');
    try { const { data } = await api.get('/users'); setItems(Array.isArray(data) ? data : []); }
    catch (e) { setError(getApiErrorMessage(e)); }
    finally { if (!silent) setLoading(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  const toggleStatus = async (item) => {
    const status = item.status === 'active' ? 'inactive' : 'active';
    try { await api.put(`/users/${item._id}`, { status }); load(true); }
    catch (e) { Alert.alert('Error', getApiErrorMessage(e)); }
  };
  const remove = (item) => Alert.alert('Delete User', `Delete ${item.name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await api.delete(`/users/${item._id}`); load(true); } catch (e) { Alert.alert('Error', getApiErrorMessage(e)); } } },
  ]);

  return (
    <View style={styles.screen}>
      {loading ? <View style={{ padding: 20 }}><LoadingSkeleton rows={4} /></View> : error ? <View style={{ padding: 20 }}><ErrorState message={error} onRetry={() => load()} /></View> : (
        <FlatList data={items} keyExtractor={(i) => i._id} contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No users" />}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}><Text style={styles.title}>{item.name}</Text><StatusBadge status={item.status || 'active'} /></View>
              <Text style={styles.meta}>{item.email}</Text>
              <Text style={styles.meta}>Role: {item.role} {item.phone ? `• ${item.phone}` : ''}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleStatus(item)}><Text style={styles.link}>{item.status === 'active' ? 'Deactivate' : 'Activate'}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item)}><Text style={[styles.link, { color: colors.red }]}>Delete</Text></TouchableOpacity>
              </View>
            </Card>
          )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: colors.ink, flex: 1, marginRight: 8 },
  meta: { fontSize: 12, color: colors.gray, marginTop: 3 },
  actions: { flexDirection: 'row', marginTop: 10 },
  link: { color: colors.careGreen, fontWeight: '700', marginRight: 16 },
});
