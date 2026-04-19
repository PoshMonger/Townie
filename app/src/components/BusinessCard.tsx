import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Business } from '../types';

interface Props {
  business: Business;
  onPress: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  bar: '#FF5500',
  food_truck: '#F0A500',
  restaurant: '#00C896',
  brewery: '#AA44FF',
  popup: '#FF2266',
  other: '#4488FF',
};

const CATEGORY_LABELS: Record<string, string> = {
  bar: 'BAR',
  food_truck: 'FOOD TRUCK',
  restaurant: 'RESTAURANT',
  brewery: 'BREWERY',
  popup: 'POP-UP',
  other: 'SPOT',
};

export default function BusinessCard({ business, onPress }: Props) {
  const activeDeals = business.deals?.filter((d) => d.is_active) ?? [];
  const catColor = CATEGORY_COLORS[business.category] ?? '#4488FF';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {business.cover_image_url ? (
        <Image source={{ uri: business.cover_image_url }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: catColor + '22' }]}>
          <Text style={{ fontSize: 40 }}>
            {business.category === 'food_truck' ? '🚚' : business.category === 'bar' ? '🍺' : business.category === 'brewery' ? '🍻' : business.category === 'popup' ? '⚡' : '🍽'}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
            <Text style={styles.categoryText}>{CATEGORY_LABELS[business.category]}</Text>
          </View>
          {business.is_underground && (
            <View style={styles.undergroundBadge}>
              <Text style={styles.undergroundText}>🕵️ UNDERGROUND</Text>
            </View>
          )}
        </View>

        <Text style={styles.name} numberOfLines={1}>{business.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{business.address}</Text>

        {activeDeals.length > 0 && (
          <View style={styles.dealsRow}>
            <Text style={styles.dealIcon}>🔥</Text>
            <Text style={styles.dealText} numberOfLines={1}>
              {activeDeals[0].discount_text || activeDeals[0].title}
            </Text>
            {activeDeals.length > 1 && (
              <Text style={styles.moreDeals}>+{activeDeals.length - 1} more</Text>
            )}
          </View>
        )}

        {business.distance !== undefined && (
          <Text style={styles.distance}>{business.distance.toFixed(1)} mi away</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  undergroundBadge: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  undergroundText: {
    color: '#888',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  address: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 8,
  },
  dealsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF550015',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  dealIcon: {
    fontSize: 14,
  },
  dealText: {
    color: '#FF5500',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  moreDeals: {
    color: '#FF550088',
    fontSize: 11,
    fontWeight: '700',
  },
  distance: {
    color: '#555',
    fontSize: 11,
    marginTop: 6,
  },
});
