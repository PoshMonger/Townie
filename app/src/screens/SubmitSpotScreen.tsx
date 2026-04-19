import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, SafeAreaView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { submissionAPI } from '../services/api';
import { getCurrentLocation } from '../services/locationService';
import { BusinessCategory } from '../types';

const CATEGORIES: { label: string; value: BusinessCategory; emoji: string }[] = [
  { label: 'Bar', value: 'bar', emoji: '🍺' },
  { label: 'Food Truck', value: 'food_truck', emoji: '🚚' },
  { label: 'Restaurant', value: 'restaurant', emoji: '🍽' },
  { label: 'Brewery', value: 'brewery', emoji: '🍻' },
  { label: 'Pop-up', value: 'popup', emoji: '⚡' },
  { label: 'Other', value: 'other', emoji: '📍' },
];

export default function SubmitSpotScreen() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [dealsInfo, setDealsInfo] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('bar');
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to add images');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setImages(result.assets.map((a) => ({ uri: a.uri })));
    }
  };

  const grabLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setCoords({ lat: loc.latitude, lng: loc.longitude });
      setUseCurrentLocation(true);
    } else {
      Alert.alert('Location unavailable', 'Enable location access in settings');
    }
  };

  const submit = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Missing info', 'Name and address are required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('business_name', name.trim());
      formData.append('address', address.trim());
      formData.append('category', category);
      if (description) formData.append('description', description.trim());
      if (dealsInfo) formData.append('deals_info', dealsInfo.trim());
      if (phone) formData.append('phone', phone.trim());
      if (instagram) formData.append('instagram', instagram.trim());
      if (coords) {
        formData.append('latitude', String(coords.lat));
        formData.append('longitude', String(coords.lng));
      }
      images.forEach((img, i) => {
        formData.append('images', {
          uri: img.uri,
          name: `image_${i}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      await submissionAPI.create(formData);
      Alert.alert(
        'Submitted!',
        'Thanks for the tip. Our team will review it and add it to the map.',
        [{ text: 'Sweet', onPress: resetForm }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Submission failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setDescription('');
    setDealsInfo('');
    setPhone('');
    setInstagram('');
    setCategory('bar');
    setImages([]);
    setCoords(null);
    setUseCurrentLocation(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headline}>SUBMIT A{'\n'}SPOT</Text>
          <Text style={styles.subheadline}>KNOW A HIDDEN GEM?{'\n'}PUT IT ON THE MAP.</Text>
        </View>

        <Text style={styles.label}>WHAT KIND OF PLACE?</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.categoryPill, category === c.value && styles.categoryPillActive]}
              onPress={() => setCategory(c.value)}
            >
              <Text style={styles.categoryEmoji}>{c.emoji}</Text>
              <Text style={[styles.categoryLabel, category === c.value && styles.categoryLabelActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>SPOT NAME *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Tony's Secret Tacos" placeholderTextColor="#333" />

        <Text style={styles.label}>ADDRESS *</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Street address or intersection" placeholderTextColor="#333" />

        <TouchableOpacity
          style={[styles.locationButton, useCurrentLocation && styles.locationButtonActive]}
          onPress={grabLocation}
        >
          <Text style={styles.locationButtonText}>
            {useCurrentLocation ? '📍 Location pinned' : '📍 Use current location'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>WHAT'S THE VIBE?</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Tell people what makes this place special..."
          placeholderTextColor="#333"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>DEALS / HAPPY HOUR INFO</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={dealsInfo}
          onChangeText={setDealsInfo}
          placeholder="e.g. $2 tacos every Tuesday, happy hour 4-7pm..."
          placeholderTextColor="#333"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>PHONE (OPTIONAL)</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(555) 555-5555" placeholderTextColor="#333" keyboardType="phone-pad" />

        <Text style={styles.label}>INSTAGRAM (OPTIONAL)</Text>
        <TextInput style={styles.input} value={instagram} onChangeText={setInstagram} placeholder="@thespotname" placeholderTextColor="#333" autoCapitalize="none" />

        <Text style={styles.label}>PHOTOS (UP TO 5)</Text>
        <TouchableOpacity style={styles.photoButton} onPress={pickImages}>
          <Text style={styles.photoButtonText}>
            {images.length > 0 ? `📷 ${images.length} photo${images.length > 1 ? 's' : ''} selected` : '📷 Add photos'}
          </Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoPreviewScroll}>
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img.uri }} style={styles.photoPreview} />
            ))}
          </ScrollView>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Submissions are reviewed by our team before going live. We typically review within 24 hours.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={submit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>DROP THE DIME 🤫</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll: { padding: 20 },
  header: { marginBottom: 28 },
  headline: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 3,
    lineHeight: 44,
    marginBottom: 8,
  },
  subheadline: {
    color: '#FF5500',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 18,
  },
  label: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 16,
  },
  multiline: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  categoryPillActive: {
    backgroundColor: '#FF5500',
    borderColor: '#FF5500',
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { color: '#888888', fontSize: 12, fontWeight: '700' },
  categoryLabelActive: { color: '#000000' },
  locationButton: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  locationButtonActive: { borderColor: '#00C896', backgroundColor: '#00C89615' },
  locationButtonText: { color: '#888', fontSize: 13, fontWeight: '700' },
  photoButton: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderStyle: 'dashed',
  },
  photoButtonText: { color: '#888', fontSize: 14, fontWeight: '700' },
  photoPreviewScroll: { marginBottom: 16 },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 8,
  },
  disclaimer: {
    backgroundColor: '#111111',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  disclaimerText: { color: '#555', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  submitButton: {
    backgroundColor: '#FF5500',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
