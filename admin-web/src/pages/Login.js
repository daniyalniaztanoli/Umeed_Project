import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Alert } from 'react-native';
import { Mail, Lock, Eye, EyeOff, Loader as LoaderIcon } from 'lucide-react-native';

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    const e = { email: '', password: '' };
    if (!email) e.email = 'Email is required.';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Minimum 6 characters.';
    setErrors(e);
    return !e.email && !e.password;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImg}
          />
        </View>
        <Text style={styles.brandName}>🌱 Umeed</Text>
        <Text style={styles.brandSub}>Admin Panel</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign in</Text>
        <Text style={styles.cardSub}>Enter your admin credentials to continue</Text>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Email address</Text>
          <View style={styles.inputRow}>
            <Mail size={18} strokeWidth={2} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="admin@umeed.org"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.inputRow}>
            <Lock size={18} strokeWidth={2} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={showPass}
            />
            <TouchableOpacity
              onPress={() => setShowPass((s) => !s)}
              style={styles.toggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPass ? <EyeOff size={18} strokeWidth={2} color="#9ca3af" /> : <Eye size={18} strokeWidth={2} color="#9ca3af" />}
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.btnLoading}>
              <ActivityIndicator size={16} color="#fff" />
              <Text style={styles.btnTextLoading}>Signing in…</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Sign In →</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.note}>
          <Text style={styles.noteIcon}>🔒</Text>
          <Text style={styles.noteText}>
            This panel is restricted to <Text style={styles.noteBold}>admin</Text> and{' '}
            <Text style={styles.noteBold}>finance officer</Text> accounts only.
          </Text>
        </View>

        <Text style={styles.footer}>
          Umeed © {new Date().getFullYear()} · All rights reserved
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fffe', alignItems: 'center', justifyContent: 'center', padding: 20 },
  brand: { alignItems: 'center', marginBottom: 24 },
  logoWrap: { width: 64, height: 64, borderRadius: 22, backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoImg: { width: 40, height: 40 },
  brandName: { fontSize: 26, fontWeight: '800', color: '#111827' },
  brandSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, borderWidth: 1, borderColor: '#f2f2f2' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#111827', paddingVertical: 11 },
  error: { fontSize: 11, color: '#ef4444', fontWeight: '600', marginTop: 4, marginLeft: 2 },
  btn: { backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnTextLoading: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginHorizontal: 8, textTransform: 'uppercase' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#dbeafe', borderRadius: 14, padding: 12, marginBottom: 16 },
  noteIcon: { fontSize: 18 },
  noteText: { fontSize: 12, color: '#1d4ed8', lineHeight: 18, flex: 1 },
  noteBold: { fontWeight: '700' },
  footer: { fontSize: 11, color: '#9ca3af', textAlign: 'center' },
});
