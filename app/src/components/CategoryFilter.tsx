import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BusinessCategory } from '../types';

const FILTERS: { label: string; value: BusinessCategory | 'all'; emoji: string }[] = [
  { label: 'ALL', value: 'all', emoji: '⚡' },
  { label: 'BARS', value: 'bar', emoji: '🍺' },
  { label: 'FOOD TRUCKS', value: 'food_truck', emoji: '🚚' },
  { label: 'RESTAURANTS', value: 'restaurant', emoji: '🍽' },
  { label: 'BREWERIES', value: 'brewery', emoji: '🍻' },
  { label: 'POP-UPS', value: 'popup', emoji: '⭐' },
];

interface Props {
  selected: BusinessCategory | 'all';
  onSelect: (value: BusinessCategory | 'all') => void;
}

export default function CategoryFilter({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => {
        const active = selected === f.value;
        return (
          <TouchableOpacity
            key={f.value}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onSelect(f.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{f.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{f.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#111111',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#222222',
  },
  pillActive: {
    backgroundColor: '#FF5500',
    borderColor: '#FF5500',
  },
  emoji: {
    fontSize: 13,
  },
  label: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  labelActive: {
    color: '#000000',
  },
});
