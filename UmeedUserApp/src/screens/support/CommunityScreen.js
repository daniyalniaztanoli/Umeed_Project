import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';
import {
  HeartHandshake,
  Receipt,
  ChartNoAxesCombined,
  Sparkle,
  HandHeart,
  Calendar,
  UsersRound,
  CircleHelp,
  Phone,
  Info,
  Book,
  Lock,
  FileText,
  User,
} from 'lucide-react-native';

const ITEMS = [
  { title: 'Donate / Support Umeed', desc: 'Zakat, Sadqa, Fitra, General Fund with proof upload.', icon: HeartHandshake, screen: 'Donate' },
  { title: 'Donation History', desc: 'View your donations and receipts.', icon: Receipt, screen: 'DonationHistory' },
  { title: 'Transparency', desc: 'Received, spent, and remaining balance summary.', icon: ChartNoAxesCombined, screen: 'Transparency' },
  { title: 'Impact Stories', desc: 'Stories of support and change.', icon: Sparkle, screen: 'ImpactStories' },
  { title: 'Blood Donor Directory', desc: 'Search consented donors by group and city. Call or WhatsApp.', icon: HandHeart, screen: 'BloodDonors' },
  { title: 'Events & Campaigns', desc: 'Blood camps, ration drives, book drives and more.', icon: Calendar, screen: 'Events' },
  { title: 'Volunteer Signup', desc: 'Offer your time and skills for Umeed activities.', icon: UsersRound, screen: 'Volunteer' },
  { title: 'FAQ / Help', desc: 'Answers to common questions.', icon: CircleHelp, screen: 'Faq' },
  { title: 'Contact Umeed', desc: 'Call, WhatsApp, or email support.', icon: Phone, screen: 'Contact' },
  { title: 'Feedback & Suggestions', desc: 'Help us improve the app and services.', icon: Info, screen: 'Feedback' },
  { title: 'Book Bank & Scholarships', desc: 'Learning resources and support information.', icon: Book, screen: 'Resources' },
  { title: 'Privacy Policy', desc: 'How data is collected and used.', icon: Lock, screen: 'PrivacyPolicy' },
  { title: 'Terms of Use', desc: 'Rules for using Umeed services.', icon: FileText, screen: 'Terms' },
  { title: 'About Umeed', desc: 'Mission, purpose, and app version.', icon: Info, screen: 'About' },
  { title: 'My Profile', desc: 'View your account details and logout.', icon: User, screen: 'Profile' },
];

export default function CommunityScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Community & Support</Text>
      <Text style={styles.sub}>Find help, connect with donors, join events, and share feedback.</Text>
      {ITEMS.map((item) => (
        <TouchableOpacity key={item.screen} activeOpacity={0.85} onPress={() => navigation.navigate(item.screen)}>
          <Card style={styles.card}>
            <item.icon size={24} color={colors.ink} strokeWidth={2} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 60, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 14, color: colors.gray, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  cardDesc: { fontSize: 13, color: colors.gray, marginTop: 2, lineHeight: 18 },
  chev: { fontSize: 24, color: colors.lightGray, fontWeight: '700' },
});