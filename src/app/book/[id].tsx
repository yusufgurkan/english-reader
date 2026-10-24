import { Stack, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { WordPanel } from "@/components/WordPanel";
import { getBookById } from "@/data/books";
import { getSentence } from "@/lib/sentence";
import { tokenize } from "@/lib/tokenize";

type Selection = {
  paragraphIndex: number;
  tokenIndex: number;
};

type WordPressHandler = (paragraphIndex: number, tokenIndex: number) => void;

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selection, setSelection] = useState<Selection | null>(null);
  // useCallback: fonksiyon her çizimde aynı kalır; böylece memo'lu
  // Paragraph ve Word bileşenleri onu "değişti" sanıp yeniden çizilmez.
  const handleWordPress = useCallback(
    (paragraphIndex: number, tokenIndex: number) =>
      setSelection({ paragraphIndex, tokenIndex }),
    [],
  );
  const handleClosePanel = useCallback(() => setSelection(null), []);
  const book = getBookById(id);

  if (!book) {
    return (
      <View style={styles.container}>
        <Text>Kitap bulunamadı.</Text>
      </View>
    );
  }

  const paragraphs = book.chapters.flatMap((chapter) => chapter.paragraphs);

  // Seçili kelimenin kendisi ve geçtiği cümle (seçim yoksa null)
  let selectedWord: { word: string; sentence: string } | null = null;
  if (selection !== null) {
    const tokens = tokenize(paragraphs[selection.paragraphIndex]);
    selectedWord = {
      word: tokens[selection.tokenIndex].text,
      sentence: getSentence(tokens, selection.tokenIndex),
    };
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: book.title }} />
      <FlatList
        data={paragraphs}
        keyExtractor={(_, index) => String(index)}
        extraData={selection}
        renderItem={({ item, index }) => (
          <Paragraph
            text={item}
            paragraphIndex={index}
            selectedToken={
              selection !== null && selection.paragraphIndex === index
                ? selection.tokenIndex
                : null
            }
            onWordPress={handleWordPress}
          />
        )}
        contentContainerStyle={[
          styles.content,
          selectedWord !== null && styles.contentWithPanel,
        ]}
      />
      {selectedWord !== null && (
        <WordPanel
          word={selectedWord.word}
          sentence={selectedWord.sentence}
          onClose={handleClosePanel}
        />
      )}
    </View>
  );
}

type ParagraphProps = {
  text: string;
  paragraphIndex: number;
  selectedToken: number | null;
  onWordPress: WordPressHandler;
};

// memo: prop'ları değişmeyen paragraf yeniden çizilmez
const Paragraph = memo(function Paragraph({
  text,
  paragraphIndex,
  selectedToken,
  onWordPress,
}: ParagraphProps) {
  const tokens = tokenize(text);

  return (
    <Text style={styles.paragraph}>
      {tokens.map((token, tokenIndex) =>
        token.isWord ? (
          <Word
            key={tokenIndex}
            text={token.text}
            paragraphIndex={paragraphIndex}
            tokenIndex={tokenIndex}
            selected={tokenIndex === selectedToken}
            onPress={onWordPress}
          />
        ) : (
          // Boşluk ve noktalama dokunulamaz; ayrı bir Text'e gerek yok
          token.text
        ),
      )}
    </Text>
  );
});

type WordProps = {
  text: string;
  paragraphIndex: number;
  tokenIndex: number;
  selected: boolean;
  onPress: WordPressHandler;
};

// memo: bir dokunuşta sadece seçimi değişen 2 kelime yeniden çizilir
const Word = memo(function Word({
  text,
  paragraphIndex,
  tokenIndex,
  selected,
  onPress,
}: WordProps) {
  return (
    <Text
      onPress={() => onPress(paragraphIndex, tokenIndex)}
      style={selected && styles.selectedWord}
    >
      {text}
    </Text>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  // Panel açıkken metnin sonu panelin altında kalmasın
  contentWithPanel: {
    paddingBottom: 240,
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
