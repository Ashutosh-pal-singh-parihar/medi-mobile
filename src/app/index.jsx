import { Redirect } from 'expo-router';

export default function Index() {
  // Directing to splash/onboarding by default
  return <Redirect href="/(auth)/splash" />;
}
