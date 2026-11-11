import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export function Input({ label, error, value, onChangeText, placeholder, secureTextEntry, editable = true, containerStyle, inputStyle }) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        editable={editable}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 6 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  inputError: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  error: { fontSize: 11, color: '#ef4444', marginTop: 4, fontWeight: '600' },
});
