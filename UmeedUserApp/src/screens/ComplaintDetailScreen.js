import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api, { BASE_URL } from '../api/client';
import { colors } from '../theme/colors';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import ResultModal from '../components/ResultModal';
import { MapPin, Star } from 'lucide-react-native';

export default function ComplaintDetailScreen({ route }) {
  const { id } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [result, setResult] = useState({ visible: false, success: true, title: '', message: '' });

  const serverOrigin = BASE_URL.replace(/\/api\/?$/, '');
  const resolveImageUrl = (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    return `${serverOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data);
    } catch (e) {
      Alert.alert('Error', e.userMessage || e.response?.data?.message || 'Failed to load');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submitComment = async () => {
    const message = comment.trim();
    if (!message) return;
    setSendingComment(true);
    try {
      await api.post(`/complaints/${id}/comments`, { message });
      setComment('');
      await load({ silent: true });
      setResult({ visible: true, success: true, title: 'Comment sent', message: 'Your comment was added to the thread.' });
    } catch (e) {
      setResult({ visible: true, success: false, title: 'Could not send comment', message: e.userMessage || e.response?.data?.message || 'Please try again.' });
    } finally {
      setSendingComment(false);
    }
  };

  const submitReopen = () => {
    const reason = reopenReason.trim();
    if (!reason) {
      setResult({ visible: true, success: false, title: 'Reason required', message: 'Please explain why this complaint should be reopened.' });
      return;
    }
    Alert.alert('Reopen complaint?', 'This will move the complaint back to Reopened status.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reopen',
        style: 'destructive',
        onPress: async () => {
          setReopening(true);
          try {
            await api.put(`/complaints/${id}/reopen`, { reason });
            setReopenReason('');
            await load({ silent: true });
            setResult({ visible: true, success: true, title: 'Complaint reopened', message: 'The team can review your reason in the timeline.' });
          } catch (e) {
            setResult({ visible: true, success: false, title: 'Could not reopen', message: e.userMessage || e.response?.data?.message || 'Please try again.' });
          } finally {
            setReopening(false);
          }
        },
      },
    ]);
  };

  const submitFeedback = async () => {
    if (!feedbackRating) {
      setResult({ visible: true, success: false, title: 'Rating required', message: 'Please select a rating from 1 to 5.' });
      return;
    }
    setSendingFeedback(true);
    try {
      await api.post(`/complaints/${id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment.trim(),
      });
      await load({ silent: true });
      setResult({ visible: true, success: true, title: 'Feedback submitted', message: 'Thank you for rating the resolution.' });
    } catch (e) {
      setResult({ visible: true, success: false, title: 'Could not submit feedback', message: e.userMessage || e.response?.data?.message || 'Please try again.' });
    } finally {
      setSendingFeedback(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.careGreen} /></View>;
  if (!complaint) return <View style={styles.center}><Text>Not found</Text></View>;

  const timeline = (complaint.timeline || []).filter((t) => t && (t.type !== 'comment' ? true : true));
  const hasFeedback = !!(complaint.feedback && (complaint.feedback.rating || complaint.feedback.feedback || complaint.feedback.comment));

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={styles.title}>{complaint.title}</Text>
          <StatusBadge status={complaint.status} />
        </View>

        <Text style={styles.meta}>{complaint.category} • {complaint.priority} priority</Text>
        <Text style={styles.desc}>{complaint.description}</Text>

        {complaint.images?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
            {complaint.images.map((url, i) => {
              const src = resolveImageUrl(url);
              return (
                <TouchableOpacity key={`${src}-${i}`} activeOpacity={0.9} onPress={() => Linking.openURL(src)}>
                  <Image source={{ uri: src }} style={styles.img} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {complaint.location?.building && (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <MapPin size={14} color={colors.gray} strokeWidth={2} />
              <Text style={styles.label}>Location</Text>
            </View>
            <Text style={styles.value}>{complaint.location.building} {complaint.location.room && `— ${complaint.location.room}`}</Text>
          </Card>
        )}

        {complaint.status === 'Resolved' && !hasFeedback && (
          <Card>
            <Text style={styles.sectionInline}>Rate resolution</Text>
            <Text style={styles.hint}>How satisfied are you with the resolution?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setFeedbackRating(s)} activeOpacity={0.8}>
                  <Star size={30} color={s <= feedbackRating ? '#F4B400' : colors.lightGray} strokeWidth={2} style={{ marginRight: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              placeholder="Optional feedback"
              style={styles.input}
              multiline
            />
            <Button title={sendingFeedback ? 'Submitting...' : 'Submit rating'} onPress={submitFeedback} loading={sendingFeedback} />
          </Card>
        )}

        {complaint.status === 'Resolved' && hasFeedback && (
          <Card>
            <Text style={styles.sectionInline}>Your feedback</Text>
            <Text style={styles.value}>Rating: {complaint.feedback?.rating || '-'} / 5</Text>
            {(complaint.feedback?.comment || complaint.feedback?.feedback) ? (
              <Text style={styles.timelineNote}>{complaint.feedback?.comment || complaint.feedback?.feedback}</Text>
            ) : null}
          </Card>
        )}

        {complaint.status === 'Resolved' && (
          <Card>
            <Text style={styles.sectionInline}>Reopen complaint</Text>
            <Text style={styles.hint}>If the issue is not actually fixed, explain why.</Text>
            <TextInput
              value={reopenReason}
              onChangeText={setReopenReason}
              placeholder="Reason for reopening"
              style={styles.input}
              multiline
            />
            <Button title={reopening ? 'Reopening...' : 'Reopen complaint'} variant="outline" onPress={submitReopen} loading={reopening} />
          </Card>
        )}

        <Text style={styles.section}>Thread & timeline</Text>
        {timeline.map((t, i) => {
          const isComment = t.type === 'comment';
          return (
            <Card key={t._id || `${i}-${t.at || t.createdAt || ''}`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.timelineStatus}>{isComment ? `Comment • ${t.updatedBy?.name || 'Team/User'}` : t.status}</Text>
                  {isComment && t.updatedBy?.role ? <Text style={styles.metaSmall}>{t.updatedBy.role}</Text> : null}
                </View>
                <Text style={styles.timelineDate}>{new Date(t.at || t.createdAt).toLocaleString()}</Text>
              </View>
              {(t.note || t.remark) ? <Text style={styles.timelineNote}>{t.note || t.remark}</Text> : null}
            </Card>
          );
        })}

        <Card>
          <Text style={styles.sectionInline}>Add comment</Text>
          <Text style={styles.hint}>Share an update or reply to the admin/staff thread.</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Write a comment"
            style={styles.input}
            multiline
          />
          <Button title={sendingComment ? 'Sending...' : 'Send comment'} onPress={submitComment} loading={sendingComment} disabled={!comment.trim()} />
        </Card>
      </ScrollView>

      <ResultModal
        visible={result.visible}
        success={result.success}
        title={result.title}
        message={result.message}
        onClose={() => setResult((r) => ({ ...r, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, flex: 1, marginRight: 8 },
  meta: { fontSize: 13, color: colors.gray, marginBottom: 12 },
  metaSmall: { fontSize: 11, color: colors.gray, marginTop: 2, textTransform: 'capitalize' },
  desc: { fontSize: 15, color: colors.ink, lineHeight: 22, marginBottom: 12 },
  img: { width: 140, height: 140, borderRadius: 12, marginRight: 8 },
  label: { fontSize: 12, color: colors.gray, marginBottom: 4 },
  value: { fontSize: 15, color: colors.ink, fontWeight: '600' },
  section: { fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 16, marginBottom: 10 },
  sectionInline: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  hint: { fontSize: 13, color: colors.gray, marginBottom: 10 },
  timelineStatus: { fontSize: 14, fontWeight: '700', color: colors.ink },
  timelineDate: { fontSize: 11, color: colors.gray },
  timelineNote: { fontSize: 13, color: colors.gray, marginTop: 6, lineHeight: 19 },
  input: { borderWidth: 1, borderColor: colors.mist, borderRadius: 12, padding: 12, minHeight: 70, textAlignVertical: 'top', marginBottom: 10, color: colors.ink, backgroundColor: colors.surface },
  starsRow: { flexDirection: 'row', marginBottom: 10 },
});