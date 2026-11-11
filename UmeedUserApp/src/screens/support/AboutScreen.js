import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Umeed Foundation</Text>
        <Text style={styles.subtitle}>Campus support, welfare, and community care</Text>
        <Text style={styles.body}>
          Umeed helps students report campus issues, request welfare support, find community resources, and stay informed through announcements and events.
        </Text>
      </Card>
      <Card>
        <Text style={styles.heading}>Our mission</Text>
        <Text style={styles.body}>To make campus support accessible, transparent, and dignified — connecting students with help when they need it.</Text>
      </Card>
      <Card>
        <Text style={styles.heading}>What you can do here</Text>
        <Text style={styles.bullet}>• Report and track campus complaints</Text>
        <Text style={styles.bullet}>• Request welfare and blood support</Text>
        <Text style={styles.bullet}>• Find consented blood donors</Text>
        <Text style={styles.bullet}>• Join events and volunteer</Text>
        <Text style={styles.bullet}>• Send feedback and suggestions</Text>
      </Card>
      <Card>
        <Text style={styles.heading}>App version</Text>
        <Text style={styles.body}>UmeedUserApp v0.0.1 (development build)</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 13, color: colors.trustTeal, fontWeight: '700', marginTop: 4 },
  heading: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  body: { fontSize: 14, color: colors.gray, lineHeight: 21, marginTop: 6 },
  bullet: { fontSize: 14, color: colors.ink, lineHeight: 22 },
});