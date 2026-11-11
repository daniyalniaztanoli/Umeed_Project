import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const groups = [
  { title: null, items: [{ label: 'Dashboard', key: 'Dashboard', iconKey: 'Layout' }] },
  {
    title: 'CORE',
    items: [
      { label: 'Complaints', key: 'Complaints', iconKey: 'AlertCircle' },
      { label: 'Welfare', key: 'Welfare', iconKey: 'Heart' },
      { label: 'Donations', key: 'Donations', iconKey: 'DollarSign' },
    ],
  },
  {
    title: 'COMMUNITY',
    items: [
      { label: 'Blood Donors', key: 'BloodDonors', iconKey: 'Droplet' },
      { label: 'Events', key: 'Events', iconKey: 'Calendar' },
      { label: 'Volunteers', key: 'Volunteers', iconKey: 'UserCheck' },
      { label: 'Impact Stories', key: 'ImpactStories', iconKey: 'Heart' },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { label: 'Announcements', key: 'Announcements', iconKey: 'Bell' },
      { label: 'Notifications', key: 'Notifications', iconKey: 'Bell' },
      { label: 'Feedback', key: 'Feedback', iconKey: 'MessageSquare' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Users', key: 'Users', iconKey: 'Users' },
      { label: 'Staff', key: 'Staff', iconKey: 'UserCheck' },
      { label: 'Departments', key: 'Departments', iconKey: 'Grid' },
      { label: 'Resources', key: 'Resources', iconKey: 'Book' },
    ],
  },
  { title: null, items: [{ label: 'Reports', key: 'Reports', iconKey: 'FileText' }] },
];

export function DrawerMenu({ navigation }) {
  const { logout } = useContext(AuthContext);
  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <View style={styles.logoBg}>🌱</View>
          </View>
          <View style={styles.brand}>
            <Text style={styles.brandName}>Umeed</Text>
            <Text style={styles.brandSub}>Admin Panel</Text>
          </View>
        </View>

        {groups.map((group) => {
          if (!group.title) {
            return (
              <View key={group.items[0].key} style={styles.section}>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => navigation.navigate(item.key)}
                    style={styles.item}
                  >
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          }
          return (
            <View key={group.title} style={styles.groupWrap}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.section}>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => navigation.navigate(item.key)}
                    style={styles.item}
                  >
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.section} style={{ marginTop: 12 }}>
          <TouchableOpacity onPress={handleLogout} style={styles.item}>
            <View style={styles.logoutRow}>
              <LogOut size={16} strokeWidth={2} color="#ef4444" />
              <Text style={[styles.itemLabel, { color: '#ef4444', fontWeight: '700' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 280, backgroundColor: '#0f766e' },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: 8 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', marginBottom: 10 },
  logoWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoBg: { fontSize: 20 },
  brand: { flex: 1 },
  brandName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  groupTitle: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: 14, marginVertical: 8 },
  section: { paddingHorizontal: 4 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginHorizontal: 4, marginBottom: 4, backgroundColor: 'transparent' },
  itemLabel: { flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
