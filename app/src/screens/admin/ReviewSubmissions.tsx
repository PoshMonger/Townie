import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { adminAPI } from '../../services/api';
import { RootStackParamList, Submission } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewSubmission'>;

export default function ReviewSubmissions({ route, navigation }: Props) {
  const { submissionId } = route.params;
  const [submission, setSubmission] = useState<Submission & { submitter_username?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminAPI.getPendingSubmissions()
      .then((res) => {
        const found = res.data.find((s: any) => s.id === submissionId);
        setSubmission(found ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [submissionId]);

  const review = async (status: 'approved' | 'rejected') => {
    setSubmitting(true);
    try {
      await adminAPI.reviewSubmission(submissionId, status, notes.trim() || undefined);
      Alert.alert(
        status === 'approved' ? 'Approved!' : 'Rejected',
        status === 'approved'
          ? 'The spot is now live on the map.'
          : 'Submission has been rejected.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', 'Could not update submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF5500" size="large" />
      </View>
    );
  }

  if (!submission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Submission not found or already reviewed.</Text>
      </View>
    );
  }

  const images: string[] = Array.isArray(submission.images) ? submission.images as unknown as string[] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>REVIEW SUBMISSION</Text>

        <Field label="BUSINESS NAME" value={submission.business_name} />
        <Field label="CATEGORY" value={submission.category.toUpperCase()} />
        <Field label="ADDRESS" value={submission.address} />
        {submission.description && <Field label="DESCRIPTION" value={submission.description} />}
        {submission.phone && <Field label="PHONE" value={submission.phone} />}
        {submission.instagram && <Field label="INSTAGRAM" value={submission.instagram} />}
        {submission.deals_info && <Field label="DEALS INFO" value={submission.deals_info} />}
        {(submission as any).submitter_username && (
          <Field label="SUBMITTED BY" value={(submission as any).submitter_username} />
        )}
        <Field label="SUBMITTED" value={new Date(submission.created_at).toLocaleString()} />

        {images.length > 0 && (
          <View style={styles.imagesSection}>
            <Text style={styles.fieldLabel}>PHOTOS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.fieldLabel}>REVIEW NOTES (OPTIONAL)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes for the submitter..."
          placeholderTextColor="#333"
          multiline
          numberOfLines={3}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => review('rejected')}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FF2266" />
            ) : (
              <Text style={styles.rejectText}>✕ REJECT</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => review('approved')}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.approveText}>✓ APPROVE</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      <Text style={fieldStyles.value}>{value}</Text>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { color: '#555', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  value: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  notFoundText: { color: '#555', fontSize: 14 },
  scroll: { padding: 20 },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 24,
  },
  imagesSection: { marginBottom: 16 },
  fieldLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 8,
  },
  divider: { height: 1, backgroundColor: '#1A1A1A', marginVertical: 20 },
  notesInput: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    height: 90,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FF226622',
    borderWidth: 1,
    borderColor: '#FF2266',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#FF5500',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rejectText: { color: '#FF2266', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  approveText: { color: '#000000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
});
