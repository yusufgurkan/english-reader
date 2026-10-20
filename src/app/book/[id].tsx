import { Stack, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { getBookById } from "@/data/books";

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = getBookById(id);

  if (!book) {
    return (
      <View style={styles.container}>
        <Text>Kitap bulunamadı.</Text>
      </View>
    );
  }

  const paragraphs = book.chapters.flatMap((chapter) => chapter.paragraphs);

  return (
    <>
      <Stack.Screen options={{ title: book.title }} />
      <FlatList
        data={paragraphs}
        keyExtractor={(_, index) => String(index)}
        renderItem={({ item }) => <Text style={styles.paragraph}>{item}</Text>}
        contentContainerStyle={styles.content}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    lineHeight: 28,
    color: "#222",
    marginBottom: 16,
  },
});
