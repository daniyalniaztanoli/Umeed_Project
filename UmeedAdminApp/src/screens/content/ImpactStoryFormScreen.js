import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ImpactStoryFormScreen({ route, navigation }) {
  const existing = route.params?.item;
  const [title, setTitle] = useState(existing?.title || '');
  const [summary, setSummary] = useState(existing?.summary || '');
  const [body, setBody] = useState(existing?.body || '');
  const [category, setCategory] = useState(existing?.category || 'general');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title || !summary) return Alert.alert('Error', 'Title and summary are required');
    setSaving(true);
    try {
      const payload = { title, summary, body, category, isPublished: true };
      if (existing?._id) await api.put(`/impact-stories/${existing._id}`, payload);
      else await api.post('/impact-stories', payload);
      Alert.alert('Saved', 'Impact story saved'); navigation.goBack();
    } catch (e) { Alert.alert('Error', getApiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Card>
        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Story title" />
        <Input label="Category" value={category} onChangeText={setCategory} placeholder="general / education / health / welfare..." />
        <Input label="Summary" value={summary} onChangeText={setSummary} placeholder="Short summary" multiline />
        <Input label="Body" value={body} onChangeText={setBody} placeholder="Full story (optional)" multiline />
        <Button title={existing ? 'Update Story' : 'Create Story'} onPress={save} loading={saving} />
      </Card>
    </ScrollView>
  );
}
