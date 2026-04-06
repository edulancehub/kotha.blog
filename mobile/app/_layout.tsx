import { useEffect, useState, createContext, useContext } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Lora_400Regular, Lora_700Bold } from "@expo-google-fonts/lora";
import { Colors } from "../lib/theme";
import { getCurrentUser } from "../lib/store";
import type { User } from "../lib/types";

// ── Auth Context ────────────────────────────────────────────────
type AuthCtx = {
  user: User | null;
  setUser: (u: User | null) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Lora_400Regular,
    Lora_700Bold,
  });

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      setIsLoading(false);
    })();
  }, []);

  if (!fontsLoaded || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.accent} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: "fade",
        }}
      />
    </AuthContext.Provider>
  );
}
