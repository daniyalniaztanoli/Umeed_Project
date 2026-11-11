import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar } from 'react-native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !phone || !newPassword) return Alert.alert('Error', 'Email, phone and new password are required');
    if (String(newPassword).length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim(),
        phone: phone.trim(),
        newPassword,
      });
      Alert.alert('Success', data?.message || 'Password updated successfully', [
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert('Reset Failed', e?.response?.data?.message || e.userMessage || getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Verify your registered email and phone number to set a new password.</Text>
          <View style={styles.card}>
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="admin@umeed.org" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Registered Phone" value={phone} onChangeText={setPhone} placeholder="03XXXXXXXXX" keyboardType="phone-pad" />
            <Input label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="At least 6 characters" secureTextEntry />
            <Button title="Reset Password" onPress={handleReset} loading={loading} />
            <Button title="Back to Login" variant="outline" onPress={() => navigation.navigate('Login')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingTop: 70 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 14, color: colors.gray, marginTop: 6, lineHeight: 20 },
  card: { marginTop: 20, backgroundColor: '#fff', borderRadius: 20, padding: 18, elevation: 3 },
});
