import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import Card from '../components/Card';
import Button from '../components/Button';
import { BASE_URL } from '../api/client';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const serverOrigin = BASE_URL.replace(/\/api\/?$/, '');
  const photoUri = user?.profilePic
    ? /^https?:\/\//i.test(user.profilePic)
      ? user.profilePic
      : `${serverOrigin}${user.profilePic.startsWith('/') ? '' : '/'}${user.profilePic}`
    : null;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={{ fontSize: 40, color: '#fff', fontWeight: '700' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>

      <Card style={{ marginTop: 24 }}>
        <Row label="Email" value={user?.email} />
        {user?.studentId && <Row label="Student ID" value={user.studentId} />}
        {user?.department && <Row label="Department" value={user.department} />}
        {user?.phone && <Row label="Phone" value={user.phone} />}
{user?.city && <Row label="City" value={user.city} />}
      </Card>

      <Button title="Logout" variant="outline" onPress={handleLogout} />
    </ScrollView>
  );
}

const Row = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.lightGray }}>
    <Text style={{ color: colors.gray, fontSize: 13 }}>{label}</Text>
    <Text style={{ color: colors.ink, fontSize: 14, fontWeight: '600' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.careGreen, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 90, height: 90, borderRadius: 45, alignSelf: 'center', borderWidth: 3, borderColor: colors.careGreen },
  name: { fontSize: 22, fontWeight: '800', color: colors.ink, textAlign: 'center', marginTop: 12 },
  role: { fontSize: 12, color: colors.trustTeal, textAlign: 'center', marginTop: 4, fontWeight: '700', letterSpacing: 1 },
});