import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function DepartmentsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true); setError('');
    try { const { data } = await api.get('/departments'); setItems(Array.isArray(data) ? data : []); }
    catch (e) { setError(getApiErrorMessage(e)); }
    finally { if (!silent) setLoading(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  const create = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Department name is required');
    setSaving(true);
    try { await api.post('/departments', { name: name.trim(), description }); setName(''); setDescription(''); await load(true); Alert.alert('Saved', 'Department created'); }
    catch (e) { Alert.alert('Error', getApiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <View style={styles.screen}>
      {loading ? <View style={{ padding: 20 }}><LoadingSkeleton rows={3} /></View> : error ? <View style={{ padding: 20 }}><ErrorState message={error} onRetry={() => load()} /></View> : (
        <FlatList data={items} keyExtractor={(i) => i._id} contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <Card>
              <Text style={styles.h2}>Add Department</Text>
              <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. IT Support" />
              <Input label="Description" value={description} onChangeText={setDescription} placeholder="Optional" />
              <Button title="Create Department" onPress={create} loading={saving} />
            </Card>
          }
          ListEmptyComponent={<EmptyState title="No departments" />}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.title}>{item.name}</Text>
              {!!item.description && <Text style={styles.meta}>{item.description}</Text>}
            </Card>
          )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  h2: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 12, color: colors.gray, marginTop: 3 },
});
