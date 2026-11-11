import React from 'react';
import { Text, StyleSheet, ScrollView, Linking } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.p}>Umeed collects account details you provide (name, email, phone, student/department details, optional profile photo) to provide campus support and welfare services.</Text>
        <Text style={styles.p}>Complaint, welfare, donation, volunteer, and feedback submissions are used to process requests, verify donations, and improve services. Uploaded images/proofs are stored for service handling and verification.</Text>
        <Text style={styles.p}>Blood Donor Directory shows contact details only for users who explicitly consent in a blood donation request. You can avoid directory listing by not giving contact consent.</Text>
        <Text style={styles.p}>Notifications are used for service updates related to your requests. We do not sell personal data. Access is limited by role and authentication.</Text>
        <Text style={styles.p}>For deletion/correction requests, contact Umeed support through the Contact screen.</Text>
        <Button title="Open hosted policy URL (placeholder)" variant="outline" onPress={() => Linking.openURL('https://umeedfoundation.org/privacy').catch(() => {})} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  p: { fontSize: 14, color: colors.gray, lineHeight: 22, marginBottom: 10 },
});