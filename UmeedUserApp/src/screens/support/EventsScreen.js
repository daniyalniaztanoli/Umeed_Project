import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { Calendar, MapPin, Phone, Image as ImageIcon } from 'lucide-react-native';

const TYPE_LABEL = { blood_camp: 'Blood Camp', ration_drive: 'Ration Drive', book_drive: 'Book Drive', medical_camp: 'Medical Camp', other: 'Event' };

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/events');
      setEvents(Array.isArray(data) ? data : []);
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
      ) : error && events.length === 0 ? (
        <View style={{ padding: 16 }}><ErrorState message={error} onRetry={load} /></View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load({ silent: true }); setRefreshing(false); }} />}
          ListEmptyComponent={<EmptyState icon={<Calendar size={34} color={colors.gray} strokeWidth={2} />} title="No events right now" message="Blood camps, ration drives, and book drives will appear here." />}
          renderItem={({ item }) => {
            const img = item.imageUrl
              ? { uri: item.imageUrl.startsWith('http') ? item.imageUrl : item.imageUrl.replace(/^\//, 'http://192.168.100.210:5000/') }
              : null;
            return (
            <Card>
              {img && <Image source={img} style={styles.image} resizeMode="cover" />}
              <Text style={styles.type}>{TYPE_LABEL[item.type] || 'Event'}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.description}</Text>
              {!!item.date && (
                <View style={styles.metaRow}><Calendar size={14} color={colors.gray} strokeWidth={2} /><Text style={styles.meta}>{new Date(item.date).toLocaleString()}</Text></View>
              )}
              {!!item.location && (
                <View style={styles.metaRow}><MapPin size={14} color={colors.gray} strokeWidth={2} /><Text style={styles.meta}>{item.location}</Text></View>
              )}
              {!!item.contact && (
                <View style={styles.metaRow}><Phone size={14} color={colors.gray} strokeWidth={2} /><Text style={styles.meta}>{item.contact}</Text></View>
              )}
            </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  type: { fontSize: 11, fontWeight: '800', color: colors.trustTeal, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink },
  body: { fontSize: 14, color: colors.gray, marginTop: 6, lineHeight: 20 },
  meta: { fontSize: 13, color: colors.ink, marginTop: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  image: { width: '100%', height: 150, borderRadius: 10, marginBottom: 10, backgroundColor: colors.lightGray },
});