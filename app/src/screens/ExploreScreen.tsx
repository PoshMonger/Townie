import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  ActivityIndicator, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { businessAPI } from '../services/api';
import { Business, RootStackParamList } from '../types';
import BusinessCard from '../components/BusinessCard';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ExploreScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await businessAPI.search(q);
      setResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHotDeals = async () => {
    setLoading(true);
    setSearched(true);
    setQuery('');
    try {
      const res = await businessAPI.getHotDeals();
      setResults(res.data.flatMap((row: any) =>
        row.business_id ? [{ ...row, id: row.business_id }] : []
      ));
    } catch (err) {
      console.error('Hot deals error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headline}>EXPLORE</Text>
        <Text style={styles.subheadline}>FIND HIDDEN GEMS</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search spots, bars, trucks..."
          placeholderTextColor="#444"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={doSearch} activeOpacity={0.8}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.hotDealsButton} onPress={loadHotDeals} activeOpacity={0.8}>
        <Text style={styles.hotDealsText}>🔥 SHOW ALL HOT DEALS</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#FF5500" size="large" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BusinessCard
              business={item}
              onPress={() => navigation.navigate('DealDetail', { business: item })}
            />
          )}
          ListEmptyComponent={
            searched ? (
              <EmptyState
                emoji="🤷"
                title="Nothing found"
                subtitle="Try a different search or submit this spot yourself"
              />
            ) : (
              <EmptyState
                emoji="🗺"
                title="Discover something new"
                subtitle="Search for bars, food trucks, and underground spots near you"
              />
            )
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
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
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#FF5500',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotDealsButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#FF550044',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  hotDealsText: {
    color: '#FF5500',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
