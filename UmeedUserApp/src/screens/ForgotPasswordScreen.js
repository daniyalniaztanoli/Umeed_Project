import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { LockKeyhole } from 'lucide-react-native';
import api from '../api/client';
import { colors } from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import ResultModal from '../components/ResultModal';

const FLOATERS = [
  {
    size: 220,
    color: 'rgba(22, 163, 74, 0.18)',
    top: -70,
    left: -60,
    dur: 5200,
  },
  {
    size: 160,
    color: 'rgba(13, 148, 136, 0.16)',
    top: 70,
    right: -50,
    dur: 6100,
  },
  {
    size: 110,
    color: 'rgba(245, 158, 11, 0.14)',
    top: 10,
    left: 90,
    dur: 4700,
  },
];

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });

  // ── Entrance animations ──────────────────────────────────────────
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const floaters = useRef(
    FLOATERS.map(() => ({
      y: new Animated.Value(0),
      x: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
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
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 550,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 550,
        delay: 350,
        useNativeDriver: true,
      }),
      Animated.timing(cardY, {
        toValue: 0,
        duration: 650,
        delay: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 650,
        delay: 450,
        useNativeDriver: true,
      }),
    ]).start();

    floaters.forEach((f, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(f.y, {
              toValue: 18,
              duration: FLOATERS[i].dur,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(f.x, {
              toValue: i % 2 ? -14 : 14,
              duration: FLOATERS[i].dur,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(f.y, {
              toValue: 0,
              duration: FLOATERS[i].dur,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(f.x, {
              toValue: 0,
              duration: FLOATERS[i].dur,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = async () => {
    if (!email.trim() || !phone.trim() || !newPassword || !confirmPassword) {
      return setResult({
        visible: true,
        type: 'error',
        title: 'Missing details',
        message: 'Email, phone, and new password are required.',
      });
    }
    if (newPassword.length < 6) {
      return setResult({
        visible: true,
        type: 'error',
        title: 'Weak password',
        message: 'Password must be at least 6 characters.',
      });
    }
    if (newPassword !== confirmPassword) {
      return setResult({
        visible: true,
        type: 'error',
        title: 'Password mismatch',
        message: 'New password and confirm password do not match.',
      });
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', {
        email: email.trim(),
        phone: phone.trim(),
        newPassword,
      });
      setResult({
        visible: true,
        type: 'success',
        title: 'Password updated',
        message:
          'Your password has been changed. You can now login with the new password.',
        onSuccess: () => navigation.goBack(),
      });
    } catch (e) {
      setResult({
        visible: true,
        type: 'error',
        title: 'Reset failed',
        message:
          e.response?.data?.message ||
          'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.careGreen} />
      <View style={styles.headerBand}>
        <View style={styles.headerGlow} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
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
                  transform: [
                    { translateX: floaters[i].x },
                    { translateY: floaters[i].y },
                  ],
                },
              ]}
            />
          ))}

          <Animated.View
            style={[
              styles.iconWrap,
              { opacity: iconOpacity, transform: [{ scale: iconScale }] },
            ]}
          >
            <LockKeyhole size={40} color={colors.careGreen} strokeWidth={2} />
          </Animated.View>

          <Animated.Text
            style={[
              styles.title,
              { opacity: titleOpacity, transform: [{ translateY: titleY }] },
            ]}
          >
            Forgot Password?
          </Animated.Text>
          <Animated.Text
            style={[styles.subtitle, { opacity: subtitleOpacity }]}
          >
            Verify your registered email and phone to reset your password
          </Animated.Text>

          <Animated.View
            style={[
              styles.card,
              { opacity: cardOpacity, transform: [{ translateY: cardY }] },
            ]}
          >
            <Input
              label="Registered Email *"
              value={email}
              onChangeText={setEmail}
              placeholder="you@campus.edu"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Registered Phone *"
              value={phone}
              onChangeText={setPhone}
              placeholder="03001234567"
              keyboardType="phone-pad"
            />
            <Input
              label="New Password *"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Min 6 characters"
              secureTextEntry
            />
            <Input
              label="Confirm New Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              secureTextEntry
            />

            <Button
              title="Reset Password"
              onPress={handleReset}
              loading={loading}
            />
            <Button
              title="Back to Login"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.note}>
              🔒 Both email and phone must exactly match your registered
              account.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ResultModal
        visible={result.visible}
        type={result.type}
        title={result.title}
        message={result.message}
        primaryLabel={result.type === 'success' ? 'Go to Login' : 'Try again'}
        onPrimary={() => {
          const goBack = result.type === 'success';
          setResult(r => ({ ...r, visible: false }));
          if (goBack) navigation.goBack();
        }}
        onRequestClose={() => setResult(r => ({ ...r, visible: false }))}
      />
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
    height: 170,
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
  container: { padding: 24, paddingTop: 64, paddingBottom: 40 },
  blob: { position: 'absolute', opacity: 1 },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 26,
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },
  card: {
    marginTop: 28,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  note: {
    textAlign: 'center',
    color: colors.gray,
    fontSize: 12,
    marginTop: 16,
    fontWeight: '600',
  },
});
