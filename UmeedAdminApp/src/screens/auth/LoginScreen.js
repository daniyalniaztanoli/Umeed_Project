import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import logo from '../../assets/images/logo.png';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      const msg = 'Please enter email and password';
      setErrorMsg(msg);
      return Alert.alert('Error', msg);
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Login failed';
      setErrorMsg(msg);
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.careGreen} />
      <View style={styles.headerBand} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}><Image source={logo} style={styles.logo} resizeMode="contain" /></View>
          <Text style={styles.title}>Umeed Admin</Text>
          <Text style={styles.subtitle}>Sign in with an admin account to continue</Text>
          <View style={styles.card}>
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="admin@umeed.org" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
            <Button title="Login" onPress={handleLogin} loading={loading} />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 6 }}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
            <Text style={styles.note}>Only admin accounts can access this app. Normal user accounts will be rejected.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerBand: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: colors.careGreen, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  container: { padding: 24, paddingTop: 90 },
  logoWrap: { width: 96, height: 96, borderRadius: 28, backgroundColor: '#fff', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', elevation: 8 },
  logo: { width: 64, height: 64 },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, textAlign: 'center', marginTop: 18 },
  subtitle: { fontSize: 14, color: colors.gray, textAlign: 'center', marginTop: 6 },
  card: { marginTop: 28, backgroundColor: '#fff', borderRadius: 22, padding: 18, elevation: 4 },
  error: { color: colors.red, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  note: { fontSize: 12, color: colors.gray, textAlign: 'center', marginTop: 10, lineHeight: 18 },
  link: { color: colors.careGreen, textAlign: 'center', fontWeight: '700', fontSize: 13 },
});
