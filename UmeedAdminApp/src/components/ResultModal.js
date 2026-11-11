import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Check, AlertCircle } from 'lucide-react-native';

export default function ResultModal({
  visible,
  type = 'success',
  title,
  message,
  primaryLabel = 'OK',
  secondaryLabel,
  onPrimary,
  onSecondary,
  onRequestClose,
}) {
  const success = type === 'success';
  const accent = success ? colors.careGreen : colors.red;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose || onPrimary}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
            <View style={[styles.iconInner, { backgroundColor: accent }]}>
              {success ? <Check size={30} color="#fff" strokeWidth={2} /> : <AlertCircle size={30} color="#fff" strokeWidth={2} />}
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPrimary}
            style={[styles.primaryBtn, { backgroundColor: accent }]}
          >
            <Text style={styles.primaryText}>{primaryLabel}</Text>
          </TouchableOpacity>

          {!!secondaryLabel && (
            <TouchableOpacity activeOpacity={0.8} onPress={onSecondary} style={styles.secondaryBtn}>
              <Text style={[styles.secondaryText, { color: accent }]}>{secondaryLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 14,
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 4,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 2,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
