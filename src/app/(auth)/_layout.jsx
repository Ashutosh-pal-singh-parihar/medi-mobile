import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="role-select" />
      <Stack.Screen name="patient-setup" />
      <Stack.Screen name="doctor-setup" />
    </Stack>
  );
}
