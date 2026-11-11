import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { getApiErrorMessage } from '../../api/apiHandler';

export default function ImpactStoriesScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (opts = {}) => {
    if (!opts.silent) setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/donations/impact-stories');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={{ padding: 16 }}><LoadingSkeleton rows={3} /></View>
      ) : error && items.length === 0 ? (
        <View style={{ padding: 16 }}><ErrorState message={error} onRetry={load} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load({ silent: true }); setRefreshing(false); }} />}
          ListEmptyComponent={<EmptyState icon="✨" title="Impact stories coming soon" message="Stories of support and change will appear here." />}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.cat}>{String(item.category || 'impact').toUpperCase()}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.summary || item.body}</Text>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cat: { fontSize: 11, fontWeight: '800', color: colors.trustTeal, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink },
  body: { fontSize: 14, color: colors.gray, marginTop: 6, lineHeight: 21 },
});