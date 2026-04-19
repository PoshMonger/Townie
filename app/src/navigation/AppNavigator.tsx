import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, MainTabParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SubmitSpotScreen from '../screens/SubmitSpotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import DealDetailScreen from '../screens/DealDetailScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import ReviewSubmissions from '../screens/admin/ReviewSubmissions';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const COLORS = {
  bg: '#000000',
  orange: '#FF5500',
  gold: '#F0A500',
  surface: '#111111',
  text: '#FFFFFF',
  muted: '#666666',
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🔥',
    Explore: '🗺',
    Submit: '➕',
    Profile: '👤',
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '•'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#1A1A1A',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Submit" component={SubmitSpotScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.orange} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '900', letterSpacing: 1 },
          contentStyle: { backgroundColor: COLORS.bg },
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="DealDetail"
              component={DealDetailScreen}
              options={{ title: '', headerTransparent: true }}
            />
            {user.role === 'admin' && (
              <>
                <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'ADMIN' }} />
                <Stack.Screen name="ReviewSubmission" component={ReviewSubmissions} options={{ title: 'REVIEW' }} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
