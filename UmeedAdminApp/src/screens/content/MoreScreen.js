import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Megaphone, CalendarDays, BookOpen, Sparkles, Users, Droplets, MessageSquare, UserCog, Building2, BadgeCheck, UserCircle } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';

export default function MoreScreen({ navigation }) {
  const { user, logout } = useAuth();
  const items = [
    { label: 'Announcements', icon: Megaphone, screen: 'Announcements', desc: 'Create and manage announcements' },
    { label: 'Events & Campaigns', icon: CalendarDays, screen: 'Events', desc: 'Manage campus events and campaigns' },
    { label: 'Resources', icon: BookOpen, screen: 'Resources', desc: 'Book bank, scholarships, and resources' },
    { label: 'Impact Stories', icon: Sparkles, screen: 'ImpactStories', desc: 'Publish impact and transparency stories' },
    { label: 'Volunteers', icon: Users, screen: 'Volunteers', desc: 'View volunteer signups' },
    { label: 'Blood Donors', icon: Droplets, screen: 'BloodDonors', desc: 'Consented donor directory' },
    { label: 'Feedback', icon: MessageSquare, screen: 'Feedback', desc: 'Complaint and app feedback' },
    { label: 'Users', icon: UserCircle, screen: 'Users', desc: 'Manage user accounts and roles' },
    { label: 'Staff', icon: BadgeCheck, screen: 'Staff', desc: 'Manage staff records' },
    { label: 'Departments', icon: Building2, screen: 'Departments', desc: 'Manage departments' },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 30 }}>
      <Text style={styles.title}>Manage Content</Text>
      <Text style={styles.sub}>Signed in as {user?.name} ({String(user?.role || '').replace('_', ' ')})</Text>
      <Card>
        {items.map((it, idx) => {
          const Icon = it.icon;
          return (
            <TouchableOpacity key={it.label} style={[styles.row, idx === items.length - 1 && { borderBottomWidth: 0 }]} onPress={() => navigation.navigate(it.screen)}>
              <View style={styles.iconWrap}><Icon size={18} color={colors.careGreen} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{it.label}</Text>
                <Text style={styles.desc}>{it.desc}</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </TouchableOpacity>
          );
        })}
      </Card>
      <Card>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Profile')}><View style={styles.iconWrap}><UserCog size={18} color={colors.trustTeal} /></View><Text style={styles.label}>Profile</Text><Text style={styles.chev}>›</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={() => Alert.alert('Logout', 'Sign out of Umeed Admin?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}><View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}><UserCog size={18} color={colors.red} /></View><Text style={[styles.label, { color: colors.red }]}>Logout</Text><Text style={styles.chev}>›</Text></TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 13, color: colors.gray, marginTop: 4, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  label: { fontSize: 15, fontWeight: '700', color: colors.ink },
  desc: { fontSize: 12, color: colors.gray, marginTop: 1 },
  chev: { fontSize: 22, color: colors.gray, marginLeft: 8 },
});
