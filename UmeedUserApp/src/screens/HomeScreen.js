import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getApiErrorMessage } from '../api/apiHandler';
import { colors } from '../theme/colors';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AnnouncementCard from '../components/AnnouncementCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import {
  BadgeCheck,
  Bell,
  ChartNoAxesCombined,
  ClipboardList,
  Clock,
  HandHeart,
  HeartHandshake,
  UsersRound,
  Wrench,
  Plus,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const BANNER_W = width - 40;

const BANNERS = [
  {
    key: 'report',
    eyebrow: 'CAMPUS SUPPORT',
    title: 'Report an issue in minutes',
    body: 'Maintenance, safety, or facilities — track it from submission to resolution.',
    cta: 'Report now',
    bg: colors.careGreen,
    icon: <ClipboardList size={36} color="rgba(255,255,255,0.95)" strokeWidth={2} />,
    screen: 'Report',
  },
  {
    key: 'welfare',
    eyebrow: 'WELFARE',
    title: 'Need financial or study help?',
    body: 'Request fee aid, medical, books, or ration support with dignity and care.',
    cta: 'Open Welfare',
    bg: colors.trustTeal,
    icon: <HandHeart size={36} color="rgba(255,255,255,0.95)" strokeWidth={2} />,
    screen: 'Welfare',
  },
  {
    key: 'updates',
    eyebrow: 'STAY INFORMED',
    title: 'Never miss campus updates',
    body: 'Announcements and complaint progress, all in one place.',
    cta: 'My Issues',
    bg: '#2563EB',
    icon: <Bell size={36} color="rgba(255,255,255,0.95)" strokeWidth={2} />,
    screen: 'MyIssues',
  },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [impactStories, setImpactStories] = useState([]);
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef(null);

  const load = async (opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) setLoading(true);
    setError('');
    try {
      const [c, a, n, s] = await Promise.all([
        api.get('/complaints/mine'),
        api.get('/announcements'),
        api.get('/notifications'),
        api.get('/donations/impact-stories').catch(() => ({ data: [] })),
      ]);
      setComplaints((c.data || []).slice(0, 3));
      const sorted = (a.data || []).slice().sort((x, y) => (y.pinned ? 1 : 0) - (x.pinned ? 1 : 0));
setAnnouncements(sorted.slice(0, 2));
      setUnread(n.data?.unreadCount || 0);
      setImpactStories((s.data || []).slice(0, 2));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load({ silent: true });
    setRefreshing(false);
  };

  const all = complaints;
  const stats = {
    total: all.length,
    pending: all.filter((c) => c.status === 'Pending' || c.status === 'In Progress').length,
    resolved: all.filter((c) => c.status === 'Resolved').length,
  };

  const firstName = (user?.name || 'Student').split(' ')[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Assalam-o-Alaikum</Text>
          <Text style={styles.name}>{firstName}</Text>
          <Text style={styles.tagline}>Umeed — here for your campus needs</Text>
        </View>
        <TouchableOpacity onPress={() => {
  const root = navigation.getParent()?.getParent() || navigation.getParent() || navigation;
  root.navigate('Notifications');
}} style={styles.bell}>
          <Bell size={22} color={colors.gray} strokeWidth={2} accessibilityLabel="Notifications" />
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={bannerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={BANNER_W + 12}
        snapToAlignment="start"
        contentContainerStyle={{ paddingRight: 4 }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + 12));
          setBannerIndex(i);
        }}
        style={{ marginBottom: 10 }}
      >
        {BANNERS.map((b) => (
          <TouchableOpacity
            key={b.key}
            activeOpacity={0.92}
            onPress={() => navigation.navigate(b.screen)}
            style={[styles.banner, { backgroundColor: b.bg, width: BANNER_W }]}
          >
            <View style={styles.bannerDecor} />
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.bannerEyebrow}>{b.eyebrow}</Text>
              <Text style={styles.bannerTitle}>{b.title}</Text>
              <Text style={styles.bannerBody}>{b.body}</Text>
              <View style={styles.bannerCta}>
                <Text style={styles.bannerCtaText}>{b.cta}</Text>
                <Text style={styles.bannerCtaArrow}> →</Text>
              </View>
            </View>
            {b.icon}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {BANNERS.map((b, i) => (
          <View key={b.key} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actionsRow}>
        <ActionChip icon={<Plus size={18} color={colors.careGreen} strokeWidth={2} />} label="Report" color={colors.careGreen} onPress={() => navigation.navigate('Report')} />
        <ActionChip icon={<HandHeart size={18} color={colors.trustTeal} strokeWidth={2} />} label="Welfare" color={colors.trustTeal} onPress={() => navigation.navigate('Welfare')} />
        <ActionChip icon={<HeartHandshake size={18} color="#16A34A" strokeWidth={2} />} label="Donate" color="#16A34A" onPress={() => navigation.navigate('Donate')} />
        <ActionChip icon={<UsersRound size={18} color="#2563EB" strokeWidth={2} />} label="Community" color="#2563EB" onPress={() => navigation.navigate('Community')} />
      </View>

      {!!impactStories.length && (
        <>
          <View style={styles.sectionHead}>
            <Text style={styles.section}>Impact Stories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ImpactStories')}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
          </View>
          {impactStories.map((s) => (
            <Card key={s._id} style={styles.announceCard}>
              <View style={[styles.announceAccent, { backgroundColor: colors.careGreen }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardSub} numberOfLines={2}>{s.summary || s.body}</Text>
              </View>
            </Card>
          ))}
        </>
      )}

      <View style={styles.statsRow}>
        <StatCard label="Total" value={stats.total} color={colors.trustTeal} icon={<ChartNoAxesCombined size={16} color={colors.trustTeal} strokeWidth={2} style={styles.statIcon} />} />
        <StatCard label="Active" value={stats.pending} color={colors.warmAmber} icon={<Clock size={16} color={colors.warmAmber} strokeWidth={2} style={styles.statIcon} />} />
        <StatCard label="Resolved" value={stats.resolved} color={colors.careGreen} icon={<BadgeCheck size={16} color={colors.careGreen} strokeWidth={2} style={styles.statIcon} />} />
      </View>

      {!!error && <ErrorState message={error} onRetry={load} style={{ marginBottom: 14 }} />}

      <View style={styles.sectionHead}>
        <Text style={styles.section}>Recent Complaints</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyIssues')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      {loading && !refreshing && complaints.length === 0 ? (
        <LoadingSkeleton rows={2} />
      ) : complaints.length === 0 && !error ? (
        <EmptyState
          icon={<Wrench size={34} color={colors.gray} strokeWidth={2} />}
          title="No recent complaints"
          message="When you report an issue, it will appear here."
          actionLabel="Report an issue"
          onAction={() => navigation.navigate('Report')}
        />
      ) : (
        complaints.map((c) => (
          <TouchableOpacity key={c._id} onPress={() => navigation.navigate('ComplaintDetail', { id: c._id })}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
                <StatusBadge status={c.status} />
              </View>
              <Text style={styles.cardSub}>
                {c.category} • {new Date(c.createdAt).toLocaleDateString()}
              </Text>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <Text style={[styles.section, { marginTop: 14 }]}>Announcements</Text>
      {loading && !refreshing && announcements.length === 0 ? (
        <LoadingSkeleton rows={1} />
      ) : announcements.length === 0 && !error ? (
        <EmptyState icon={<Bell size={34} color={colors.gray} strokeWidth={2} />} title="No announcements" message="Campus updates will appear here when available." />
      ) : (
        announcements.map((a) => (
          <AnnouncementCard key={a._id} item={a} />
        ))
      )}
    </ScrollView>
  );
}

const StatCard = ({ label, value, color, icon }) => (
  <View style={[styles.statCard, { borderColor: color + '33' }]}>
    {icon}
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionChip = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionChip} activeOpacity={0.85} onPress={onPress}>
    <View style={[styles.actionIconWrap, { backgroundColor: color + '18' }]}>
      {icon}
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  greeting: { fontSize: 13, color: colors.gray, fontWeight: '600' },
  name: { fontSize: 24, fontWeight: '800', color: colors.ink, marginTop: 2 },
  tagline: { fontSize: 12, color: colors.gray, marginTop: 2 },
  bell: {
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  banner: {
    borderRadius: 20,
    padding: 18,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 148,
  },
  bannerDecor: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bannerEyebrow: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 6, lineHeight: 23 },
  bannerBody: { color: 'rgba(255,255,255,0.92)', fontSize: 12, marginTop: 6, lineHeight: 17 },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginTop: 12,
  },
  bannerCtaText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bannerCtaArrow: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lightGray, marginHorizontal: 3 },
  dotActive: { width: 18, backgroundColor: colors.careGreen },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  actionChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  actionIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginBottom: 18 },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  statIcon: { marginBottom: 2 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.gray, marginTop: 2, fontWeight: '600' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  section: { fontSize: 16, fontWeight: '800', color: colors.ink },
  seeAll: { fontSize: 12, fontWeight: '700', color: colors.careGreen },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, flex: 1, marginRight: 8 },
  cardSub: { fontSize: 13, color: colors.gray, marginTop: 4 },
  announceCard: { flexDirection: 'row', alignItems: 'stretch', paddingLeft: 0, overflow: 'hidden' },
  announceAccent: { width: 4, backgroundColor: colors.trustTeal, borderTopLeftRadius: 16, borderBottomLeftRadius: 16, marginRight: 14 },
});
