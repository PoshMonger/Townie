import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { adminAPI } from '../../services/api';
import { RootStackParamList, Submission } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Stats {
  businesses: number;
  active_deals: number;
  users: number;
  pending_submissions: number;
}

export default function AdminDashboard() {
  const navigation = useNavigation<Nav>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingSubmissions(),
      ]);
      setStats(statsRes.data);
      setPending(pendingRes.data);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const quickReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await adminAPI.reviewSubmission(id, status);
      setPending((prev) => prev.filter((s) => s.id !== id));
      if (stats) {
        setStats({ ...stats, pending_submissions: stats.pending_submissions - 1 });
      }
      Alert.alert(status === 'approved' ? 'Approved!' : 'Rejected', 'Submission updated.');
    } catch (err) {
      Alert.alert('Error', 'Could not update submission');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF5500" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>ADMIN DASHBOARD</Text>

        {/* Stats grid */}
        {stats && (
          <View style={styles.statsGrid}>
            <StatBox label="BUSINESSES" value={stats.businesses} emoji="🏢" color="#00C896" />
            <StatBox label="ACTIVE DEALS" value={stats.active_deals} emoji="🔥" color="#FF5500" />
            <StatBox label="USERS" value={stats.users} emoji="👥" color="#F0A500" />
            <StatBox label="PENDING" value={stats.pending_submissions} emoji="⏳" color="#AA44FF" />
          </View>
        )}

        <Text style={styles.sectionTitle}>PENDING SUBMISSIONS</Text>

        {pending.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>All caught up!</Text>
          </View>
        ) : (
          pending.map((sub) => (
            <View key={sub.id} style={styles.submissionCard}>
              <View style={styles.subHeader}>
                <Text style={styles.subName}>{sub.business_name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{sub.category.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.subAddress}>{sub.address}</Text>
              {sub.description && (
                <Text style={styles.subDesc} numberOfLines={2}>{sub.description}</Text>
              )}
              {sub.instagram && (
                <Text style={styles.subMeta}>📸 {sub.instagram}</Text>
              )}
              <Text style={styles.subDate}>
                Submitted {new Date(sub.created_at).toLocaleDateString()}
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => navigation.navigate('ReviewSubmission', { submissionId: sub.id })}
                >
                  <Text style={styles.detailButtonText}>FULL REVIEW</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => quickReview(sub.id, 'rejected')}
                >
                  <Text style={styles.rejectText}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => quickReview(sub.id, 'approved')}
                >
                  <Text style={styles.approveText}>✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, emoji, color }: { label: string; value: number; emoji: string; color: string }) {
  return (
    <View style={[statStyles.box, { borderColor: color + '33' }]}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: {
    width: '48%',
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  emoji: { fontSize: 24, marginBottom: 6 },
  value: { fontSize: 32, fontWeight: '900' },
  label: { color: '#555', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  scroll: { padding: 20 },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 14,
  },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  submissionCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  subName: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', flex: 1 },
  categoryBadge: { backgroundColor: '#FF5500', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  categoryText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  subAddress: { color: '#888', fontSize: 13, marginBottom: 6 },
  subDesc: { color: '#666', fontSize: 12, lineHeight: 18, marginBottom: 6 },
  subMeta: { color: '#555', fontSize: 12, marginBottom: 4 },
  subDate: { color: '#444', fontSize: 11, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  detailButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  detailButtonText: { color: '#888', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: { backgroundColor: '#FF226622', borderWidth: 1, borderColor: '#FF2266' },
  approveButton: { backgroundColor: '#00C89622', borderWidth: 1, borderColor: '#00C896' },
  rejectText: { color: '#FF2266', fontSize: 20, fontWeight: '900' },
  approveText: { color: '#00C896', fontSize: 20, fontWeight: '900' },
});
