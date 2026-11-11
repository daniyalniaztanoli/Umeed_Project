import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from 'react-native';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import api from '../../api/client';

export default function ResourcesScreen() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api
      .get('/resources')
      .then(res =>
        setItems(
          Array.isArray(res.data)
            ? res.data.filter(r => r.isPublished !== false)
            : [],
        ),
      )
      .catch(() => setItems([]));
  }, []);

  if (items === null) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const bookBank = items.filter(r => r.type === 'book_bank');
  const scholarships = items.filter(r => r.type === 'scholarship');
  const others = items.filter(r => r.type === 'other');

  const renderItem = r => (
    <View key={r._id} style={styles.itemWrap}>
      <Text style={styles.itemTitle}>{r.title}</Text>
      {!!r.description && <Text style={styles.item}>{r.description}</Text>}
      {!!r.contact && <Text style={styles.item}>Contact: {r.contact}</Text>}
      {!!r.link && (
        <TouchableOpacity onPress={() => Linking.openURL(r.link)}>
          <Text style={styles.link}>Open link</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.heading}>Book Bank</Text>
        {bookBank.length ? (
          bookBank.map(renderItem)
        ) : (
          <Text style={styles.empty}>No book bank info yet.</Text>
        )}
      </Card>
      <Card>
        <Text style={styles.heading}>Scholarships & Support</Text>
        {scholarships.length ? (
          scholarships.map(renderItem)
        ) : (
          <Text style={styles.empty}>No scholarship info yet.</Text>
        )}
      </Card>
      {!!others.length && (
        <Card>
          <Text style={styles.heading}>Other Resources</Text>
          {others.map(renderItem)}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  heading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 10,
  },
  item: { fontSize: 14, color: colors.gray, lineHeight: 21, marginBottom: 6 },
  itemTitle: {
    fontSize: 14,
    color: colors.ink,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemWrap: { marginBottom: 12 },
  link: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  empty: { fontSize: 13, color: colors.gray, fontStyle: 'italic' },
});
