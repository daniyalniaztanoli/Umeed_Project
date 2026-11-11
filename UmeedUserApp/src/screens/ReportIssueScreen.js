import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../api/client';
import { getApiErrorMessage } from '../api/apiHandler';
import { loadDraft, saveDraft, clearDraft } from '../utils/draftStorage';
import { colors } from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import ResultModal from '../components/ResultModal';
import { X } from 'lucide-react-native';

const DRAFT_KEY = 'draft_report_issue';
const CATEGORIES = ['Facilities', 'Cleanliness', 'Hostel', 'Safety', 'Academic', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function ReportIssueScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Facilities');
  const [priority, setPriority] = useState('Medium');
  const [images, setImages] = useState([]);
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState({ visible: false, type: 'success', title: '', message: '' });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const draftReady = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const draft = await loadDraft(DRAFT_KEY);
      if (!mounted || !draft) {
        draftReady.current = true;
        return;
      }
      if (draft.title != null) setTitle(draft.title);
      if (draft.description != null) setDescription(draft.description);
      if (draft.category) setCategory(draft.category);
      if (draft.priority) setPriority(draft.priority);
      if (Array.isArray(draft.images)) setImages(draft.images);
      if (draft.building != null) setBuilding(draft.building);
      if (draft.room != null) setRoom(draft.room);
      draftReady.current = true;
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!draftReady.current) return;
    const t = setTimeout(() => {
      saveDraft(DRAFT_KEY, { title, description, category, priority, images, building, room });
    }, 400);
    return () => clearTimeout(t);
  }, [title, description, category, priority, images, building, room]);

  const setField = (key, setter) => (value) => {
    setter(value);
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: '' }));
  };

  const pickImage = () => {
    const remaining = 3 - images.length;
    if (remaining <= 0) {
      return setResult({ visible: true, type: 'error', title: 'Limit reached', message: 'You can attach up to 3 photos.' });
    }
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7, selectionLimit: remaining },
      (res) => {
        if (res.didCancel || res.errorCode) return;
        const picked = (res.assets || []).slice(0, remaining);
        if (picked.length) setImages((prev) => [...prev, ...picked].slice(0, 3));
      },
    );
  };

  const uploadImages = async () => {
    if (images.length === 0) return [];
    const form = new FormData();
    images.forEach((img, i) => {
      form.append('files', {
        uri: img.uri,
        name: img.fileName || `photo-${i}.jpg`,
        type: img.type || 'image/jpeg',
      });
    });
    const { data } = await api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.urls || [];
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitConfirmed = async () => {
    setConfirmVisible(false);
    setLoading(true);
    try {
      const uploadedUrls = await uploadImages();
      await api.post('/complaints', {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        images: uploadedUrls,
        location: { building: building.trim(), room: room.trim() },
      });
      await clearDraft(DRAFT_KEY);
      setResult({
        visible: true,
        type: 'success',
        title: 'Complaint submitted',
        message: 'Your issue has been received. We’ll keep you updated in My Issues.',
      });
    } catch (e) {
      setResult({
        visible: true,
        type: 'error',
        title: 'Submission failed',
        message: getApiErrorMessage(e),
      });
    } finally {
      setLoading(false);
    }
  };

  const closeResult = () => {
    const wasSuccess = result.type === 'success';
    setResult((r) => ({ ...r, visible: false }));
    if (wasSuccess) {
      reset();
      navigation.navigate('MyIssues');
    }
  };

  const reset = () => {
    setTitle(''); setDescription(''); setImages([]); setBuilding(''); setRoom('');
    setCategory('Facilities'); setPriority('Medium'); setFieldErrors({});
  };

  const [dupWarning, setDupWarning] = useState({ visible: false, matches: [] });

  const checkDuplicateAndConfirm = async () => {
    if (!validate()) return;
    const b = building.trim().toLowerCase();
    const c = category;
    if (!b) {
      setConfirmVisible(true);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/complaints/mine');
      const list = Array.isArray(data) ? data : [];
      const matches = list.filter((x) => {
        const sameCat = (x.category || '') === c;
        const sameBuilding = String(x.location?.building || '').trim().toLowerCase() === b;
        const active = !['Resolved', 'Rejected'].includes(x.status);
        return sameCat && sameBuilding && active;
      });
      if (matches.length) setDupWarning({ visible: true, matches });
      else setConfirmVisible(true);
    } catch {
      setConfirmVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    checkDuplicateAndConfirm();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Report an Issue</Text>
        <Text style={styles.subtitle}>Help us improve the campus</Text>

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} onPress={() => setCategory(c)}
              style={[styles.chip, category === c && styles.chipActive]}>
              <Text style={[styles.chipText, category === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Input
          label="Title *"
          value={title}
          onChangeText={setField('title', setTitle)}
          placeholder="Broken bench in Library"
          error={fieldErrors.title}
        />
        <Input
          label="Description *"
          value={description}
          onChangeText={setField('description', setDescription)}
          placeholder="Describe the issue..."
          multiline
          error={fieldErrors.description}
        />

        <Text style={styles.label}>Priority</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity key={p} onPress={() => setPriority(p)}
              style={[styles.chip, priority === p && styles.chipActive, { flex: 1 }]}>
              <Text style={[styles.chipText, priority === p && { color: '#fff' }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Building" value={building} onChangeText={setBuilding} placeholder="Library" />
        <Input label="Room / Area" value={room} onChangeText={setRoom} placeholder="2nd floor" />

        <Text style={styles.label}>Photos ({images.length}/3)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {images.map((img, i) => (
            <View key={`${img.uri}-${i}`} style={styles.thumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.thumb} />
              <TouchableOpacity
                onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                style={styles.removeThumb}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity onPress={pickImage} style={styles.addPhoto}>
              <Text style={{ fontSize: 24, color: colors.careGreen }}>+</Text>
              <Text style={styles.addPhotoText}>Add photos</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button title="Submit Complaint" onPress={handleSubmit} loading={loading} />
      </ScrollView>

      <ResultModal
        visible={dupWarning.visible}
        type="error"
        title="Possible duplicate"
        message={`You already have ${dupWarning.matches.length} active ${category} complaint(s) for this building. Submit anyway?`}
        primaryLabel="Submit anyway"
        secondaryLabel="Review"
        onPrimary={() => { setDupWarning({ visible: false, matches: [] }); setConfirmVisible(true); }}
        onSecondary={() => setDupWarning({ visible: false, matches: [] })}
        onRequestClose={() => setDupWarning({ visible: false, matches: [] })}
      />

      <ResultModal
        visible={confirmVisible}
        type="success"
        title="Submit complaint?"
        message="Please confirm your details are correct before submitting."
        primaryLabel="Submit"
        secondaryLabel="Review"
        onPrimary={submitConfirmed}
        onSecondary={() => setConfirmVisible(false)}
        onRequestClose={() => setConfirmVisible(false)}
      />

      <ResultModal
        visible={result.visible}
        type={result.type}
        title={result.title}
        message={result.message}
        primaryLabel={result.type === 'success' ? 'View My Issues' : 'Try again'}
        onPrimary={closeResult}
        onRequestClose={closeResult}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 14, color: colors.gray, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, marginRight: 8, alignItems: 'center' },
  chipActive: { backgroundColor: colors.careGreen, borderColor: colors.careGreen },
  chipText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  thumbWrap: { position: 'relative' },
  thumb: { width: 74, height: 74, borderRadius: 12 },
  removeThumb: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 74,
    height: 74,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.careGreen,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  addPhotoText: { fontSize: 9, color: colors.careGreen, fontWeight: '700', marginTop: 1 },
});
