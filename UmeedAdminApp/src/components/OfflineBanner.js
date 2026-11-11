import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors } from '../theme/colors';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sub = NetInfo.addEventListener((s) => setOffline(!(s.isConnected && s.isInternetReachable !== false)));
    return () => sub();
  }, []);
  if (!offline) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.red, paddingVertical: 6, alignItems: 'center' },
  text: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
