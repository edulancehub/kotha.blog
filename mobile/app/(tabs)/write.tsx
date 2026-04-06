import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing, Radius, FontSize, Shadows } from "../../lib/theme";
import { useAuth } from "../_layout";
import { useRouter } from "expo-router";

export default function WriteScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: Spacing.xxl,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: Spacing.lg }}>✍️</Text>
          <Text
            style={{
              fontSize: FontSize.xl,
              fontFamily: "Lora_700Bold",
              color: Colors.text,
              textAlign: "center",
            }}
          >
            Sign in to write
          </Text>
          <Text
            style={{
              marginTop: Spacing.sm,
              fontSize: FontSize.sm,
              fontFamily: "Inter_400Regular",
              color: Colors.textSecondary,
              textAlign: "center",
            }}
          >
            Create an account to start publishing on Kotha
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)/sign-in")}
            style={{
              marginTop: Spacing.xxl,
              backgroundColor: Colors.accent,
              borderRadius: Radius.full,
              paddingHorizontal: Spacing.xxl,
              paddingVertical: Spacing.md,
              ...Shadows.glow,
            }}
          >
            <Text
              style={{
                fontSize: FontSize.md,
                fontFamily: "Inter_600SemiBold",
                color: Colors.white,
              }}
            >
              Sign in
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function handlePublish() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please add a title to your post");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Missing content", "Please write something before publishing");
      return;
    }

    setIsSaving(true);
    // Mock save — will connect to Supabase later
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);

    Alert.alert("Published! 🎉", "Your post is now live on Kotha", [
      {
        text: "View Feed",
        onPress: () => {
          setTitle("");
          setSubtitle("");
          setContent("");
          setTags("");
          router.push("/(tabs)");
        },
      },
    ]);
  }

  async function handleSaveDraft() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please add a title");
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);
    Alert.alert("Draft saved", "You can continue editing later");
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: Spacing.xxl,
          paddingVertical: Spacing.md,
          borderBottomWidth: 0.5,
          borderBottomColor: Colors.border,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: FontSize.lg,
              fontFamily: "Lora_700Bold",
              color: Colors.text,
            }}
          >
            New Post
          </Text>
          <Text
            style={{
              fontSize: FontSize.xxs,
              fontFamily: "Inter_400Regular",
              color: Colors.textMuted,
              marginTop: 2,
            }}
          >
            {wordCount} words · {readTime} min read
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: Spacing.sm }}>
          <Pressable
            onPress={handleSaveDraft}
            disabled={isSaving}
            style={{
              borderRadius: Radius.full,
              borderWidth: 1,
              borderColor: Colors.borderLight,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: FontSize.sm,
                fontFamily: "Inter_500Medium",
                color: Colors.textSecondary,
              }}
            >
              Draft
            </Text>
          </Pressable>
          <Pressable
            onPress={handlePublish}
            disabled={isSaving}
            style={({ pressed }) => ({
              backgroundColor: pressed ? Colors.accentDim : Colors.accent,
              borderRadius: Radius.full,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
              opacity: isSaving ? 0.6 : 1,
              ...Shadows.glow,
            })}
          >
            <Text
              style={{
                fontSize: FontSize.sm,
                fontFamily: "Inter_600SemiBold",
                color: Colors.white,
              }}
            >
              {isSaving ? "Saving..." : "Publish"}
            </Text>
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Spacing.xxl,
            paddingVertical: Spacing.xl,
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <TextInput
            style={{
              fontSize: FontSize.xxl,
              fontFamily: "Lora_700Bold",
              color: Colors.text,
              lineHeight: 36,
              paddingVertical: Spacing.sm,
            }}
            placeholder="Title"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            multiline
          />

          {/* Subtitle */}
          <TextInput
            style={{
              fontSize: FontSize.md,
              fontFamily: "Inter_400Regular",
              color: Colors.textSecondary,
              lineHeight: 24,
              paddingVertical: Spacing.sm,
              marginTop: Spacing.xs,
            }}
            placeholder="Subtitle (optional)"
            placeholderTextColor={Colors.textMuted}
            value={subtitle}
            onChangeText={setSubtitle}
          />

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: Colors.border,
              marginVertical: Spacing.lg,
            }}
          />

          {/* Content */}
          <TextInput
            style={{
              fontSize: FontSize.md,
              fontFamily: "Inter_400Regular",
              color: Colors.text,
              lineHeight: 26,
              minHeight: 300,
              textAlignVertical: "top",
            }}
            placeholder="Tell your story..."
            placeholderTextColor={Colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
          />

          {/* Tags */}
          <View
            style={{
              marginTop: Spacing.xxl,
              backgroundColor: Colors.bgCard,
              borderRadius: Radius.lg,
              padding: Spacing.lg,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text
              style={{
                fontSize: FontSize.sm,
                fontFamily: "Inter_600SemiBold",
                color: Colors.text,
                marginBottom: Spacing.sm,
              }}
            >
              Tags
            </Text>
            <TextInput
              style={{
                fontSize: FontSize.sm,
                fontFamily: "Inter_400Regular",
                color: Colors.text,
                paddingVertical: Spacing.sm,
              }}
              placeholder="technology, design, startup (comma-separated)"
              placeholderTextColor={Colors.textMuted}
              value={tags}
              onChangeText={setTags}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
