import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Easing,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import logo from '../assets/images/logo.png';
import Input from '../components/Input';
import Button from '../components/Button';

const FLOATERS = [
  { size: 220, color: 'rgba(22, 163, 74, 0.18)', top: -70, left: -60, dur: 5200 },
  { size: 160, color: 'rgba(13, 148, 136, 0.16)', top: 60, right: -50, dur: 6100 },
  { size: 110, color: 'rgba(245, 158, 11, 0.14)', top: 10, left: 90, dur: 4700 },
];

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Entrance animations ──────────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const floaters = useRef(
    FLOATERS.map(() => ({
      y: new Animated.Value(0),
      x: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(titleY, {
        toValue: 0,
        duration: 550,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 550, delay: 250, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 550, delay: 400, useNativeDriver: true }),
      Animated.timing(formY, {
        toValue: 0,
        duration: 650,
        delay: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, { toValue: 1, duration: 650, delay: 450, useNativeDriver: true }),
    ]).start();

    // Infinite logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.07, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();

    // Floating background blobs
    floaters.forEach((f, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(f.y, { toValue: 18, duration: FLOATERS[i].dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(f.x, { toValue: i % 2 ? -14 : 14, duration: FLOATERS[i].dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(f.y, { toValue: 0, duration: FLOATERS[i].dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(f.x, { toValue: 0, duration: FLOATERS[i].dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        ]),
      ).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Login Failed', e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.careGreen} />
      {/* Gradient-style header band */}
      <View style={styles.headerBand}>
        <View style={styles.headerGlow} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Floating decorative blobs */}
          {FLOATERS.map((f, i) => (
            <Animated.View
              key={i}
              style={[
                styles.blob,
                {
                  width: f.size,
                  height: f.size,
                  borderRadius: f.size / 2,
                  backgroundColor: f.color,
                  top: f.top,
                  left: f.left,
                  right: f.right,
                  transform: [{ translateX: floaters[i].x }, { translateY: floaters[i].y }],
                },
              ]}
            />
          ))}

          {/* Animated logo */}
          <Animated.View style={{ alignItems: 'center' }}>
            <Animated.View
              style={[
                styles.logoWrap,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: Animated.multiply(logoScale, pulse) }],
                },
              ]}
            >
              <Image source={logo} style={styles.logoImage} resizeMode="contain" />
            </Animated.View>
          </Animated.View>

          <Animated.Text style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
            Welcome Back
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Login to continue with Umeed
          </Animated.Text>

          <Animated.View style={[styles.card, { opacity: formOpacity, transform: [{ translateY: formY }] }]}>
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@campus.edu" keyboardType="email-address" />
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} activeOpacity={0.7}>
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>
            <Button title="Login" onPress={handleLogin} loading={loading} />
            <Button title="Create Account" variant="outline" onPress={() => navigation.navigate('Register')} />
            <Text style={styles.footer}>Your hope, our mission. 💚</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 210,
    backgroundColor: colors.careGreen,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: -110,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(13, 148, 136, 0.45)',
  },
  container: { padding: 24, paddingTop: 84 },
  blob: { position: 'absolute', opacity: 1 },
  logoWrap: {
    width: 104,
    height: 104,
    borderRadius: 30,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  logo: { fontSize: 56, textAlign: 'center' },
  logoImage: { width: 68, height: 68 },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 15, color: colors.gray, textAlign: 'center', marginTop: 4 },
  card: {
    marginTop: 30,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  footer: { textAlign: 'center', color: colors.gray, fontSize: 12, marginTop: 18, fontWeight: '600' },
  forgotLink: {
    textAlign: 'right',
    color: colors.trustTeal,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 14,
  },
});
