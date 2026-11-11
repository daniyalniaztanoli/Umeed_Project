import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';

const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

export default function ComplaintDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try { const { data } = await api.get(`/complaints/${id}`); setItem(data); }
    catch (e) { setError(getApiErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status) => {
    setSaving(true);
    try {
      await api.put(`/complaints/${id}/status`, { status, remark: remark || `Status changed to ${status}` });
      setRemark('');
      Alert.alert('Updated', `Complaint marked as ${status}`);
      await load();
    } catch (e) { Alert.alert('Error', getApiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <View style={{ padding: 20 }}><LoadingSkeleton rows={4} /></View>;
  if (error) return <View style={{ padding: 20 }}><ErrorState message={error} onRetry={load} /></View>;
  if (!item) return null;

  const timeline = item.timeline || item.updates || [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Card>
        <View style={styles.row}><Text style={styles.title}>{item.title}</Text><StatusBadge status={item.status} /></View>
        <Text style={styles.meta}>Category: {item.category}  •  Priority: {item.priority || 'Medium'}</Text>
        <Text style={styles.meta}>By: {item.user?.name || 'User'} {item.user?.email ? `(${item.user.email})` : ''}</Text>
        <Text style={styles.meta}>Submitted: {new Date(item.createdAt).toLocaleString()}</Text>
        <Text style={styles.body}>{item.description}</Text>
      </Card>

      <Card>
        <Text style={styles.h2}>Update Status</Text>
        <Input label="Remark (optional)" value={remark} onChangeText={setRemark} placeholder="Add a note for this update" />
        <View style={styles.wrapRow}>
          {STATUSES.map((s) => (
            <TouchableOpacity key={s} style={styles.statusBtn} onPress={() => updateStatus(s)} disabled={saving}>
              <Text style={styles.statusBtnText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {saving && <Text style={styles.meta}>Updating...</Text>}
      </Card>

      <Card>
        <Text style={styles.h2}>Timeline</Text>
        {timeline.length === 0 ? <Text style={styles.meta}>No updates yet.</Text> : timeline.map((t, i) => (
          <View key={t._id || i} style={styles.tlItem}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tlStatus}>{t.status || t.type || 'Update'}</Text>
              {!!(t.remark || t.note) && <Text style={styles.tlRemark}>{t.remark || t.note}</Text>}
              <Text style={styles.tlTime}>{new Date(t.createdAt || t.at).toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </Card>

      {!!item.feedback && (
        <Card>
          <Text style={styles.h2}>User Feedback</Text>
          <Text style={styles.meta}>Rating: {item.feedback.rating}/5</Text>
          {!!(item.feedback.feedback || item.feedback.comment) && <Text style={styles.body}>{item.feedback.feedback || item.feedback.comment}</Text>}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink, flex: 1, marginRight: 8 },
  meta: { fontSize: 13, color: colors.gray, marginTop: 4 },
  body: { fontSize: 14, color: colors.ink, marginTop: 10, lineHeight: 21 },
  h2: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap' },
  statusBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  statusBtnText: { fontSize: 12, fontWeight: '700', color: colors.ink },
  tlItem: { flexDirection: 'row', marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.careGreen, marginTop: 5, marginRight: 10 },
  tlStatus: { fontSize: 13, fontWeight: '700', color: colors.ink },
  tlRemark: { fontSize: 13, color: colors.gray, marginTop: 2 },
  tlTime: { fontSize: 11, color: colors.gray, marginTop: 2 },
});
