import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors, Spacing, Radius, FontSize, Shadows } from "../../lib/theme";
import { getPostById, clapPost } from "../../lib/store";
import type { Post } from "../../lib/types";

const { width } = Dimensions.get("window");

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function renderContent(html: string) {
  // Simple HTML to text renderer — splits by tags
  const parts: { type: string; text: string }[] = [];
  const regex = /<(h[1-3]|p|blockquote)>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    parts.push({ type: match[1], text: stripHtml(match[2]) });
  }

  if (parts.length === 0) {
    // Fallback: treat entire content as paragraphs
    const stripped = stripHtml(html);
    stripped.split("\n\n").forEach((p) => {
      if (p.trim()) parts.push({ type: "p", text: p.trim() });
    });
  }

  return parts;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [claps, setClaps] = useState(0);
  const [clapBounce] = useState(new Animated.Value(1));

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    (async () => {
      if (!id) return;
      const p = await getPostById(id);
      setPost(p);
      setClaps(p?.claps || 0);
      setLoading(false);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    })();
  }, [id]);

  async function handleClap() {
    if (!post) return;
    const newClaps = await clapPost(post.id);
    setClaps(newClaps);

    Animated.sequence([
      Animated.timing(clapBounce, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(clapBounce, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }

  async function handleShare() {
    if (!post) return;
    try {
      await Share.share({
        message: `${post.title} — by ${post.author?.displayName} on Kotha\nhttps://${post.author?.username}.kotha.blog/${post.slug}`,
      });
    } catch {}
  }

  if (loading) {
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
      </View>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: Spacing.lg }}>😢</Text>
          <Text
            style={{
              fontSize: FontSize.lg,
              fontFamily: "Lora_700Bold",
              color: Colors.text,
            }}
          >
            Post not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              marginTop: Spacing.xl,
              backgroundColor: Colors.accent,
              borderRadius: Radius.full,
              paddingHorizontal: Spacing.xl,
              paddingVertical: Spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: FontSize.sm,
                fontFamily: "Inter_600SemiBold",
                color: Colors.white,
              }}
            >
              Go back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const contentParts = renderContent(post.content);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Floating Header */}
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: Colors.bg + "F0" }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Colors.bgCard,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text style={{ fontSize: 18, color: Colors.text }}>←</Text>
          </Pressable>

          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            <Pressable
              onPress={handleShare}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: Colors.bgCard,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text style={{ fontSize: 16 }}>📤</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xxl,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Author */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: Spacing.lg,
              marginBottom: Spacing.xxl,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: Colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: FontSize.lg,
                  fontFamily: "Inter_700Bold",
                  color: Colors.white,
                }}
              >
                {post.author?.displayName?.[0]?.toUpperCase()}
              </Text>
            </View>
            <View style={{ marginLeft: Spacing.md }}>
              <Text
                style={{
                  fontSize: FontSize.md,
                  fontFamily: "Inter_600SemiBold",
                  color: Colors.text,
                }}
              >
                {post.author?.displayName}
              </Text>
              <Text
                style={{
                  fontSize: FontSize.xs,
                  fontFamily: "Inter_400Regular",
                  color: Colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {formatDate(post.createdAt)} · {post.readTime} min read
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: FontSize.xxxl,
              fontFamily: "Lora_700Bold",
              color: Colors.text,
              letterSpacing: -0.5,
              lineHeight: 44,
            }}
          >
            {post.title}
          </Text>

          {/* Subtitle */}
          {post.subtitle ? (
            <Text
              style={{
                marginTop: Spacing.md,
                fontSize: FontSize.lg,
                fontFamily: "Inter_400Regular",
                color: Colors.textSecondary,
                lineHeight: 26,
              }}
            >
              {post.subtitle}
            </Text>
          ) : null}

          {/* Tags */}
          {post.tags.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: Spacing.sm,
                marginTop: Spacing.xl,
              }}
            >
              {post.tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: Colors.accentSoft,
                    borderRadius: Radius.full,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: FontSize.xs,
                      fontFamily: "Inter_500Medium",
                      color: Colors.accent,
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: Colors.border,
              marginVertical: Spacing.xxl,
            }}
          />

          {/* Content */}
          <View>
            {contentParts.map((part, idx) => {
              if (part.type === "h1" || part.type === "h2") {
                return (
                  <Text
                    key={idx}
                    style={{
                      fontSize: part.type === "h1" ? FontSize.xxl : FontSize.xl,
                      fontFamily: "Lora_700Bold",
                      color: Colors.text,
                      marginTop: Spacing.xxl,
                      marginBottom: Spacing.md,
                      letterSpacing: -0.3,
                    }}
                  >
                    {part.text}
                  </Text>
                );
              }
              if (part.type === "h3") {
                return (
                  <Text
                    key={idx}
                    style={{
                      fontSize: FontSize.lg,
                      fontFamily: "Inter_600SemiBold",
                      color: Colors.text,
                      marginTop: Spacing.xl,
                      marginBottom: Spacing.sm,
                    }}
                  >
                    {part.text}
                  </Text>
                );
              }
              if (part.type === "blockquote") {
                return (
                  <View
                    key={idx}
                    style={{
                      borderLeftWidth: 3,
                      borderLeftColor: Colors.accent,
                      paddingLeft: Spacing.xl,
                      marginVertical: Spacing.lg,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: FontSize.md,
                        fontFamily: "Inter_400Regular",
                        color: Colors.textSecondary,
                        fontStyle: "italic",
                        lineHeight: 26,
                      }}
                    >
                      {part.text}
                    </Text>
                  </View>
                );
              }
              return (
                <Text
                  key={idx}
                  style={{
                    fontSize: FontSize.md,
                    fontFamily: "Inter_400Regular",
                    color: Colors.text,
                    lineHeight: 28,
                    marginBottom: Spacing.lg,
                  }}
                >
                  {part.text}
                </Text>
              );
            })}
          </View>

          {/* Author Footer */}
          <View
            style={{
              marginTop: Spacing.xxxl,
              backgroundColor: Colors.bgCard,
              borderRadius: Radius.xl,
              padding: Spacing.xxl,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: Colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: FontSize.xxl,
                  fontFamily: "Inter_700Bold",
                  color: Colors.white,
                }}
              >
                {post.author?.displayName?.[0]?.toUpperCase()}
              </Text>
            </View>
            <Text
              style={{
                marginTop: Spacing.md,
                fontSize: FontSize.lg,
                fontFamily: "Inter_600SemiBold",
                color: Colors.text,
              }}
            >
              {post.author?.displayName}
            </Text>
            {post.author?.bio ? (
              <Text
                style={{
                  marginTop: Spacing.sm,
                  fontSize: FontSize.sm,
                  fontFamily: "Inter_400Regular",
                  color: Colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {post.author.bio}
              </Text>
            ) : null}
            <Pressable
              style={{
                marginTop: Spacing.lg,
                backgroundColor: Colors.accent,
                borderRadius: Radius.full,
                paddingHorizontal: Spacing.xxl,
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
                Follow
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Clap Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: 34,
          paddingTop: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          backgroundColor: Colors.bg + "F5",
          borderTopWidth: 0.5,
          borderTopColor: Colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xl }}>
            <Pressable
              onPress={handleClap}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.sm,
                backgroundColor: Colors.bgCard,
                borderRadius: Radius.full,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.sm,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Animated.Text
                style={{
                  fontSize: 20,
                  transform: [{ scale: clapBounce }],
                }}
              >
                👏
              </Animated.Text>
              <Text
                style={{
                  fontSize: FontSize.sm,
                  fontFamily: "Inter_600SemiBold",
                  color: Colors.text,
                }}
              >
                {claps}
              </Text>
            </Pressable>

            <Text
              style={{
                fontSize: FontSize.xs,
                fontFamily: "Inter_400Regular",
                color: Colors.textMuted,
              }}
            >
              {post.views.toLocaleString()} views
            </Text>
          </View>

          <Pressable
            onPress={handleShare}
            style={{
              backgroundColor: Colors.bgCard,
              borderRadius: Radius.full,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text
              style={{
                fontSize: FontSize.sm,
                fontFamily: "Inter_500Medium",
                color: Colors.textSecondary,
              }}
            >
              Share
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
