import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Umeed</Text>
      <Text style={styles.subtitle}>امید — Campus Welfare</Text>
      <ActivityIndicator color={colors.white} style={{ marginTop: 30 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.careGreen, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 120, height: 120, borderRadius: 28 },
  title: { fontSize: 40, fontWeight: '800', color: '#fff', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#fff', opacity: 0.9, marginTop: 4 },
});