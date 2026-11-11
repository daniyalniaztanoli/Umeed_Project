import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import { UMEED_CONTACT } from '../../data/supportContent';

const openUrl = async (url, fallbackMessage) => {
  try {
    const ok = await Linking.canOpenURL(url);
    if (!ok) return Alert.alert('Not available', fallbackMessage);
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert('Could not open', fallbackMessage);
  }
};

const normalizePhone = (p) => String(p || '').replace(/[^\d+]/g, '');
const waNumber = (p) => normalizePhone(p).replace(/^\+/, '');

export default function ContactScreen() {
  const c = UMEED_CONTACT;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>{c.name}</Text>
        <Text style={styles.meta}>{c.address}</Text>
        <Text style={styles.meta}>{c.hours}</Text>
      </Card>
      <Card>
        <Text style={styles.heading}>Reach us</Text>
        <TouchableOpacity style={styles.action} onPress={() => openUrl(`tel:${normalizePhone(c.phone)}`, 'Calling is not available on this device.')}>
          <Text style={styles.actionIcon}>📞</Text>
          <View style={{ flex: 1 }}><Text style={styles.actionTitle}>Call</Text><Text style={styles.actionSub}>{c.phone}</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => openUrl(`https://wa.me/${waNumber(c.whatsapp)}`, 'WhatsApp is not available.')}>
          <Text style={styles.actionIcon}>💬</Text>
          <View style={{ flex: 1 }}><Text style={styles.actionTitle}>WhatsApp</Text><Text style={styles.actionSub}>{c.whatsapp}</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => openUrl(`mailto:${c.email}?subject=${encodeURIComponent('Umeed App Support')}`, 'Email app is not available.')}>
          <Text style={styles.actionIcon}>✉️</Text>
          <View style={{ flex: 1 }}><Text style={styles.actionTitle}>Email</Text><Text style={styles.actionSub}>{c.email}</Text></View>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  heading: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  meta: { fontSize: 14, color: colors.gray, marginTop: 4 },
  action: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.mist },
  actionIcon: { fontSize: 22, width: 36 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  actionSub: { fontSize: 13, color: colors.gray, marginTop: 2 },
});