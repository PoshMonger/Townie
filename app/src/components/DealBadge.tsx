import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Deal, DealType } from '../types';

const DEAL_CONFIG: Record<DealType, { label: string; color: string; emoji: string }> = {
  happy_hour: { label: 'HAPPY HOUR', color: '#FF5500', emoji: '🍹' },
  weekly_special: { label: 'WEEKLY SPECIAL', color: '#F0A500', emoji: '📅' },
  daily_special: { label: 'DAILY SPECIAL', color: '#00C896', emoji: '⭐' },
  promotion: { label: 'PROMO', color: '#AA44FF', emoji: '🎉' },
  limited: { label: 'LIMITED', color: '#FF2266', emoji: '⚡' },
};

interface Props {
  deal: Deal;
  compact?: boolean;
}

export default function DealBadge({ deal, compact = false }: Props) {
  const config = DEAL_CONFIG[deal.deal_type];

  if (compact) {
    return (
      <View style={[styles.compact, { borderColor: config.color }]}>
        <Text style={styles.compactEmoji}>{config.emoji}</Text>
        <Text style={[styles.compactLabel, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { borderLeftColor: config.color }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <View>
          <Text style={[styles.type, { color: config.color }]}>{config.label}</Text>
          <Text style={styles.title}>{deal.title}</Text>
        </View>
      </View>

      {deal.discount_text && (
        <Text style={styles.discount}>{deal.discount_text}</Text>
      )}

      {deal.description && (
        <Text style={styles.description}>{deal.description}</Text>
      )}

      {(deal.start_time || deal.end_time) && (
        <Text style={styles.time}>
          🕐 {deal.start_time?.slice(0, 5) ?? '?'} – {deal.end_time?.slice(0, 5) ?? '?'}
        </Text>
      )}

      {deal.days_of_week && deal.days_of_week.length > 0 && (
        <Text style={styles.days}>
          {deal.days_of_week
            .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
            .join(' · ')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  emoji: {
    fontSize: 24,
  },
  type: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  discount: {
    color: '#F0A500',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  description: {
    color: '#999999',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
  },
  days: {
    color: '#555555',
    fontSize: 11,
    marginTop: 4,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  compactEmoji: {
    fontSize: 12,
  },
  compactLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
