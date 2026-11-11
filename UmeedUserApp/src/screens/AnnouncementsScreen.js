import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../api/client';
import { colors } from '../theme/colors';

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnnouncementsScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/announcements');
      setItems(Array.isArray(data) ? data : data?.announcements || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Announcements</Text>
        {loading ? (
          <Text style={styles.sub}>Loading...</Text>
        ) : items.length === 0 ? (
          <Text style={styles.sub}>No announcements</Text>
        ) : (
          items.map((a, i) => (
            <TouchableOpacity key={a._id} onPress={() => setSelected(a)} activeOpacity={0.8}>
              <View style={[styles.tile, { backgroundColor: COLORS[i % COLORS.length] }]}>
                <Text style={styles.tileTitle}>{a.title}</Text>
                <Text style={styles.tileBody} numberOfLines={2}>{a.body || a.content}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selected?.title}</Text>
            <Text style={styles.modalBody}>{selected?.body || selected?.content}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.ink, marginBottom: 16 },
  sub: { color: colors.gray, marginTop: 8 },
  tile: { borderRadius: 14, padding: 16, marginBottom: 12 },
  tileTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  tileBody: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  modalBody: { fontSize: 14, color: colors.gray, marginBottom: 16 },
  closeBtn: { alignSelf: 'flex-end', padding: 8 },
  closeText: { color: colors.careGreen, fontWeight: '700' },
});
