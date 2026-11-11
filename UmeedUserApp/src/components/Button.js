import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Button({ title, onPress, loading, variant = 'primary', disabled }) {
  const bg = variant === 'primary' ? colors.careGreen : colors.white;
  const textColor = variant === 'primary' ? colors.white : colors.careGreen;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, opacity: disabled || loading ? 0.6 : 1 },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.careGreen }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginVertical: 8 },
  text: { fontSize: 16, fontWeight: '600' },
});