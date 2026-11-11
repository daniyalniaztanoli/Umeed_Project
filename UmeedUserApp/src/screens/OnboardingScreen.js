import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { ClipboardList, HandHeart, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const SLIDES = [
  { key: 'report', icon: <ClipboardList size={64} color={colors.careGreen} strokeWidth={2} />, title: 'Report', body: 'Report campus issues quickly with details and photos.' },
  { key: 'welfare', icon: <HandHeart size={64} color={colors.careGreen} strokeWidth={2} />, title: 'Welfare', body: 'Request welfare, blood, and community support with care.' },
  { key: 'track', icon: <MapPin size={64} color={colors.careGreen} strokeWidth={2} />, title: 'Track', body: 'Track complaints, requests, and updates in one place.' },
];
export const ONBOARDING_KEY = 'umeed_onboarding_done_v1';

export default function OnboardingScreen({ onDone }) {
  const [index, setIndex] = useState(0);
  const ref = useRef(null);

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    onDone?.();
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={ref}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.key}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.icon}>{item.icon}</View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>{SLIDES.map((s, i) => <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />)}</View>
        <TouchableOpacity style={styles.btn} onPress={index === SLIDES.length - 1 ? finish : () => ref.current?.scrollToIndex({ index: index + 1, animated: true })}>
          <Text style={styles.btnText}>{index === SLIDES.length - 1 ? 'Get started' : 'Next'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={finish}><Text style={styles.skip}>Skip</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  slide: { width, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { marginBottom: 18 },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink },
  body: { fontSize: 16, color: colors.gray, textAlign: 'center', marginTop: 12, lineHeight: 24 },
  footer: { padding: 24, paddingBottom: 36 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lightGray, marginHorizontal: 4 },
  dotActive: { width: 22, backgroundColor: colors.careGreen },
  btn: { backgroundColor: colors.careGreen, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  skip: { textAlign: 'center', color: colors.gray, marginTop: 14, fontWeight: '600' },
});