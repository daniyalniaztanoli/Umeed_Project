import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ResultModal from '../../components/ResultModal';
import { colors } from '../../theme/colors';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { Star } from 'lucide-react-native';

const CATS = ['feedback', 'suggestion', 'help', 'other'];

export default function FeedbackScreen() {
  const [category, setCategory] = useState('feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState({ visible: false, type: 'success', title: '', message: '' });

  const submit = async () => {
    const next = {};
    if (!message.trim()) next.message = 'Please enter your message.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await api.post('/suggestions', { category, subject: subject.trim(), message: message.trim(), rating: rating || undefined });
      setSubject(''); setMessage(''); setRating(0); setCategory('feedback');
      setResult({ visible: true, type: 'success', title: 'Thank you', message: 'Your feedback was submitted successfully.' });
    } catch (e) {
      setResult({ visible: true, type: 'error', title: 'Could not submit', message: getApiErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.label}>Category</Text>
          <View style={styles.row}>
            {CATS.map((c) => (
              <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Rating (optional)</Text>
          <View style={styles.row}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Star size={28} color={s <= rating ? '#F4B400' : colors.lightGray} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
          <Input label="Subject (optional)" value={subject} onChangeText={setSubject} placeholder="Short subject" />
          <Input label="Message *" value={message} onChangeText={(v) => { setMessage(v); if (errors.message) setErrors({}); }} placeholder="Share your feedback or suggestion" multiline error={errors.message} />
          <Button title={loading ? 'Submitting...' : 'Submit feedback'} onPress={submit} loading={loading} />
        </Card>
      </ScrollView>
      <ResultModal visible={result.visible} type={result.type} title={result.title} message={result.message} primaryLabel="OK" onPrimary={() => setResult((r) => ({ ...r, visible: false }))} onRequestClose={() => setResult((r) => ({ ...r, visible: false }))} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 8, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  chipActive: { backgroundColor: colors.careGreen, borderColor: colors.careGreen },
  chipText: { fontSize: 13, color: colors.ink, fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: '#fff' },
});