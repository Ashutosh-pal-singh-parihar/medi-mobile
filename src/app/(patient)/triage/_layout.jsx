import { Stack } from 'expo-router';
import { theme } from '../../../styles/theme';

/**
 * TriageLayout
 * 
 * This is the stack navigator for the automated triage flow.
 * It is nested inside the (patient) tabs navigator but is configured 
 * as a hidden tab to allow full-screen interactions.
 */
export default function TriageLayout() {
  return (
    <Stack
      screenOptions={{
        // All triage screens hide the header for a custom, full-screen UI experience
        headerShown: false,
        
        // Slide-from-right transition matches default iOS behavior and 
        // provides a premium, directional feel for the triage steps
        animation: 'slide_from_right',
        
        // Ensure consistent background across the transition
        contentStyle: { 
          backgroundColor: theme.colors.bgBase 
        },

        // This option is often passed to the parent Tabs navigator to hide 
        // the bottom tab bar when any screen within this stack is active.
        tabBarStyle: { display: 'none' },
      }}
    >
      {/* 
          The entry point is 'start', which allows the user to choose 
          their triage method (Voice, Text, Image).
      */}
      <Stack.Screen 
        name="start" 
        options={{
          title: 'Start Triage'
        }}
      />

      {/* The interactive AI conversation session */}
      <Stack.Screen 
        name="session" 
        options={{
          title: 'Triage Session'
        }}
      />

      {/* The final AI assessment result screen */}
      <Stack.Screen 
        name="result" 
        options={{
          title: 'Triage Result'
        }}
      />

      {/* Automated Emergency SOS screen for High Risk cases */}
      <Stack.Screen 
        name="sos" 
        options={{
          title: 'Emergency SOS',
          gestureEnabled: false // Prevent swiping back from SOS
        }}
      />

      {/* Detailed view of a specific triage report */}
      <Stack.Screen 
        name="report-detail" 
        options={{
          title: 'Report Detail'
        }}
      />
    </Stack>
  );
}
