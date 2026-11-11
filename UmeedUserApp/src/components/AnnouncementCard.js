import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, LayoutAnimation, Platform, UIManager, Linking } from 'react-native';
import { ChevronDown, Pin } from 'lucide-react-native';
import { colors } from '../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const isNew = (createdAt) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 48 * 60 * 60 * 1000;
};

export default function AnnouncementCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const pinned = item?.pinned === true || item?.important === true;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggle}
      style={[styles.card, pinned && styles.pinnedCard]}
    >
      <View style={styles.row}>
        {pinned && <Pin size={14} color={colors.careGreen} strokeWidth={2} style={{ marginRight: 6 }} />}
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={expanded ? undefined : 1}>
              {item?.title || 'Announcement'}
            </Text>
            {isNew(item?.createdAt) && (
              <View style={styles.newBadge}>
                <Text style={styles.newText}>New</Text>
              </View>
            )}
          </View>
          <Text style={styles.date}>{item?.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Text>
          <Text style={styles.body} numberOfLines={expanded ? undefined : 2}>
            {item?.body || item?.content || ''}
          </Text>
          {expanded && item?.image ? (
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          ) : null}
          {expanded && (item?.author || item?.department) ? (
            <Text style={styles.meta}>{item?.author || item?.department}</Text>
          ) : null}
          {expanded && item?.link ? (
            <TouchableOpacity style={styles.openBtn} onPress={() => Linking.openURL(item.link)}>
              <Text style={styles.openText}>Open</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <ChevronDown
          size={18}
          color={colors.gray}
          strokeWidth={2}
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }], marginLeft: 6 }}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  pinnedCard: {
    borderColor: colors.careGreen,
    backgroundColor: colors.careGreen + '10',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink, flex: 1 },
  date: { fontSize: 11, color: colors.gray, marginTop: 2, marginBottom: 6 },
  body: { fontSize: 14, lineHeight: 22, color: colors.ink },
  image: { width: '100%', height: 160, borderRadius: 10, marginTop: 10 },
  meta: { fontSize: 12, color: colors.gray, marginTop: 6, fontStyle: 'italic' },
  openBtn: { marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.careGreen },
  openText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  newBadge: { backgroundColor: colors.careGreen, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  newText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
