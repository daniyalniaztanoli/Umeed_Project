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

export default function VolunteersScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true); setError('');
    try { const { data } = await api.get('/volunteers'); setItems(Array.isArray(data) ? data : []); }
    catch (e) { setError(getApiErrorMessage(e)); }
    finally { if (!silent) setLoading(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  return (
    <View style={styles.screen}>
      {loading ? <View style={{ padding: 20 }}><LoadingSkeleton rows={3} /></View> : error ? <View style={{ padding: 20 }}><ErrorState message={error} onRetry={() => load()} /></View> : (
        <FlatList data={items} keyExtractor={(i) => i._id} contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No volunteer signups" />}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.meta}>{item.phone}{item.email ? ` • ${item.email}` : ''}</Text>
              {!!item.city && <Text style={styles.meta}>City: {item.city}</Text>}
              {!!item.availability && <Text style={styles.meta}>Availability: {item.availability}</Text>}
              {!!(item.interests && item.interests.length) && <Text style={styles.meta}>Interests: {item.interests.join(', ')}</Text>}
              {!!item.skills && <Text style={styles.body}>Skills: {item.skills}</Text>}
              {!!item.message && <Text style={styles.body}>{item.message}</Text>}
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
  body: { fontSize: 13, color: colors.ink, marginTop: 6, lineHeight: 19 },
});
