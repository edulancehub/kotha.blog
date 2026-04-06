import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Colors, Spacing, Radius, FontSize, Shadows } from "../../lib/theme";
import { signIn } from "../../lib/store";
import { useAuth } from "../_layout";

export default function SignInScreen() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      shake();
      return;
    }
    setLoading(true);
    setError("");
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      shake();
    } else if (result.user) {
      setUser(result.user);
      router.replace("/(tabs)");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: Spacing.xxl,
          paddingVertical: Spacing.huge,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              backgroundColor: Colors.accent,
              alignItems: "center",
              justifyContent: "center",
              ...Shadows.glow,
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontFamily: "Lora_700Bold",
                color: Colors.white,
              }}
            >
              K
            </Text>
          </View>
          <Text
            style={{
              marginTop: 16,
              fontSize: FontSize.xxl,
              fontFamily: "Lora_700Bold",
              color: Colors.text,
              letterSpacing: -0.3,
            }}
          >
            Welcome back
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: FontSize.md,
              fontFamily: "Inter_400Regular",
              color: Colors.textSecondary,
            }}
          >
            Sign in to continue writing
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <Animated.View
            style={{
              transform: [{ translateX: shakeAnim }],
              backgroundColor: Colors.dangerBg,
              borderRadius: Radius.md,
              padding: Spacing.lg,
              marginBottom: Spacing.xl,
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.2)",
            }}
          >
            <Text
              style={{
                color: Colors.danger,
                fontSize: FontSize.sm,
                fontFamily: "Inter_500Medium",
              }}
            >
              {error}
            </Text>
          </Animated.View>
        ) : null}

        {/* Email */}
        <Text
          style={{
            fontSize: FontSize.sm,
            fontFamily: "Inter_600SemiBold",
            color: Colors.text,
            marginBottom: Spacing.sm,
          }}
        >
          Email
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.bgInput,
            borderRadius: Radius.md,
            borderWidth: 1.5,
            borderColor: Colors.border,
            paddingHorizontal: Spacing.lg,
            paddingVertical: 14,
            fontSize: FontSize.md,
            fontFamily: "Inter_400Regular",
            color: Colors.text,
            marginBottom: Spacing.xl,
          }}
          placeholder="you@example.com"
          placeholderTextColor={Colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        {/* Password */}
        <Text
          style={{
            fontSize: FontSize.sm,
            fontFamily: "Inter_600SemiBold",
            color: Colors.text,
            marginBottom: Spacing.sm,
          }}
        >
          Password
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.bgInput,
            borderRadius: Radius.md,
            borderWidth: 1.5,
            borderColor: Colors.border,
            paddingHorizontal: Spacing.lg,
            paddingVertical: 14,
            fontSize: FontSize.md,
            fontFamily: "Inter_400Regular",
            color: Colors.text,
            marginBottom: Spacing.xxxl,
          }}
          placeholder="Your password"
          placeholderTextColor={Colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Submit */}
        <Pressable
          onPress={handleSignIn}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.accentDim : Colors.accent,
            borderRadius: Radius.full,
            paddingVertical: 16,
            alignItems: "center",
            opacity: loading ? 0.7 : 1,
            ...Shadows.glow,
          })}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text
              style={{
                fontSize: FontSize.md,
                fontFamily: "Inter_600SemiBold",
                color: Colors.white,
              }}
            >
              Sign in
            </Text>
          )}
        </Pressable>

        {/* Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: Spacing.xxl,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
          <Text
            style={{
              marginHorizontal: Spacing.lg,
              fontSize: FontSize.xs,
              fontFamily: "Inter_400Regular",
              color: Colors.textMuted,
            }}
          >
            or
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
        </View>

        {/* Link to Sign Up */}
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: FontSize.sm,
              fontFamily: "Inter_400Regular",
              color: Colors.textSecondary,
            }}
          >
            Don't have an account?{" "}
            <Link href="/(auth)/sign-up">
              <Text
                style={{
                  color: Colors.accent,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                Create your blog
              </Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
