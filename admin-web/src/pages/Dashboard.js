import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { StatCard } from '../components/StatCard';
import { Loader } from '../components/Loader';
import { AlertCircle, CheckCircle, Clock, Heart, Users } from 'lucide-react-native';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [welfareStats, setWelfareStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [c, w, r] = await Promise.all([
          api.get('/complaints/stats').catch(() => ({ data: {} })),
          api.get('/welfare/stats').catch(() => ({ data: {} })),
          api.get('/complaints/mine').catch(() => ({ data: [] })),
        ]);
        setStats(c.data);
        setWelfareStats(w.data);
        setRecent((r.data || []).slice(0, 4));
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader fullScreen message="Loading dashboard…" />;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.sub}>Overview of campus complaints and welfare activities</Text>
      </View>

      <View style={styles.row1}>
        <StatCard icon={AlertCircle} label="Total Complaints" value={stats?.total || 0} color="yellow" />
        <StatCard icon={Clock} label="Pending" value={stats?.pending || 0} color="yellow" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats?.resolved || 0} color="green" />
        <StatCard icon={Heart} label="Welfare Requests" value={welfareStats?.total || 0} color="red" />
      </View>

      <View style={styles.row2}>
        <StatCard icon={Users} label="Total Disbursed" value={`PKR ${(welfareStats?.totalDisbursed || 0).toLocaleString()}`} color="blue" />
        <StatCard icon={CheckCircle} label="Approved Welfare" value={welfareStats?.approved || 0} color="green" />
        <StatCard icon={Clock} label="Avg Resolution" value={`${stats?.avgResolutionTimeHours || 0}h`} color="yellow" />
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.section}>Recent Complaints</Text>
      </View>

      {recent.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No recent complaints</Text>
        </View>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={(item) => String(item._id || item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recentRow}>
              <Text style={styles.recentTitle}>{item.title || 'Untitled'}</Text>
              <Text style={styles.recentSub}>{item.category || ''} • {item.status || ''}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#f9fafb', paddingHorizontal: 14 },
  content: { paddingBottom: 24 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  row1: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  row2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statFlex: { flex: 1, minWidth: 150 },
  sectionHead: { marginBottom: 8 },
  section: { fontSize: 16, fontWeight: '800', color: '#111827' },
  listContent: { paddingHorizontal: 2 },
  separator: { height: 1, backgroundColor: '#f2f2f2', marginHorizontal: 2 },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginHorizontal: 2, marginBottom: 6, borderWidth: 1, borderColor: '#f2f2f2' },
  recentTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  recentSub: { fontSize: 12, color: '#6b7280' },
  empty: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 2, borderWidth: 1, borderColor: '#f2f2f2' },
  emptyText: { fontSize: 14, color: '#6b7280' },
});
