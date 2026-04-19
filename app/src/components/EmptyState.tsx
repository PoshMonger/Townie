import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ emoji = '🍺', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#555555',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
