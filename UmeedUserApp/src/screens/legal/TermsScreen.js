import React from 'react';
import { Text, StyleSheet, ScrollView, Linking } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Terms of Use</Text>
        <Text style={styles.p}>Use Umeed responsibly and provide accurate information for complaints, welfare requests, donations, and volunteer signups.</Text>
        <Text style={styles.p}>Donation submissions may require manual verification before confirmation. Proof-of-payment uploads help verification but do not guarantee acceptance if information is incomplete or invalid.</Text>
        <Text style={styles.p}>Welfare and blood support requests are reviewed by authorized staff. Submission does not guarantee approval, availability, or disbursement.</Text>
        <Text style={styles.p}>Do not misuse the platform, submit false emergencies, or share others’ private information without permission.</Text>
        <Text style={styles.p}>Umeed may update these terms and service features. Continued use means acceptance of updates.</Text>
        <Button title="Open hosted terms URL (placeholder)" variant="outline" onPress={() => Linking.openURL('https://umeedfoundation.org/terms').catch(() => {})} />
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