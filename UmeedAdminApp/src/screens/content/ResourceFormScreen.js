import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ResourceFormScreen({ route, navigation }) {
  const existing = route.params?.item;
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [type, setType] = useState(existing?.type || 'book_bank');
  const [link, setLink] = useState(existing?.link || '');
  const [contact, setContact] = useState(existing?.contact || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title) return Alert.alert('Error', 'Title is required');
    setSaving(true);
    try {
      const payload = { title, description, type, link, contact, isPublished: true };
      if (existing?._id) await api.put(`/resources/${existing._id}`, payload);
      else await api.post('/resources', payload);
      Alert.alert('Saved', 'Resource saved'); navigation.goBack();
    } catch (e) { Alert.alert('Error', getApiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Card>
        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Resource title" />
        <Input label="Type" value={type} onChangeText={setType} placeholder="book_bank / scholarship / other" />
        <Input label="Link" value={link} onChangeText={setLink} placeholder="https://..." />
        <Input label="Contact" value={contact} onChangeText={setContact} placeholder="Contact info" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Details..." multiline />
        <Button title={existing ? 'Update Resource' : 'Create Resource'} onPress={save} loading={saving} />
      </Card>
    </ScrollView>
  );
}
