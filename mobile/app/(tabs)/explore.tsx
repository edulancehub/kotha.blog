import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, Spacing, Radius, FontSize, Shadows } from "../../lib/theme";
import { getTrendingPosts, searchPosts } from "../../lib/store";
import type { Post } from "../../lib/types";

const TOPICS = [
  { label: "Technology", emoji: "💻" },
  { label: "Design", emoji: "🎨" },
  { label: "Writing", emoji: "✍️" },
  { label: "AI", emoji: "🤖" },
  { label: "Startup", emoji: "🚀" },
  { label: "Art", emoji: "🖼️" },
  { label: "Science", emoji: "🔬" },
  { label: "Life", emoji: "🌱" },
  { label: "Philosophy", emoji: "🧠" },
];

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState<Post[]>([]);
  const [results, setResults] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getTrendingPosts();
      setTrending(data);
      setLoading(false);
    })();
  }, []);

  const handleSearch = useCallback(
    async (text: string) => {
      setQuery(text);
      if (!text.trim()) {
        setResults(null);
        return;
      }
      setSearching(true);
      const data = await searchPosts(text.trim());
      setResults(data);
      setSearching(false);
    },
    []
  );

  const handleTopicPress = useCallback((topic: string) => {
    setQuery(topic);
    handleSearch(topic);
  }, []);

  const displayPosts = results ?? trending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg }}>
        <Text
          style={{
            fontSize: FontSize.xxl,
            fontFamily: "Lora_700Bold",
            color: Colors.text,
            letterSpacing: -0.3,
          }}
        >
          Explore
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: FontSize.sm,
            fontFamily: "Inter_400Regular",
            color: Colors.textSecondary,
          }}
        >
          Discover stories and writers
        </Text>

        {/* Search Bar */}
        <View
          style={{
            marginTop: Spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.bgInput,
            borderRadius: Radius.md,
            borderWidth: 1.5,
            borderColor: Colors.border,
            paddingHorizontal: Spacing.lg,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: Spacing.sm }}>🔍</Text>
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 13,
              fontSize: FontSize.md,
              fontFamily: "Inter_400Regular",
              color: Colors.text,
            }}
            placeholder="Search posts, tags, writers..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searching && <ActivityIndicator size="small" color={Colors.accent} />}
          {query.length > 0 && !searching && (
            <Pressable onPress={() => handleSearch("")}>
              <Text style={{ fontSize: 14, color: Colors.textMuted }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Topics */}
        {!query && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: Spacing.sm,
              marginTop: Spacing.lg,
              marginBottom: Spacing.sm,
            }}
          >
            {TOPICS.map((topic) => (
              <Pressable
                key={topic.label}
                onPress={() => handleTopicPress(topic.label)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: pressed ? Colors.bgElevated : Colors.bgCard,
                  borderRadius: Radius.full,
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.sm,
                  borderWidth: 1,
                  borderColor: Colors.border,
                })}
              >
                <Text style={{ fontSize: 12, marginRight: 4 }}>{topic.emoji}</Text>
                <Text
                  style={{
                    fontSize: FontSize.xs,
                    fontFamily: "Inter_500Medium",
                    color: Colors.textSecondary,
                  }}
                >
                  {topic.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Section Title */}
      <View
        style={{
          paddingHorizontal: Spacing.xxl,
          paddingTop: Spacing.lg,
          paddingBottom: Spacing.sm,
        }}
      >
        <Text
          style={{
            fontSize: FontSize.xxs,
            fontFamily: "Inter_700Bold",
            color: Colors.textMuted,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          {results ? `${results.length} results` : "🔥 Trending"}
        </Text>
      </View>

      {/* Results */}
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/post/${item.id}`)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: Spacing.xxl,
              paddingVertical: Spacing.lg,
              backgroundColor: pressed ? Colors.bgElevated : Colors.transparent,
              borderBottomWidth: 0.5,
              borderBottomColor: Colors.border,
            })}
          >
            {/* Rank */}
            {!results && (
              <Text
                style={{
                  width: 28,
                  fontSize: FontSize.xxl,
                  fontFamily: "Lora_700Bold",
                  color: index < 3 ? Colors.accent : Colors.borderLight,
                }}
              >
                {index + 1}
              </Text>
            )}
            <View style={{ flex: 1, marginLeft: results ? 0 : Spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    backgroundColor: Colors.accentDim,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.white }}>
                    {item.author?.displayName?.[0]?.toUpperCase()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: FontSize.xxs,
                    fontFamily: "Inter_500Medium",
                    color: Colors.textSecondary,
                  }}
                >
                  {item.author?.displayName}
                </Text>
              </View>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: FontSize.md,
                  fontFamily: "Lora_700Bold",
                  color: Colors.text,
                  lineHeight: 22,
                }}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: 6 }}>
                <Text
                  style={{
                    fontSize: FontSize.xxs,
                    fontFamily: "Inter_400Regular",
                    color: Colors.textMuted,
                  }}
                >
                  {timeAgo(item.createdAt)} · {item.readTime} min · 👏 {item.claps}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: Spacing.huge }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: Spacing.lg }}>
              {results ? "🔎" : "🌟"}
            </Text>
            <Text
              style={{
                fontSize: FontSize.md,
                fontFamily: "Inter_500Medium",
                color: Colors.textSecondary,
              }}
            >
              {results ? "No posts found" : "Nothing trending yet"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
