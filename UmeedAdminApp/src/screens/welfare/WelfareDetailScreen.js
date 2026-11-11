import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';

export default function WelfareDetailScreen({ route }) {
  const { id } = route.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get(`/welfare/${id}`);
      setData(res.data);
      const req = res.data?.request || res.data;
      if (req?.amountRequested) setAmount(String(req.amountRequested));
    } catch (e) { setError(getApiErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const act = async (path, body, successMsg) => {
    setSaving(true);
    try {
      await api.put(`/welfare/${id}/${path}`, body);
      Alert.alert('Success', successMsg);
      setRemarks('');
      await load();
    } catch (e) { Alert.alert('Error', getApiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <View style={{ padding: 20 }}><LoadingSkeleton rows={4} /></View>;
  if (error) return <View style={{ padding: 20 }}><ErrorState message={error} onRetry={load} /></View>;
  const req = data?.request || data;
  const disb = data?.disbursement;
  if (!req) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Card>
        <View style={styles.row}><Text style={styles.title}>{String(req.type || '').toUpperCase()} Request</Text><StatusBadge status={req.status} /></View>
        <Text style={styles.meta}>Applicant: {req.user?.name || 'User'} {req.user?.email ? `(${req.user.email})` : ''}</Text>
        <Text style={styles.meta}>Phone: {req.user?.phone || req.details?.phone || req.bloodInfo?.phone || '-'}</Text>
        <Text style={styles.meta}>Amount Requested: PKR {Number(req.amountRequested || 0).toLocaleString()}</Text>
        <Text style={styles.meta}>Fund Type: {req.fundType || 'general'}</Text>
        <Text style={styles.body}>{req.reason}</Text>
        {!!req.remarks && <Text style={styles.meta}>Remarks: {req.remarks}</Text>}
      </Card>

      {req.type === 'blood' && req.bloodInfo && (
        <Card>
          <Text style={styles.h2}>Blood Request Details</Text>
          {Object.entries(req.bloodInfo).map(([k, v]) => v != null && v !== '' ? <Text key={k} style={styles.meta}>{k}: {String(v)}</Text> : null)}
        </Card>
      )}
      {req.type !== 'blood' && req.details && (
        <Card>
          <Text style={styles.h2}>Request Details</Text>
          {Object.entries(req.details).map(([k, v]) => v != null && v !== '' ? <Text key={k} style={styles.meta}>{k}: {String(v)}</Text> : null)}
        </Card>
      )}

      <Card>
        <Text style={styles.h2}>Admin Actions</Text>
        <Input label="Remarks" value={remarks} onChangeText={setRemarks} placeholder="Add remarks (required for rejection)" />
        <Button title="Mark Under Review" onPress={() => act('review', { remarks: remarks || 'Under review' }, 'Marked under review')} loading={saving} variant="outline" />
        <Button title="Approve" onPress={() => act('approve', { remarks: remarks || 'Approved' }, 'Request approved')} loading={saving} />
        <Button title="Reject" onPress={() => act('reject', { remarks }, 'Request rejected')} loading={saving} variant="danger" />
      </Card>

      <Card>
        <Text style={styles.h2}>Disbursement</Text>
        {disb ? (
          <>
            <Text style={styles.meta}>Amount: PKR {Number(disb.amount || 0).toLocaleString()}</Text>
            <Text style={styles.meta}>Method: {disb.method}</Text>
            <Text style={styles.meta}>Date: {new Date(disb.createdAt).toLocaleString()}</Text>
          </>
        ) : <Text style={styles.meta}>No disbursement yet. Approve request before disbursing.</Text>}
        {req.status === 'approved' && (
          <>
            <Input label="Amount (PKR)" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" />
            <Input label="Method" value={method} onChangeText={setMethod} placeholder="bank_transfer / cash / cheque" />
            <Button title="Disburse Funds" onPress={() => act('disburse', { amount: Number(amount), method, fundType: req.fundType || 'general' }, 'Funds disbursed')} loading={saving} />
          </>
        )}
      </Card>
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
});
