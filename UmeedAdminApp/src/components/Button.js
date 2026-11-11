import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Button({ title, onPress, loading, variant = 'primary', disabled, style, textStyle }) {
  const bg = variant === 'primary' ? colors.careGreen : variant === 'danger' ? colors.red : colors.white;
  const textColor = variant === 'outline' ? colors.careGreen : variant === 'ghost' ? colors.careGreen : colors.white;
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: variant === 'outline' || variant === 'ghost' ? colors.white : bg, opacity: disabled || loading ? 0.6 : 1 },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.careGreen },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginVertical: 6, paddingHorizontal: 14 },
  text: { fontSize: 15, fontWeight: '700' },
});
