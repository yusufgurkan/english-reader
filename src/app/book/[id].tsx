import { Stack, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type ListViewToken,
} from "react-native";

import { WordPanel } from "@/components/WordPanel";
import { getBookById } from "@/data/books";
import {
  loadReadingPosition,
  saveReadingPosition,
} from "@/lib/readingPosition";
import { getSentence } from "@/lib/sentence";
import { tokenize } from "@/lib/tokenize";

// Ekranın en az yarısını kaplayan paragraf "okunuyor" sayılır. Paragrafın
// kendi yüzdesine bakmıyoruz: ekrandan uzun paragraflar hiç sayılmazdı.
const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 50 };

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
  const listRef = useRef<FlatList<string>>(null);
  const book = getBookById(id);
  const paragraphs = book
    ? book.chapters.flatMap((chapter) => chapter.paragraphs)
    : [];

  // Kitap açılınca kaldığı paragrafa git
  useEffect(() => {
    let cancelled = false;
    loadReadingPosition(id).then((index) => {
      if (cancelled || index === 0 || index >= paragraphs.length) return;
      listRef.current?.scrollToIndex({ index, animated: false });
    });
    // Ekran bu sırada kapanırsa kaydırmaya çalışma
    return () => {
      cancelled = true;
    };
  }, [id, paragraphs.length]);

  // Okurken ekrandaki ilk paragrafı kaydet
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ListViewToken[] }) => {
      const first = viewableItems[0];
      if (first && typeof first.index === "number") {
        void saveReadingPosition(id, first.index);
      }
    },
    [id],
  );

  // Hedef paragraf henüz çizilmediyse scrollToIndex başarısız olur:
  // önce tahmini konuma kaydır, paragraf çizilince tekrar dene
  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      listRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: false,
      });
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: info.index, animated: false });
      }, 100);
    },
    [],
  );

  if (!book) {
    return (
      <View style={styles.container}>
        <Text>Kitap bulunamadı.</Text>
      </View>
    );
  }

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
        ref={listRef}
        data={paragraphs}
        keyExtractor={(_, index) => String(index)}
        extraData={selection}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onScrollToIndexFailed={handleScrollToIndexFailed}
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
