import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function AnnouncementsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true); setError('');
    try { const { data } = await api.get('/announcements'); setItems(Array.isArray(data) ? data : []); }
    catch (e) { setError(getApiErrorMessage(e)); }
    finally { if (!silent) setLoading(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  const remove = (id) => Alert.alert('Delete', 'Delete this announcement?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await api.delete(`/announcements/${id}`); load(true); } catch (e) { Alert.alert('Error', getApiErrorMessage(e)); } } },
  ]);

  return (
    <View style={styles.screen}>
      <View style={{ padding: 20, paddingBottom: 0 }}><Button title="Create Announcement" onPress={() => navigation.navigate('AnnouncementForm')} /></View>
      {loading ? <View style={{ padding: 20 }}><LoadingSkeleton rows={3} /></View> : error ? <View style={{ padding: 20 }}><ErrorState message={error} onRetry={() => load()} /></View> : (
        <FlatList data={items} keyExtractor={(i) => i._id} contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<EmptyState title="No announcements" />}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>Audience: {item.audience || 'all'} • {new Date(item.createdAt || item.publishDate).toLocaleDateString()}</Text>
              <Text style={styles.body} numberOfLines={3}>{item.body}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => navigation.navigate('AnnouncementForm', { item })}><Text style={styles.link}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item._id)}><Text style={[styles.link, { color: colors.red }]}>Delete</Text></TouchableOpacity>
              </View>
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
  actions: { flexDirection: 'row', marginTop: 10 },
  link: { color: colors.careGreen, fontWeight: '700', marginRight: 16 },
});
