import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<Coords | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(coords: Coords): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync(coords);
    if (results.length > 0) {
      const r = results[0];
      return [r.street, r.city, r.region].filter(Boolean).join(', ');
    }
    return 'Unknown location';
  } catch {
    return 'Unknown location';
  }
}
