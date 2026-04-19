import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity,
  Linking, SafeAreaView, Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import DealBadge from '../components/DealBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'DealDetail'>;

const { width } = Dimensions.get('window');

const CATEGORY_EMOJI: Record<string, string> = {
  bar: '🍺',
  food_truck: '🚚',
  restaurant: '🍽',
  brewery: '🍻',
  popup: '⚡',
  other: '📍',
};

export default function DealDetailScreen({ route }: Props) {
  const { business } = route.params;
  const activeDeals = business.deals?.filter((d) => d.is_active) ?? [];

  const openMaps = () => {
    const url = `https://maps.apple.com/?q=${encodeURIComponent(business.address)}`;
    Linking.openURL(url);
  };

  const openInstagram = () => {
    if (!business.instagram) return;
    const handle = business.instagram.replace('@', '');
    Linking.openURL(`https://instagram.com/${handle}`);
  };

  const callPhone = () => {
    if (!business.phone) return;
    Linking.openURL(`tel:${business.phone}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero image */}
      {business.cover_image_url ? (
        <Image source={{ uri: business.cover_image_url }} style={styles.heroImage} />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={{ fontSize: 72 }}>{CATEGORY_EMOJI[business.category]}</Text>
        </View>
      )}

      <SafeAreaView>
        <View style={styles.content}>
          {/* Badges */}
          <View style={styles.badgeRow}>
            {business.is_underground && (
              <View style={styles.undergroundBadge}>
                <Text style={styles.undergroundText}>🕵️ UNDERGROUND SPOT</Text>
              </View>
            )}
            {activeDeals.length > 0 && (
              <View style={styles.dealCountBadge}>
                <Text style={styles.dealCountText}>{activeDeals.length} DEAL{activeDeals.length > 1 ? 'S' : ''}</Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={styles.name}>{business.name}</Text>

          {/* Address */}
          <TouchableOpacity style={styles.addressRow} onPress={openMaps}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.address}>{business.address}</Text>
          </TouchableOpacity>

          {/* Description */}
          {business.description && (
            <Text style={styles.description}>{business.description}</Text>
          )}

          {/* Contact row */}
          <View style={styles.contactRow}>
            {business.phone && (
              <TouchableOpacity style={styles.contactButton} onPress={callPhone}>
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactText}>CALL</Text>
              </TouchableOpacity>
            )}
            {business.instagram && (
              <TouchableOpacity style={styles.contactButton} onPress={openInstagram}>
                <Text style={styles.contactIcon}>📸</Text>
                <Text style={styles.contactText}>INSTAGRAM</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.contactButton} onPress={openMaps}>
              <Text style={styles.contactIcon}>🗺</Text>
              <Text style={styles.contactText}>DIRECTIONS</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Deals */}
          {activeDeals.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>ACTIVE DEALS</Text>
              {activeDeals.map((deal) => (
                <DealBadge key={deal.id} deal={deal} />
              ))}
            </>
          ) : (
            <View style={styles.noDeals}>
              <Text style={styles.noDealsText}>No active deals right now</Text>
            </View>
          )}

          {/* Hours */}
          {business.hours && Object.keys(business.hours).length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>HOURS</Text>
              {Object.entries(business.hours).map(([day, hours]) => (
                <View key={day} style={styles.hoursRow}>
                  <Text style={styles.hoursDay}>{day.toUpperCase()}</Text>
                  <Text style={styles.hoursTime}>{hours}</Text>
                </View>
              ))}
            </>
          )}

          <View style={{ height: 40 }} />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  heroImage: { width, height: 280, resizeMode: 'cover' },
  heroPlaceholder: {
    width,
    height: 220,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  undergroundBadge: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  undergroundText: { color: '#888', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  dealCountBadge: {
    backgroundColor: '#FF5500',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dealCountText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  name: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: 40,
    marginBottom: 8,
  },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 12 },
  addressIcon: { fontSize: 14, marginTop: 2 },
  address: { color: '#888888', fontSize: 14, flex: 1, lineHeight: 20 },
  description: {
    color: '#AAAAAA',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 4, flexWrap: 'wrap' },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111111',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  contactIcon: { fontSize: 14 },
  contactText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#1A1A1A', marginVertical: 20 },
  sectionTitle: {
    color: '#FF5500',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 12,
  },
  noDeals: { paddingVertical: 20, alignItems: 'center' },
  noDealsText: { color: '#444', fontSize: 14 },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  hoursDay: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  hoursTime: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
