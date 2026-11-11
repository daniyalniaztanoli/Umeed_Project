import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ResultModal from '../../components/ResultModal';
import { colors } from '../../theme/colors';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { useAuth } from '../../context/AuthContext';

const INTERESTS = ['Blood camp', 'Ration drive', 'Book drive', 'Teaching', 'Medical', 'Logistics', 'Other'];

export default function VolunteerScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [availability, setAvailability] = useState('');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState({ visible: false, type: 'success', title: '', message: '' });

  const toggle = (v) => setInterests((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const submit = async () => {
    const next = {};
    if (!name.trim()) next.name = 'Name is required.';
    if (!phone.trim()) next.phone = 'Phone is required.';
    if (!city.trim()) next.city = 'City is required.';
    if (!availability.trim()) next.availability = 'Availability is required.';
    if (interests.length === 0) next.interests = 'Select at least one interest.';
    setErrors(next);
    if (Object.keys(next).length) {
      Alert.alert('Missing fields', 'Please fill all required fields first.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/volunteers', { name: name.trim(), phone: phone.trim(), city: city.trim(), availability: availability.trim(), skills: skills.trim(), message: message.trim(), interests });
      setResult({ visible: true, type: 'success', title: 'Signup received', message: 'Thank you for volunteering. The Umeed team may contact you.' });
      setCity(''); setAvailability(''); setSkills(''); setMessage(''); setInterests([]);
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
          <Input label="Full name *" value={name} onChangeText={(v) => { setName(v); if (errors.name) setErrors((e) => ({ ...e, name: '' })); }} error={errors.name} />
          <Input label="Phone *" value={phone} onChangeText={(v) => { setPhone(v); if (errors.phone) setErrors((e) => ({ ...e, phone: '' })); }} keyboardType="phone-pad" error={errors.phone} />
          <Input label="City" value={city} onChangeText={setCity} />
          <Text style={styles.label}>Interests</Text>
          <View style={styles.row}>{INTERESTS.map((i) => (
            <TouchableOpacity key={i} style={[styles.chip, interests.includes(i) && styles.chipActive]} onPress={() => toggle(i)}>
              <Text style={[styles.chipText, interests.includes(i) && styles.chipTextActive]}>{i}</Text>
            </TouchableOpacity>
          ))}</View>
          <Input label="Availability" value={availability} onChangeText={setAvailability} placeholder="Weekends, evenings, etc." />
          <Input label="Skills (optional)" value={skills} onChangeText={setSkills} placeholder="First aid, teaching, driving..." />
          <Input label="Message (optional)" value={message} onChangeText={setMessage} multiline />
          <Button title={loading ? 'Submitting...' : 'Sign up as volunteer'} onPress={submit} loading={loading} />
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
  chipText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
});