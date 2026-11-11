import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import ResultModal from '../components/ResultModal';
import { Plus, Camera } from 'lucide-react-native';

const FLOATERS = [
  {
    size: 220,
    color: 'rgba(22, 163, 74, 0.18)',
    top: -70,
    left: -60,
    dur: 5400,
  },
  {
    size: 160,
    color: 'rgba(13, 148, 136, 0.16)',
    top: 80,
    right: -50,
    dur: 6300,
  },
  {
    size: 110,
    color: 'rgba(245, 158, 11, 0.14)',
    top: 20,
    left: 90,
    dur: 4800,
  },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: '',
    phone: '',
    city: '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  // ── Entrance animations ──────────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const photoScale = useRef(new Animated.Value(0)).current;
  const photoOpacity = useRef(new Animated.Value(0)).current;
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
      Animated.timing(photoScale, {
        toValue: 1,
        duration: 500,
        delay: 400,
        easing: Easing.out(Easing.back),
        useNativeDriver: true,
      }),
      Animated.timing(photoOpacity, {
        toValue: 1,
        duration: 500,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(cardY, {
        toValue: 0,
        duration: 650,
        delay: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 650,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating background blobs
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

  const pickPhoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      res => {
        if (res.didCancel || res.errorCode) return;
        const asset = res.assets?.[0];
        if (asset) setPhoto(asset);
      },
    );
  };

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setResult({
        visible: true,
        type: 'error',
        title: 'Missing details',
        message: 'Name, email, and password are required.',
      });
    }
    if (form.password.length < 6) {
      return setResult({
        visible: true,
        type: 'error',
        title: 'Weak password',
        message: 'Password must be at least 6 characters.',
      });
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(form.phone.trim())) {
      return setResult({
        visible: true,
        type: 'error',
        title: 'Invalid phone',
        message: 'Please enter a valid phone number (e.g. 03001234567).',
      });
    }
    if (!form.city.trim()) {
      return setResult({
        visible: true,
        type: 'error',
        title: 'Missing city',
        message: 'City is required.',
      });
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        studentId: form.studentId.trim(),
        department: form.department.trim(),
        city: form.city.trim(),
      }).forEach(([k, v]) => {
        if (v) data.append(k, v);
      });
      if (photo?.uri) {
        data.append('profilePic', {
          uri: photo.uri,
          name: photo.fileName || 'profile.jpg',
          type: photo.type || 'image/jpeg',
        });
      }
      await register(data);
    } catch (e) {
      setResult({
        visible: true,
        type: 'error',
        title: 'Registration failed',
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
      {/* Gradient-style header band */}
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
                  transform: [
                    { translateX: floaters[i].x },
                    { translateY: floaters[i].y },
                  ],
                },
              ]}
            />
          ))}

          <Animated.Text
            style={[
              styles.title,
              { opacity: titleOpacity, transform: [{ translateY: titleY }] },
            ]}
          >
            Create Account
          </Animated.Text>
          <Animated.Text
            style={[styles.subtitle, { opacity: subtitleOpacity }]}
          >
            Join Umeed — where hope begins 🌱
          </Animated.Text>

          {/* Animated profile photo picker */}
          <Animated.View
            style={{
              opacity: photoOpacity,
              transform: [{ scale: photoScale }],
              alignSelf: 'center',
              marginTop: 22,
            }}
          >
            <TouchableOpacity
              style={styles.photoPicker}
              activeOpacity={0.85}
              onPress={pickPhoto}
            >
              {photo?.uri ? (
                <Image source={{ uri: photo.uri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Plus size={26} color={colors.careGreen} strokeWidth={2} />
                  <Text style={styles.photoHint}>Add photo</Text>
                </View>
              )}
              <View style={styles.photoBadge}>
                <Camera size={14} color={colors.white} strokeWidth={2.2} />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Profile photo (optional)</Text>
          </Animated.View>

          {/* Elevated form card */}
          <Animated.View
            style={[
              styles.card,
              { opacity: cardOpacity, transform: [{ translateY: cardY }] },
            ]}
          >
            <Input
              label="Full Name *"
              value={form.name}
              onChangeText={set('name')}
              placeholder="Ali Khan"
            />
            <Input
              label="Email *"
              value={form.email}
              onChangeText={set('email')}
              placeholder="you@campus.edu"
              keyboardType="email-address"
            />
            <Input
              label="Password *"
              value={form.password}
              onChangeText={set('password')}
              placeholder="Min 6 characters"
              secureTextEntry
            />
            <Input
              label="Student ID"
              value={form.studentId}
              onChangeText={set('studentId')}
              placeholder="BSCS-2021-045"
            />
            <Input
              label="Department"
              value={form.department}
              onChangeText={set('department')}
              placeholder="Computer Science"
            />
            <Input
              label="Phone *"
              value={form.phone}
              onChangeText={set('phone')}
              placeholder="03001234567"
              keyboardType="phone-pad"
            />
            <Input
              label="City *"
              value={form.city}
              onChangeText={set('city')}
              placeholder="Your city"
            />

            <Button
              title="Register"
              onPress={handleRegister}
              loading={loading}
            />
            <Button
              title="Back to Login"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.footer}>Your hope, our mission. 💚</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ResultModal
        visible={result.visible}
        type={result.type}
        title={result.title}
        message={result.message}
        primaryLabel="Try again"
        onPrimary={() => setResult(r => ({ ...r, visible: false }))}
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
    height: 150,
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
  container: { padding: 24, paddingTop: 48, paddingBottom: 40 },
  blob: { position: 'absolute', opacity: 1 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  photoPicker: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.careGreen,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: colors.careGreen,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  photoBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.trustTeal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  photoHint: {
    fontSize: 10,
    color: colors.careGreen,
    fontWeight: '700',
    marginTop: 2,
  },
  photoLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.gray,
    marginTop: 6,
  },
  card: {
    marginTop: 22,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  footer: {
    textAlign: 'center',
    color: colors.gray,
    fontSize: 12,
    marginTop: 18,
    fontWeight: '600',
  },
});
