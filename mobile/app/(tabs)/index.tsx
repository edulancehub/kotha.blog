import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing, Radius, FontSize, Shadows } from "../../lib/theme";
import { getFeedPosts } from "../../lib/store";
import type { Post } from "../../lib/types";

const { width } = Dimensions.get("window");

function timeAgo(date: string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable
        onPress={() => router.push(`/post/${post.id}`)}
        style={({ pressed }) => ({
          backgroundColor: pressed ? Colors.bgElevated : Colors.bgCard,
          borderRadius: Radius.xl,
          padding: Spacing.xl,
          marginBottom: Spacing.md,
          marginHorizontal: Spacing.lg,
          borderWidth: 1,
          borderColor: pressed ? Colors.borderLight : Colors.border,
          ...Shadows.card,
        })}
      >
        {/* Author Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: Spacing.md,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: Colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: FontSize.sm,
                fontFamily: "Inter_700Bold",
                color: Colors.white,
              }}
            >
              {post.author?.displayName?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
          <View style={{ marginLeft: Spacing.md, flex: 1 }}>
            <Text
              style={{
                fontSize: FontSize.sm,
                fontFamily: "Inter_600SemiBold",
                color: Colors.text,
              }}
            >
              {post.author?.displayName || "Unknown"}
            </Text>
            <Text
              style={{
                fontSize: FontSize.xxs,
                fontFamily: "Inter_400Regular",
                color: Colors.textMuted,
                marginTop: 1,
              }}
            >
              {post.author?.username}.kotha.blog · {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: FontSize.lg,
            fontFamily: "Lora_700Bold",
            color: Colors.text,
            letterSpacing: -0.3,
            lineHeight: 24,
          }}
          numberOfLines={2}
        >
          {post.title}
        </Text>

        {/* Subtitle */}
        {post.subtitle ? (
          <Text
            style={{
              marginTop: 4,
              fontSize: FontSize.sm,
              fontFamily: "Inter_400Regular",
              color: Colors.textSecondary,
            }}
            numberOfLines={1}
          >
            {post.subtitle}
          </Text>
        ) : null}

        {/* Excerpt */}
        <Text
          style={{
            marginTop: Spacing.sm,
            fontSize: FontSize.sm,
            fontFamily: "Inter_400Regular",
            color: Colors.textMuted,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {post.excerpt}
        </Text>

        {/* Tags */}
        {post.tags.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: Spacing.xs,
              marginTop: Spacing.md,
            }}
          >
            {post.tags.slice(0, 3).map((tag) => (
              <View
                key={tag}
                style={{
                  backgroundColor: Colors.accentSoft,
                  borderRadius: Radius.full,
                  paddingHorizontal: Spacing.md,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: FontSize.xxs,
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

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: Spacing.md,
            gap: Spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: FontSize.xxs,
              fontFamily: "Inter_400Regular",
              color: Colors.textMuted,
            }}
          >
            {post.readTime} min read
          </Text>
          {post.claps > 0 && (
            <Text
              style={{
                fontSize: FontSize.xxs,
                fontFamily: "Inter_400Regular",
                color: Colors.textMuted,
              }}
            >
              👏 {post.claps}
            </Text>
          )}
          {post.views > 0 && (
            <Text
              style={{
                fontSize: FontSize.xxs,
                fontFamily: "Inter_400Regular",
                color: Colors.textMuted,
              }}
            >
              {post.views.toLocaleString()} views
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    const data = await getFeedPosts();
    setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function onRefresh() {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: Spacing.xxl,
          paddingVertical: Spacing.lg,
          borderBottomWidth: 0.5,
          borderBottomColor: Colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: Colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Lora_700Bold",
                color: Colors.white,
              }}
            >
              K
            </Text>
          </View>
          <Text
            style={{
              marginLeft: Spacing.md,
              fontSize: FontSize.xl,
              fontFamily: "Lora_700Bold",
              color: Colors.text,
              letterSpacing: -0.3,
            }}
          >
            Kotha
          </Text>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <PostCard post={item} index={index} />
        )}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: Spacing.huge,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
            progressBackgroundColor={Colors.bgCard}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 80,
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: Spacing.lg }}>📝</Text>
              <Text
                style={{
                  fontSize: FontSize.lg,
                  fontFamily: "Lora_700Bold",
                  color: Colors.text,
                }}
              >
                No stories yet
              </Text>
              <Text
                style={{
                  marginTop: Spacing.sm,
                  fontSize: FontSize.sm,
                  fontFamily: "Inter_400Regular",
                  color: Colors.textSecondary,
                  textAlign: "center",
                  maxWidth: 260,
                }}
              >
                Be the first to write something amazing
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
