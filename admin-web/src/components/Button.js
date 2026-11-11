import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';

export function Button({ children, variant = 'primary', onPress, disabled, style, testID }) {
  const base = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  };
  const variants = {
    primary: { backgroundColor: '#22C55E' },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#22C55E' },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: '#EF4444' },
  };
  const textColor = variant === 'outline' || variant === 'danger' || variant === 'ghost' ? '#22C55E' : '#fff';
  const disabledOpacity = 0.5;

  return (
    <TouchableOpacity
      style={[base, variants[variant], disabled && { opacity: disabledOpacity }, style]}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      activeOpacity={0.85}
    >
      {disabled && <ActivityIndicator size={16} color={textColor} style={{ marginRight: 6 }} />}
      <Text style={[styles.text, { color: textColor }, disabled && { opacity: 0.7 }]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
