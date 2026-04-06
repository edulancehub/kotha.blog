import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, Spacing, Radius, FontSize, Shadows } from "../../lib/theme";
import { useAuth } from "../_layout";
import { getPostsByUser, signOut } from "../../lib/store";
import type { Post } from "../../lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");

  const loadPosts = useCallback(async () => {
    if (!user) return;
    const data = await getPostsByUser(user.id);
    setPosts(data);
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

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
          <Text style={{ fontSize: 48, marginBottom: Spacing.lg }}>👤</Text>
          <Text
            style={{
              fontSize: FontSize.xl,
              fontFamily: "Lora_700Bold",
              color: Colors.text,
            }}
          >
            Sign in to view profile
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

  const published = posts.filter((p) => p.published);
  const drafts = posts.filter((p) => !p.published);
  const displayPosts = activeTab === "published" ? published : drafts;
  const totalClaps = posts.reduce((s, p) => s + p.claps, 0);
  const totalViews = posts.reduce((s, p) => s + p.views, 0);

  async function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          setUser(null);
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.huge }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View
          style={{
            alignItems: "center",
            paddingVertical: Spacing.xxxl,
            paddingHorizontal: Spacing.xxl,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: Colors.accent,
              alignItems: "center",
              justifyContent: "center",
              ...Shadows.glow,
            }}
          >
            <Text
              style={{
                fontSize: 36,
                fontFamily: "Lora_700Bold",
                color: Colors.white,
              }}
            >
              {user.displayName[0]?.toUpperCase()}
            </Text>
          </View>

          <Text
            style={{
              marginTop: Spacing.lg,
              fontSize: FontSize.xxl,
              fontFamily: "Lora_700Bold",
              color: Colors.text,
              letterSpacing: -0.3,
            }}
          >
            {user.displayName}
          </Text>

          <Text
            style={{
              marginTop: 4,
              fontSize: FontSize.sm,
              fontFamily: "Inter_400Regular",
              color: Colors.accent,
            }}
          >
            {user.username}.kotha.blog
          </Text>

          {user.bio ? (
            <Text
              style={{
                marginTop: Spacing.md,
                fontSize: FontSize.sm,
                fontFamily: "Inter_400Regular",
                color: Colors.textSecondary,
                textAlign: "center",
                maxWidth: 280,
                lineHeight: 20,
              }}
            >
              {user.bio}
            </Text>
          ) : null}

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              marginTop: Spacing.xxl,
              gap: Spacing.xxl,
            }}
          >
            {[
              { value: published.length, label: "Posts" },
              { value: totalViews, label: "Views" },
              { value: totalClaps, label: "Claps" },
              { value: user.followers, label: "Followers" },
            ].map((stat) => (
              <View key={stat.label} style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: FontSize.xl,
                    fontFamily: "Inter_700Bold",
                    color: Colors.text,
                  }}
                >
                  {stat.value >= 1000
                    ? `${(stat.value / 1000).toFixed(1)}k`
                    : stat.value}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: FontSize.xxs,
                    fontFamily: "Inter_500Medium",
                    color: Colors.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View
            style={{
              flexDirection: "row",
              gap: Spacing.md,
              marginTop: Spacing.xxl,
            }}
          >
            <Pressable
              onPress={() => router.push("/(tabs)/write")}
              style={{
                backgroundColor: Colors.accent,
                borderRadius: Radius.full,
                paddingHorizontal: Spacing.xl,
                paddingVertical: Spacing.md,
                ...Shadows.glow,
              }}
            >
              <Text
                style={{
                  fontSize: FontSize.sm,
                  fontFamily: "Inter_600SemiBold",
                  color: Colors.white,
                }}
              >
                ✍️ Write Post
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSignOut}
              style={{
                borderRadius: Radius.full,
                borderWidth: 1,
                borderColor: Colors.borderLight,
                paddingHorizontal: Spacing.xl,
                paddingVertical: Spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: FontSize.sm,
                  fontFamily: "Inter_500Medium",
                  color: Colors.textSecondary,
                }}
              >
                Sign out
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Tab Switcher */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: Spacing.xxl,
            backgroundColor: Colors.bgCard,
            borderRadius: Radius.md,
            padding: 3,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          {(["published", "drafts"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                backgroundColor:
                  activeTab === tab ? Colors.bgElevated : Colors.transparent,
                borderRadius: Radius.sm,
                paddingVertical: Spacing.md,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: FontSize.sm,
                  fontFamily:
                    activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular",
                  color:
                    activeTab === tab ? Colors.text : Colors.textMuted,
                }}
              >
                {tab === "published"
                  ? `Published (${published.length})`
                  : `Drafts (${drafts.length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Posts */}
        <View style={{ marginTop: Spacing.lg }}>
          {displayPosts.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ fontSize: 32, marginBottom: Spacing.md }}>
                {activeTab === "published" ? "📝" : "📄"}
              </Text>
              <Text
                style={{
                  fontSize: FontSize.md,
                  fontFamily: "Inter_500Medium",
                  color: Colors.textSecondary,
                }}
              >
                No {activeTab} posts yet
              </Text>
            </View>
          ) : (
            displayPosts.map((post) => (
              <Pressable
                key={post.id}
                onPress={() => router.push(`/post/${post.id}`)}
                style={({ pressed }) => ({
                  marginHorizontal: Spacing.xxl,
                  marginBottom: Spacing.md,
                  backgroundColor: pressed ? Colors.bgElevated : Colors.bgCard,
                  borderRadius: Radius.lg,
                  padding: Spacing.lg,
                  borderWidth: 1,
                  borderColor: Colors.border,
                })}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: Spacing.sm,
                    marginBottom: Spacing.sm,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: post.published
                        ? Colors.successBg
                        : "rgba(245, 158, 11, 0.1)",
                      borderRadius: Radius.full,
                      paddingHorizontal: Spacing.sm,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: FontSize.xxs,
                        fontFamily: "Inter_600SemiBold",
                        color: post.published ? Colors.success : Colors.warning,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {post.published ? "Published" : "Draft"}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: FontSize.xxs,
                      fontFamily: "Inter_400Regular",
                      color: Colors.textMuted,
                    }}
                  >
                    {formatDate(post.createdAt)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: FontSize.md,
                    fontFamily: "Lora_700Bold",
                    color: Colors.text,
                  }}
                  numberOfLines={2}
                >
                  {post.title}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: FontSize.xs,
                    fontFamily: "Inter_400Regular",
                    color: Colors.textMuted,
                  }}
                  numberOfLines={1}
                >
                  {post.excerpt}
                </Text>
                {post.published && (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: Spacing.lg,
                      marginTop: Spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: FontSize.xxs,
                        fontFamily: "Inter_400Regular",
                        color: Colors.textMuted,
                      }}
                    >
                      {post.readTime} min · 👏 {post.claps} · {post.views} views
                    </Text>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
