import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { books } from "@/data/books";
import { LEVELS } from "@/data/levels";
import type { Book, Level } from "@/types/book";

export default function BooksScreen() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const visibleBooks =
    selectedLevel === null
      ? books
      : books.filter((book) => book.level === selectedLevel);

  return (
    <View style={styles.screen}>
      <View style={styles.chips}>
        <LevelChip
          label="Tümü"
          selected={selectedLevel === null}
          onPress={() => setSelectedLevel(null)}
        />
        {LEVELS.map((level) => (
          <LevelChip
            key={level}
            label={level}
            selected={selectedLevel === level}
            onPress={() => setSelectedLevel(level)}
          />
        ))}
      </View>
      <FlatList
        data={visibleBooks}
        keyExtractor={(book) => book.id}
        renderItem={({ item }) => <BookRow book={item} />}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <Text style={styles.empty}>Bu seviyede kitap bulunamadı.</Text>
        }
      />
    </View>
  );
}

function BookRow({ book }: { book: Book }) {
  // Link asChild burada kullanılmıyor: Link, içindeki Pressable'ın
  // fonksiyon olan style'ını düz nesneye çevirip basılma efektini bozuyor.
  const openBook = () =>
    router.push({ pathname: "/book/[id]", params: { id: book.id } });

  return (
    <Pressable
      onPress={openBook}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <Text style={styles.level}>{book.level}</Text>
      <View style={styles.info}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author ?? "Yazarı bilinmiyor"}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </Pressable>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

type LevelChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function LevelChip({ label, selected, onPress }: LevelChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  itemPressed: {
    backgroundColor: "#ddd",
  },
  level: {
    fontWeight: "bold",
    backgroundColor: "#2563eb",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    // iOS'ta Text'in köşeleri bu olmadan yuvarlanmaz
    overflow: "hidden",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  author: {
    fontSize: 14,
    color: "#666",
  },
  chip: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipSelected: {
    backgroundColor: "#2563eb",
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    color: "#000",
    fontWeight: "bold",
  },
  chipTextSelected: {
    color: "#fff",
  },
  screen: {
    flex: 1,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 32,
  },
});
