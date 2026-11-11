import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Menu, User } from 'lucide-react-native';

export function Header({ onMenuPress, user }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
        <Menu size={22} strokeWidth={2.5} color="#111827" />
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</Text>
        <Text style={styles.subtitle}>
          {user?.role ? user.role.replace('_', ' ') : ''}
        </Text>
      </View>
      <View style={styles.avatar}>
        <User size={24} strokeWidth={2.5} color="#111827" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  menuBtn: { padding: 6 },
  titleWrap: { flex: 1, marginHorizontal: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
});
