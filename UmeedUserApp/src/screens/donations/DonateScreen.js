import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ResultModal from '../../components/ResultModal';
import { colors } from '../../theme/colors';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { Check } from 'lucide-react-native';

const CATEGORIES = [
  { key: 'zakat', label: 'Zakat' },
  { key: 'sadqa', label: 'Sadqa' },
  { key: 'fitra', label: 'Fitra' },
  { key: 'general', label: 'General Fund' },
];
const METHODS = [
  { key: 'jazzcash', label: 'JazzCash', info: 'Send to JazzCash: 0300-0000000 (Umeed Foundation). Use reference in transaction note.' },
  { key: 'easypaisa', label: 'Easypaisa', info: 'Send to Easypaisa: 0300-0000000 (Umeed Foundation). Save transaction ID as reference.' },
  { key: 'bank_transfer', label: 'Bank Transfer', info: 'Bank: Example Bank, Account: 0000-0000-0000, Title: Umeed Foundation. Share transfer reference.' },
];

export default function DonateScreen({ navigation }) {
  const [category, setCategory] = useState('general');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('jazzcash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [proof, setProof] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState({ visible: false, type: 'success', title: '', message: '', donationId: null });

  const methodInfo = METHODS.find((m) => m.key === method)?.info;

  const pickProof = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, (res) => {
      if (res.didCancel || res.errorCode) return;
      const asset = res.assets?.[0];
      if (asset) setProof(asset);
    });
  };

  const submit = async () => {
    const next = {};
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) next.amount = 'Enter a valid amount.';
    if (!reference.trim()) next.reference = 'Payment reference/transaction ID is required.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('amount', String(Number(amount)));
      form.append('category', category);
      form.append('method', method);
      form.append('reference', reference.trim());
      form.append('notes', notes.trim());
      form.append('isAnonymous', isAnonymous ? 'true' : 'false');
      if (proof?.uri) form.append('proof', { uri: proof.uri, name: proof.fileName || 'proof.jpg', type: proof.type || 'image/jpeg' });
      const { data } = await api.post('/donations', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAmount(''); setReference(''); setNotes(''); setProof(null); setIsAnonymous(false);
      setResult({ visible: true, type: 'success', title: 'Donation submitted', message: 'Your donation and proof were submitted for manual verification.', donationId: data?._id });
    } catch (e) {
      setResult({ visible: true, type: 'error', title: 'Submission failed', message: getApiErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.label}>Category</Text>
          <View style={styles.row}>{CATEGORIES.map((c) => (
            <TouchableOpacity key={c.key} style={[styles.chip, category === c.key && styles.chipActive]} onPress={() => setCategory(c.key)}>
              <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}</View>
          <Input label="Amount (PKR) *" value={amount} onChangeText={(v) => { setAmount(v); if (errors.amount) setErrors((e) => ({ ...e, amount: '' })); }} keyboardType="numeric" error={errors.amount} placeholder="e.g. 5000" />
          <Text style={styles.label}>Payment method</Text>
          <View style={styles.row}>{METHODS.map((m) => (
            <TouchableOpacity key={m.key} style={[styles.chip, method === m.key && styles.chipActive]} onPress={() => setMethod(m.key)}>
              <Text style={[styles.chipText, method === m.key && styles.chipTextActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}</View>
          {!!methodInfo && <Text style={styles.info}>{methodInfo}</Text>}
          <Input label="Reference / Transaction ID *" value={reference} onChangeText={(v) => { setReference(v); if (errors.reference) setErrors((e) => ({ ...e, reference: '' })); }} error={errors.reference} placeholder="Transaction reference" />
          <Input label="Notes (optional)" value={notes} onChangeText={setNotes} multiline placeholder="Any note for verification" />

          <Text style={styles.label}>Proof of payment (optional but recommended)</Text>
          <View style={styles.proofRow}>
            {proof?.uri ? <Image source={{ uri: proof.uri }} style={styles.proofImg} /> : null}
            <TouchableOpacity style={styles.proofBtn} onPress={pickProof}><Text style={styles.proofBtnText}>{proof ? 'Change proof' : 'Upload proof'}</Text></TouchableOpacity>
            {proof ? <TouchableOpacity onPress={() => setProof(null)}><Text style={styles.remove}>Remove</Text></TouchableOpacity> : null}
          </View>

          <TouchableOpacity style={styles.anonRow} onPress={() => setIsAnonymous((v) => !v)} activeOpacity={0.85}>
            <View style={[styles.checkbox, isAnonymous && styles.checkboxOn]}>{isAnonymous && <Check size={14} color="#fff" strokeWidth={2} />}</View>
            <Text style={styles.anonText}>Donate anonymously (your name/contact will not be shown publicly)</Text>
          </TouchableOpacity>

          <Button title={loading ? 'Submitting...' : 'Submit donation'} onPress={submit} loading={loading} />
          <Button title="View donation history" variant="outline" onPress={() => navigation.navigate('DonationHistory')} />
        </Card>
      </ScrollView>
      <ResultModal visible={result.visible} type={result.type} title={result.title} message={result.message}
        primaryLabel={result.type === 'success' && result.donationId ? 'View receipt' : 'OK'}
        secondaryLabel={result.type === 'success' ? 'Close' : undefined}
        onPrimary={() => { setResult((r) => ({ ...r, visible: false })); if (result.type === 'success' && result.donationId) navigation.navigate('DonationReceipt', { id: result.donationId }); }}
        onSecondary={() => setResult((r) => ({ ...r, visible: false }))}
        onRequestClose={() => setResult((r) => ({ ...r, visible: false }))} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 8, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  chipActive: { backgroundColor: colors.careGreen, borderColor: colors.careGreen },
  chipText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  info: { fontSize: 13, color: colors.gray, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 12, lineHeight: 19 },
  proofRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  proofImg: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.lightGray },
  proofBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.careGreen },
  proofBtnText: { color: colors.careGreen, fontWeight: '700' },
  remove: { color: colors.red, fontWeight: '600' },
  anonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.lightGray, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  checkboxOn: { backgroundColor: colors.careGreen, borderColor: colors.careGreen },
  tick: { color: '#fff', fontWeight: '800' },
  anonText: { flex: 1, fontSize: 13, color: colors.ink, lineHeight: 19 },
});