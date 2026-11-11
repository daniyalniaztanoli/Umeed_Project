import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function EventFormScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('event');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [contact, setContact] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title || !description) return Alert.alert('Error', 'Title and description are required');
    setSaving(true);
    try {
      const payload = { title, description, type, location, organizer, contact };
      if (date) payload.date = date;
      await api.post('/events', payload);
      Alert.alert('Saved', 'Event created'); navigation.goBack();
    } catch (e) { Alert.alert('Error', getApiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Card>
        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Event title" />
        <Input label="Type" value={type} onChangeText={setType} placeholder="event / campaign" />
        <Input label="Date (YYYY-MM-DD or ISO)" value={date} onChangeText={setDate} placeholder="2026-12-01" />
        <Input label="Location" value={location} onChangeText={setLocation} placeholder="Venue" />
        <Input label="Organizer" value={organizer} onChangeText={setOrganizer} placeholder="Organizer name" />
        <Input label="Contact" value={contact} onChangeText={setContact} placeholder="Contact info" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Details..." multiline />
        <Button title="Create Event" onPress={save} loading={saving} />
      </Card>
    </ScrollView>
  );
}
