import { useState, useRef, useEffect } from "react";
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
import { signUp, checkUsername } from "../../lib/store";
import { useAuth } from "../_layout";

type CheckStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SignUpScreen() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [checkMessage, setCheckMessage] = useState("");

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

  // Live username availability check
  useEffect(() => {
    if (!username || username.length < 2) {
      setCheckStatus("idle");
      setCheckMessage("");
      return;
    }

    setCheckStatus("checking");
    const timer = setTimeout(async () => {
      const result = await checkUsername(username);
      if (result.available) {
        setCheckStatus("available");
        setCheckMessage(`${username}.kotha.blog is yours! ✨`);
      } else {
        setCheckStatus(result.reason?.includes("reserved") ? "invalid" : "taken");
        setCheckMessage(result.reason || "Unavailable");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  async function handleSignUp() {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      setError("All fields are required");
      shake();
      return;
    }
    if (checkStatus === "taken" || checkStatus === "invalid") {
      setError("Please choose an available username");
      shake();
      return;
    }

    setLoading(true);
    setError("");
    const result = await signUp(username.trim().toLowerCase(), email.trim(), password, displayName.trim());
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.huge }} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center", ...Shadows.glow }}>
            <Text style={{ fontSize: 30, fontFamily: "Lora_700Bold", color: Colors.white }}>K</Text>
          </View>
          <Text style={{ marginTop: 16, fontSize: FontSize.xxl, fontFamily: "Lora_700Bold", color: Colors.text, letterSpacing: -0.3 }}>
            Claim your domain
          </Text>
          <Text style={{ marginTop: 6, fontSize: FontSize.md, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center" }}>
            Your blog, your subdomain, forever
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <Animated.View style={{ transform: [{ translateX: shakeAnim }], backgroundColor: Colors.dangerBg, borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.xl, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" }}>
            <Text style={{ color: Colors.danger, fontSize: FontSize.sm, fontFamily: "Inter_500Medium" }}>{error}</Text>
          </Animated.View>
        ) : null}

        {/* Display Name */}
        <Text style={labelStyle}>Display Name</Text>
        <TextInput style={inputStyle} placeholder="Your Name" placeholderTextColor={Colors.textMuted} value={displayName} onChangeText={setDisplayName} />

        {/* Username with live check */}
        <Text style={labelStyle}>Username (subdomain)</Text>
        <View style={{ flexDirection: "row", marginBottom: Spacing.xs }}>
          <TextInput
            style={{ ...inputBase, flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0, marginBottom: 0 }}
            placeholder="yourname"
            placeholderTextColor={Colors.textMuted}
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 63))}
            autoCapitalize="none"
          />
          <View style={{ backgroundColor: Colors.bgElevated, borderWidth: 1.5, borderLeftWidth: 0, borderColor: Colors.border, borderTopRightRadius: Radius.md, borderBottomRightRadius: Radius.md, paddingHorizontal: Spacing.md, justifyContent: "center" }}>
            <Text style={{ fontSize: FontSize.sm, fontFamily: "Inter_400Regular", color: Colors.textMuted }}>.kotha.blog</Text>
          </View>
        </View>

        {/* Status indicator */}
        <View style={{ height: 24, justifyContent: "center", marginBottom: Spacing.md }}>
          {checkStatus === "checking" && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <ActivityIndicator size="small" color={Colors.textMuted} />
              <Text style={{ fontSize: FontSize.xs, fontFamily: "Inter_400Regular", color: Colors.textMuted }}>Checking...</Text>
            </View>
          )}
          {checkStatus === "available" && (
            <Text style={{ fontSize: FontSize.xs, fontFamily: "Inter_600SemiBold", color: Colors.success }}>✓ {checkMessage}</Text>
          )}
          {(checkStatus === "taken" || checkStatus === "invalid") && (
            <Text style={{ fontSize: FontSize.xs, fontFamily: "Inter_600SemiBold", color: Colors.danger }}>✕ {checkMessage}</Text>
          )}
        </View>

        {/* Email */}
        <Text style={labelStyle}>Email</Text>
        <TextInput style={inputStyle} placeholder="you@example.com" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />

        {/* Password */}
        <Text style={labelStyle}>Password</Text>
        <TextInput style={{ ...inputBase, marginBottom: Spacing.xxxl }} placeholder="At least 6 characters" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

        {/* Submit */}
        <Pressable
          onPress={handleSignUp}
          disabled={loading || checkStatus === "taken" || checkStatus === "invalid"}
          style={({ pressed }) => ({ backgroundColor: pressed ? Colors.accentDim : Colors.accent, borderRadius: Radius.full, paddingVertical: 16, alignItems: "center", opacity: loading ? 0.7 : 1, ...Shadows.glow })}
        >
          {loading ? <ActivityIndicator color={Colors.white} /> : (
            <Text style={{ fontSize: FontSize.md, fontFamily: "Inter_600SemiBold", color: Colors.white }}>Claim your subdomain</Text>
          )}
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: Spacing.xxl }}>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
          <Text style={{ marginHorizontal: Spacing.lg, fontSize: FontSize.xs, fontFamily: "Inter_400Regular", color: Colors.textMuted }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
        </View>

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: FontSize.sm, fontFamily: "Inter_400Regular", color: Colors.textSecondary }}>
            Already have an account?{" "}
            <Link href="/(auth)/sign-in"><Text style={{ color: Colors.accent, fontFamily: "Inter_600SemiBold" }}>Sign in</Text></Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const labelStyle = { fontSize: FontSize.sm as number, fontFamily: "Inter_600SemiBold" as const, color: Colors.text, marginBottom: Spacing.sm as number };
const inputBase = { backgroundColor: Colors.bgInput, borderRadius: Radius.md as number, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.lg as number, paddingVertical: 14, fontSize: FontSize.md as number, fontFamily: "Inter_400Regular" as const, color: Colors.text };
const inputStyle = { ...inputBase, marginBottom: Spacing.xl as number };
