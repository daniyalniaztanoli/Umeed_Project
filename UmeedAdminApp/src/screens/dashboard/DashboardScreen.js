import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bell, Users, ClipboardList, HandHeart, HeartHandshake, Megaphone, CalendarDays, MessageSquare } from 'lucide-react-native';
import api from '../../api/client';
import { getApiErrorMessage } from '../../api/apiHandler';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ErrorState from '../../components/ErrorState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ pending: {}, complaints: {}, welfare: {} });
  const [unread, setUnread] = useState(0);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [pending, cStats, wStats, notif] = await Promise.all([
        api.get('/admin/pending-counts').catch(() => ({ data: {} })),
        api.get('/complaints/stats').catch(() => ({ data: {} })),
        api.get('/welfare/stats').catch(() => ({ data: {} })),
        api.get('/notifications').catch(() => ({ data: { unreadCount: 0 } })),
      ]);
      setStats({ pending: pending.data || {}, complaints: cStats.data || {}, welfare: wStats.data || {} });
      setUnread(notif.data?.unreadCount || 0);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Welcome back</Text>
          <Text style={styles.name}>{user?.name || 'Admin'}</Text>
          <Text style={styles.role}>{String(user?.role || 'admin').replace('_', ' ')}</Text>
        </View>
        <TouchableOpacity style={styles.bell} onPress={() => navigation.navigate('Notifications')}>
          <Bell size={22} color={colors.ink} />
          {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View>}
        </TouchableOpacity>
      </View>

      {!!error && <ErrorState message={error} onRetry={() => load()} style={{ marginBottom: 12 }} />}

      {loading ? <LoadingSkeleton rows={4} /> : (
        <>
          <Text style={styles.section}>Overview</Text>
          <View style={styles.grid}>
            <Stat label="Pending Complaints" value={stats.pending.complaints ?? stats.complaints.pending ?? 0} color={colors.warmAmber} icon={<ClipboardList size={18} color={colors.warmAmber} />} onPress={() => navigation.navigate('ComplaintsTab')} />
            <Stat label="Open Welfare" value={stats.pending.welfare ?? stats.welfare.submitted ?? 0} color={colors.trustTeal} icon={<HandHeart size={18} color={colors.trustTeal} />} onPress={() => navigation.navigate('WelfareTab')} />
            <Stat label="Donations" value={stats.pending.donations ?? 0} color={colors.careGreen} icon={<HeartHandshake size={18} color={colors.careGreen} />} onPress={() => navigation.navigate('DonationsTab')} />
            <Stat label="Resolved Issues" value={stats.complaints.resolved ?? 0} color={colors.blue || '#2563EB'} icon={<ClipboardList size={18} color={colors.blue || '#2563EB'} />} onPress={() => navigation.navigate('ComplaintsTab')} />
          </View>

          <Text style={styles.section}>Quick Manage</Text>
          <Card>
            <QuickRow icon={<Megaphone size={18} color={colors.careGreen} />} label="Announcements" onPress={() => navigation.navigate('Announcements')} />
            <QuickRow icon={<CalendarDays size={18} color={colors.trustTeal} />} label="Events & Campaigns" onPress={() => navigation.navigate('Events')} />
            <QuickRow icon={<Users size={18} color={colors.blue || '#2563EB'} />} label="Users & Staff" onPress={() => navigation.navigate('Users')} />
            <QuickRow icon={<MessageSquare size={18} color={colors.warmAmber} />} label="Feedback & Volunteers" onPress={() => navigation.navigate('MoreTab')} last />
          </Card>

          <Card style={{ marginTop: 4 }}>
            <Text style={styles.cardTitle}>Welfare Summary</Text>
            <Text style={styles.meta}>Total: {stats.welfare.total ?? 0}  •  Approved: {stats.welfare.approved ?? 0}  •  Disbursed: {stats.welfare.disbursed ?? 0}</Text>
            <Text style={styles.meta}>Total Disbursed: PKR {Number(stats.welfare.totalDisbursed || 0).toLocaleString()}</Text>
          </Card>

          <Button title="Logout" variant="danger" onPress={logout} />
        </>
      )}
    </ScrollView>
  );
}

const Stat = ({ label, value, color, icon, onPress }) => (
  <TouchableOpacity style={[styles.stat, { borderColor: color + '33' }]} onPress={onPress} activeOpacity={0.85}>
    <View style={{ marginBottom: 6 }}>{icon}</View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const QuickRow = ({ icon, label, onPress, last }) => (
  <TouchableOpacity style={[styles.quickRow, last && { borderBottomWidth: 0 }]} onPress={onPress}>
    <View style={styles.quickIcon}>{icon}</View>
    <Text style={styles.quickLabel}>{label}</Text>
    <Text style={styles.chev}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  hello: { fontSize: 13, color: colors.gray, fontWeight: '600' },
  name: { fontSize: 24, fontWeight: '800', color: colors.ink, marginTop: 2 },
  role: { fontSize: 12, color: colors.careGreen, fontWeight: '700', marginTop: 2, textTransform: 'capitalize' },
  bell: { padding: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.lightGray },
  badge: { position: 'absolute', top: 4, right: 4, backgroundColor: colors.red, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  section: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 10, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  stat: { width: '48.5%', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, color: colors.gray, marginTop: 2, fontWeight: '600' },
  quickRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  quickIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  quickLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink },
  chev: { fontSize: 22, color: colors.gray },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  meta: { fontSize: 13, color: colors.gray, marginTop: 2 },
});
