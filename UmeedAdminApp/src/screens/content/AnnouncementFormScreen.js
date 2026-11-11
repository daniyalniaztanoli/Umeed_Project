import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function AnnouncementFormScreen({ route, navigation }) {
  const existing = route.params?.item;
  const [title, setTitle] = useState(existing?.title || '');
  const [body, setBody] = useState(existing?.body || '');
  const [audience, setAudience] = useState(existing?.audience || 'all');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title || !body) return Alert.alert('Error', 'Title and body are required');
    setSaving(true);
    try {
      if (existing?._id) await api.put(`/announcements/${existing._id}`, { title, body, audience });
      else await api.post('/announcements', { title, body, audience });
      Alert.alert('Saved', 'Announcement saved'); navigation.goBack();
    } catch (e) { Alert.alert('Error', getApiErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <Card>
        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Announcement title" />
        <Input label="Audience" value={audience} onChangeText={setAudience} placeholder="all / students / staff / donors" />
        <Input label="Body" value={body} onChangeText={setBody} placeholder="Write announcement..." multiline />
        <Button title={existing ? 'Update Announcement' : 'Create Announcement'} onPress={save} loading={saving} />
      </Card>
    </ScrollView>
  );
}
