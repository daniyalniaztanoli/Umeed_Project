import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors, fontSizes, spacing } from '../theme';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      const down = state.isConnected === false || state.isInternetReachable === false;
      setOffline(down);
    });
    NetInfo.fetch().then((state) => {
      setOffline(state.isConnected === false || state.isInternetReachable === false);
    }).catch(() => {});
    return () => sub();
  }, []);

  if (!offline) return null;

  return (
    <View style={styles.bar}>
      <Text style={styles.text}>No internet connection. Some features may not work.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#92400E',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  text: { color: colors.white, fontSize: fontSizes.sm, fontWeight: '600', textAlign: 'center' },
});
