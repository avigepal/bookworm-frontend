import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth,user,token } = useAuthStore();

  useEffect(()=>{
    checkAuth();
  },[]);

  useEffect(()=>{
    if (!user && !token && segments[0] !== "(auth)") {
      router.replace("/(auth)");
    } else if (user && token && segments[0] === "(auth)") {
      router.replace("/(tabs)");
    }
  },[user,token,segments]);
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="inverted"/>
    </SafeAreaProvider>
  );
}
