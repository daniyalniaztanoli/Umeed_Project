import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import logo from '../../assets/images/logo.png';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    // Auth state is resolved by AuthProvider; RootNavigator switches stacks.
    // This screen is shown while loading or as an initial visual.
    const t = setTimeout(() => {}, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title}>Umeed Admin</Text>
      <Text style={styles.subtitle}>Management Portal</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.careGreen, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { width: 110, height: 110, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 8 },
  logo: { width: 72, height: 72 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 18 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
});
