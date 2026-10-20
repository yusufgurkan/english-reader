import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { getBookById } from "@/data/books";
import { tokenize } from "@/lib/tokenize";

type Selection = {
  paragraphIndex: number;
  tokenIndex: number;
};

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selection, setSelection] = useState<Selection | null>(null);
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
        extraData={selection}
        renderItem={({ item, index }) => (
          <Paragraph
            text={item}
            selectedToken={
              selection !== null && selection.paragraphIndex === index
                ? selection.tokenIndex
                : null
            }
            onWordPress={(tokenIndex) =>
              setSelection({ paragraphIndex: index, tokenIndex })
            }
          />
        )}
        contentContainerStyle={styles.content}
      />
    </>
  );
}

type ParagraphProps = {
  text: string;
  selectedToken: number | null;
  onWordPress: (tokenIndex: number) => void;
};

function Paragraph({ text, selectedToken, onWordPress }: ParagraphProps) {
  const tokens = tokenize(text);

  return (
    <Text style={styles.paragraph}>
      {tokens.map((token, tokenIndex) =>
        token.isWord ? (
          <Text
            key={tokenIndex}
            onPress={() => onWordPress(tokenIndex)}
            style={tokenIndex === selectedToken && styles.selectedWord}
          >
            {token.text}
          </Text>
        ) : (
          <Text key={tokenIndex}>{token.text}</Text>
        ),
      )}
    </Text>
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
  selectedWord: {
    backgroundColor: "#fde68a",
  },
});
