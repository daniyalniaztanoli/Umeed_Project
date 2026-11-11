import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import { FAQS } from '../../data/supportContent';

export default function FaqScreen() {
  const [open, setOpen] = useState(0);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>Common questions about complaints, welfare, and community support.</Text>
      {FAQS.map((item, i) => {
        const expanded = open === i;
        return (
          <Card key={item.q} style={{ padding: 0 }}>
            <TouchableOpacity style={styles.qRow} onPress={() => setOpen(expanded ? -1 : i)} activeOpacity={0.85}>
              <Text style={styles.q}>{item.q}</Text>
              <Text style={styles.chev}>{expanded ? '−' : '+'}</Text>
            </TouchableOpacity>
            {expanded && <Text style={styles.a}>{item.a}</Text>}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  intro: { fontSize: 14, color: colors.gray, marginBottom: 12, lineHeight: 20 },
  qRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  q: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.ink, marginRight: 10 },
  chev: { fontSize: 22, color: colors.careGreen, fontWeight: '700', width: 20, textAlign: 'center' },
  a: { fontSize: 14, color: colors.gray, lineHeight: 21, paddingHorizontal: 16, paddingBottom: 16 },
});