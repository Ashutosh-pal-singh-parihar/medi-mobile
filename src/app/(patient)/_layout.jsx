import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { Platform } from 'react-native';

/**
 * PatientLayout
 * Tab Navigator for the patient-facing side of the app.
 */
export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 8,
          ...theme.shadows.md,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans-Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }} 
      />

      <Tabs.Screen 
        name="reports" 
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />,
        }} 
      />

      <Tabs.Screen 
        name="mediscan" 
        options={{
          title: 'MediScan',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'scan' : 'scan-outline'} size={size} color={color} />,
        }} 
      />

      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }} 
      />

      {/* Hidden tab for navigation entry logic */}
      <Tabs.Screen 
        name="triage" 
        options={{
          href: null, // Hide from tab bar
        }} 
      />
    </Tabs>
  );
}
