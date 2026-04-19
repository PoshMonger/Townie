import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { businessAPI } from '../services/api';
import { getCurrentLocation } from '../services/locationService';
import { Business, BusinessCategory, RootStackParamList } from '../types';
import BusinessCard from '../components/BusinessCard';
import CategoryFilter from '../components/CategoryFilter';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<BusinessCategory | 'all'>('all');
  const [locationError, setLocationError] = useState(false);

  const load = useCallback(async () => {
    try {
      const coords = await getCurrentLocation();
      if (!coords) {
        setLocationError(true);
        // Fall back to hot deals without location
        const res = await businessAPI.getHotDeals();
        setBusinesses(res.data);
        return;
      }
      setLocationError(false);
      const res = await businessAPI.getNearby(
        coords.latitude,
        coords.longitude,
        10,
        category !== 'all' ? category : undefined
      );
      setBusinesses(res.data);
    } catch (err) {
      console.error('HomeScreen load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.headline}>NEARBY</Text>
          <Text style={styles.subheadline}>DEALS & SPOTS</Text>
        </View>
        <TouchableOpacity style={styles.fireButton} onPress={onRefresh}>
          <Text style={{ fontSize: 24 }}>🔥</Text>
        </TouchableOpacity>
      </View>

      {locationError && (
        <View style={styles.locationBanner}>
          <Text style={styles.locationBannerText}>
            📍 Enable location for nearby deals
          </Text>
        </View>
      )}

      <CategoryFilter selected={category} onSelect={setCategory} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF5500" size="large" />
        <Text style={styles.loadingText}>Finding deals near you...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BusinessCard
            business={item}
            onPress={() => navigation.navigate('DealDetail', { business: item })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            emoji="🏜"
            title="No spots found"
            subtitle="Be the first to add a hidden gem in your area"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF5500"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  centered: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: '#555', fontSize: 14, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 3,
    lineHeight: 38,
  },
  subheadline: {
    color: '#FF5500',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
  },
  fireButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
  },
  locationBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F0A50022',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0A50044',
  },
  locationBannerText: {
    color: '#F0A500',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
