import { useEffect, useRef } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Colors, FontSize } from "../lib/theme";
import { useAuth } from "./_layout";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/sign-in");
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [isLoading, user]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background glow */}
      <Animated.View
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: Colors.accentGlow,
          opacity: glowOpacity,
        }}
      />

      {/* Logo */}
      <Animated.View
        style={{
          width: 88,
          height: 88,
          borderRadius: 24,
          backgroundColor: Colors.accent,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
          shadowColor: Colors.accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 10,
        }}
      >
        <Text
          style={{
            fontSize: 42,
            fontFamily: "Lora_700Bold",
            color: Colors.white,
            marginTop: -2,
          }}
        >
          K
        </Text>
      </Animated.View>

      {/* Title */}
      <Animated.Text
        style={{
          marginTop: 24,
          fontSize: FontSize.xxxl,
          fontFamily: "Lora_700Bold",
          color: Colors.text,
          letterSpacing: -0.5,
          opacity: titleOpacity,
          transform: [{ translateY: titleY }],
        }}
      >
        Kotha
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={{
          marginTop: 8,
          fontSize: FontSize.md,
          fontFamily: "Inter_400Regular",
          color: Colors.textSecondary,
          opacity: taglineOpacity,
        }}
      >
        Your words, your domain
      </Animated.Text>
    </View>
  );
}
