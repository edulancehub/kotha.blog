import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, Spacing, Radius, FontSize, Shadows } from "../../lib/theme";
import { useAuth } from "../_layout";
import {
  getSiteSettings,
  updateSiteSettings,
  AVAILABLE_THEMES,
  type BlogTheme,
} from "../../lib/store";

export default function SettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<BlogTheme>("minimal");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const settings = await getSiteSettings(user.id);
      if (settings) {
        setSiteName((settings.site_name as string) || "");
        setTagline((settings.tagline as string) || "");
        setSelectedTheme((settings.theme as BlogTheme) || "minimal");
        setTwitter((settings.social_twitter as string) || "");
        setGithub((settings.social_github as string) || "");
        setWebsite((settings.social_website as string) || "");
      }
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 48, marginBottom: Spacing.lg }}>⚙️</Text>
          <Text style={{ fontSize: FontSize.xl, fontFamily: "Lora_700Bold", color: Colors.text }}>Sign in to customize</Text>
          <Pressable onPress={() => router.push("/(auth)/sign-in")} style={{ marginTop: Spacing.xxl, backgroundColor: Colors.accent, borderRadius: Radius.full, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, ...Shadows.glow }}>
            <Text style={{ fontSize: FontSize.md, fontFamily: "Inter_600SemiBold", color: Colors.white }}>Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function handleSave() {
    setSaving(true);
    const success = await updateSiteSettings(user!.id, {
      site_name: siteName,
      tagline,
      theme: selectedTheme,
      social_twitter: twitter,
      social_github: github,
      social_website: website,
    });
    setSaving(false);

    if (success) {
      Alert.alert("Saved ✓", `Your blog at ${user!.username}.kotha.blog has been updated!`);
    } else {
      Alert.alert("Error", "Failed to save settings");
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" }} edges={["top"]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.huge }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xxl, paddingBottom: Spacing.lg }}>
          <Text style={{ fontSize: FontSize.xxl, fontFamily: "Lora_700Bold", color: Colors.text, letterSpacing: -0.3 }}>Blog Settings</Text>
          <Text style={{ marginTop: 4, fontSize: FontSize.sm, fontFamily: "Inter_400Regular", color: Colors.accent }}>
            {user.username}.kotha.blog
          </Text>
        </View>

        {/* Site Info */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xxl }}>
          <Text style={{ fontSize: FontSize.xxs, fontFamily: "Inter_700Bold", color: Colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: Spacing.md }}>
            Site Info
          </Text>
          <View style={{ backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border }}>
            <Text style={labelStyle}>Site Name</Text>
            <TextInput style={inputStyle} value={siteName} onChangeText={setSiteName} placeholder="My Blog" placeholderTextColor={Colors.textMuted} />

            <Text style={{ ...labelStyle, marginTop: Spacing.lg }}>Tagline</Text>
            <TextInput style={inputStyle} value={tagline} onChangeText={setTagline} placeholder="A short description" placeholderTextColor={Colors.textMuted} />
          </View>
        </View>

        {/* Theme Selection */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xxl }}>
          <Text style={{ fontSize: FontSize.xxs, fontFamily: "Inter_700Bold", color: Colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: Spacing.md }}>
            🎨 Blog Theme
          </Text>
          <Text style={{ fontSize: FontSize.xs, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginBottom: Spacing.lg }}>
            Choose how your blog looks to visitors
          </Text>

          <View style={{ gap: Spacing.md }}>
            {AVAILABLE_THEMES.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setSelectedTheme(t.id)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: selectedTheme === t.id ? Colors.accentSoft : Colors.bgCard,
                  borderRadius: Radius.lg,
                  padding: Spacing.lg,
                  borderWidth: selectedTheme === t.id ? 2 : 1,
                  borderColor: selectedTheme === t.id ? Colors.accent : Colors.border,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                {/* Theme Preview */}
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: Radius.md,
                  backgroundColor: t.color,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: Spacing.lg,
                }}>
                  <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: t.color === "#0a0a0a" || t.color === "#0d0221" ? "#fff" : "#333" }}>
                    Aa
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSize.md, fontFamily: "Inter_600SemiBold", color: Colors.text }}>
                    {t.name}
                  </Text>
                  <Text style={{ fontSize: FontSize.xs, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 }}>
                    {t.desc}
                  </Text>
                </View>

                {selectedTheme === t.id && (
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: Colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ color: Colors.white, fontSize: 14 }}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Social Links */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xxl }}>
          <Text style={{ fontSize: FontSize.xxs, fontFamily: "Inter_700Bold", color: Colors.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: Spacing.md }}>
            Social Links
          </Text>
          <View style={{ backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border }}>
            <Text style={labelStyle}>Twitter / X</Text>
            <TextInput style={inputStyle} value={twitter} onChangeText={setTwitter} placeholder="username" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />

            <Text style={{ ...labelStyle, marginTop: Spacing.lg }}>GitHub</Text>
            <TextInput style={inputStyle} value={github} onChangeText={setGithub} placeholder="username" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />

            <Text style={{ ...labelStyle, marginTop: Spacing.lg }}>Website</Text>
            <TextInput style={inputStyle} value={website} onChangeText={setWebsite} placeholder="https://..." placeholderTextColor={Colors.textMuted} autoCapitalize="none" keyboardType="url" />
          </View>
        </View>

        {/* Save */}
        <View style={{ paddingHorizontal: Spacing.xxl }}>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => ({
              backgroundColor: pressed ? Colors.accentDim : Colors.accent,
              borderRadius: Radius.full,
              paddingVertical: 16,
              alignItems: "center",
              opacity: saving ? 0.7 : 1,
              ...Shadows.glow,
            })}
          >
            <Text style={{ fontSize: FontSize.md, fontFamily: "Inter_600SemiBold", color: Colors.white }}>
              {saving ? "Saving..." : "Save Settings"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const labelStyle = {
  fontSize: FontSize.sm as number,
  fontFamily: "Inter_600SemiBold" as const,
  color: Colors.text,
  marginBottom: Spacing.sm as number,
};

const inputStyle = {
  backgroundColor: Colors.bgInput,
  borderRadius: Radius.md as number,
  borderWidth: 1.5,
  borderColor: Colors.border,
  paddingHorizontal: Spacing.lg as number,
  paddingVertical: 12,
  fontSize: FontSize.md as number,
  fontFamily: "Inter_400Regular" as const,
  color: Colors.text,
};
