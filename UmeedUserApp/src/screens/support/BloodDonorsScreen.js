import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { colors } from '../../theme/colors';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { HandHeart } from 'lucide-react-native';

const GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const norm = (p) => String(p || '').replace(/[^\d+]/g, '');
const wa = (p) => norm(p).replace(/^\+/, '');

export default function BloodDonorsScreen({ navigation }) {
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) setLoading(true);
    setError('');
    try {
      const params = {};
      if (bloodGroup) params.bloodGroup = bloodGroup;
      if (city.trim()) params.city = city.trim();
      const { data } = await api.get('/blood-donors', { params });
      setDonors(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [bloodGroup]));

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
          {GROUPS.map((g) => (
            <TouchableOpacity key={g || 'all'} style={[styles.chip, bloodGroup === g && styles.chipActive]} onPress={() => setBloodGroup(g)}>
              <Text style={[styles.chipText, bloodGroup === g && styles.chipTextActive]}>{g || 'All groups'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Input label="City" value={city} onChangeText={setCity} placeholder="Search by city" style={{ marginBottom: 8 }} />
        <Button title="Search donors" onPress={() => load()} />
      </View>

      {loading && !refreshing ? (
        <View style={{ padding: 16 }}><LoadingSkeleton rows={4} /></View>
      ) : error && donors.length === 0 ? (
        <View style={{ padding: 16 }}><ErrorState message={error} onRetry={() => load()} /></View>
      ) : (
        <FlatList
          data={donors}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 0, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load({ silent: true }); setRefreshing(false); }} />}
          ListHeaderComponent={<Text style={styles.note}>Showing only donors who explicitly consented to be contacted via blood donation requests.</Text>}
          ListEmptyComponent={<EmptyState icon={<HandHeart size={34} color={colors.gray} strokeWidth={2} />} title="No donors found" message="Try another group/city, or register as a donor with contact consent." actionLabel="Register as donor" onAction={() => navigation.navigate('Welfare')} />}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{item.bloodGroup} • {item.city || 'City not set'}</Text>
                  {!!item.availability && <Text style={styles.sub}>Availability: {item.availability}</Text>}
                </View>
                <View style={styles.groupBadge}><Text style={styles.groupText}>{item.bloodGroup}</Text></View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${norm(item.phone)}`)}><Text style={styles.actionText}>📞 Call</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.waBtn]} onPress={() => Linking.openURL(`https://wa.me/${wa(item.phone)}`)}><Text style={styles.actionText}>💬 WhatsApp</Text></TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { padding: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.lightGray, backgroundColor: colors.background },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  chipActive: { backgroundColor: colors.careGreen, borderColor: colors.careGreen },
  chipText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  note: { fontSize: 12, color: colors.gray, marginBottom: 10, lineHeight: 17 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 13, color: colors.gray, marginTop: 2 },
  sub: { fontSize: 12, color: colors.gray, marginTop: 4 },
  groupBadge: { backgroundColor: '#FEE2E2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  groupText: { color: '#B91C1C', fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  waBtn: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
  actionText: { fontWeight: '700', color: colors.ink },
});