import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { submissionAPI } from '../services/api';
import { Submission, RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_CONFIG = {
  pending: { label: 'PENDING REVIEW', color: '#F0A500', emoji: '⏳' },
  approved: { label: 'APPROVED', color: '#00C896', emoji: '✅' },
  rejected: { label: 'REJECTED', color: '#FF2266', emoji: '❌' },
};

export default function ProfileScreen() {
  const { user, logout, isAdmin } = useAuth();
  const navigation = useNavigation<Nav>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionAPI.getMine()
      .then((res) => setSubmissions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Log out?', "You'll need to sign back in to submit spots.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headline}>PROFILE</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 32 }}>🍺</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>⚡ ADMIN</Text>
              </View>
            )}
          </View>
        </View>

        {/* Admin dashboard button */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('AdminDashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.adminButtonText}>⚙️ ADMIN DASHBOARD</Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{submissions.length}</Text>
            <Text style={styles.statLabel}>SUBMITTED</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {submissions.filter((s) => s.status === 'approved').length}
            </Text>
            <Text style={styles.statLabel}>APPROVED</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {submissions.filter((s) => s.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>PENDING</Text>
          </View>
        </View>

        {/* Submissions list */}
        <Text style={styles.sectionTitle}>MY SUBMISSIONS</Text>

        {loading ? (
          <ActivityIndicator color="#FF5500" style={{ marginTop: 20 }} />
        ) : submissions.length === 0 ? (
          <View style={styles.emptySubmissions}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No submissions yet.</Text>
            <Text style={styles.emptySubtext}>Find a hidden gem and put it on the map!</Text>
          </View>
        ) : (
          submissions.map((sub) => {
            const config = STATUS_CONFIG[sub.status];
            return (
              <View key={sub.id} style={styles.submissionCard}>
                <View style={styles.submissionHeader}>
                  <Text style={styles.submissionName}>{sub.business_name}</Text>
                  <View style={[styles.statusBadge, { borderColor: config.color }]}>
                    <Text style={styles.statusEmoji}>{config.emoji}</Text>
                    <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
                  </View>
                </View>
                <Text style={styles.submissionAddress}>{sub.address}</Text>
                <Text style={styles.submissionDate}>
                  {new Date(sub.created_at).toLocaleDateString()}
                </Text>
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll: { padding: 20 },
  header: { marginBottom: 24 },
  headline: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 3,
  },
  userCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { flex: 1 },
  username: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  email: { color: '#666', fontSize: 13, marginTop: 2 },
  adminBadge: {
    marginTop: 6,
    backgroundColor: '#FF5500',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  adminBadgeText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  adminButton: {
    backgroundColor: '#FF5500',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  adminButtonText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  statNumber: { color: '#FF5500', fontSize: 28, fontWeight: '900' },
  statLabel: { color: '#555', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  sectionTitle: {
    color: '#FF5500',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 12,
  },
  emptySubmissions: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptySubtext: { color: '#555', fontSize: 13, textAlign: 'center' },
  submissionCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  submissionName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', flex: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusEmoji: { fontSize: 10 },
  statusLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  submissionAddress: { color: '#666', fontSize: 12, marginBottom: 4 },
  submissionDate: { color: '#444', fontSize: 11 },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#555', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
});
