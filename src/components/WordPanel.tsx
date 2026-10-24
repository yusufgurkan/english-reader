import Ionicons from "@expo/vector-icons/Ionicons";
import * as Speech from "expo-speech";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { DictionaryEntry, DictionarySense } from "@/types/dictionary";

// Telefonun kendi seslendirme motoruyla İngilizce okur. Önceki seslendirme
// durdurulur; yoksa sesler arka arkaya sıraya girer.
function speak(text: string, rate: number) {
  void Speech.stop();
  Speech.speak(text, { language: "en-US", rate });
}

type WordPanelProps = {
  word: string;
  sentence: string;
  entry: DictionaryEntry | undefined;
  onClose: () => void;
};

export function WordPanel({ word, sentence, entry, onClose }: WordPanelProps) {
  // Alttaki sistem çubuğunun yüksekliği; panel onun altında kalmasın
  const insets = useSafeAreaInsets();
  // Panel kapanınca konuşma da sussun
  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);
  // "Hansel" gibi büyük harfle geçen kelimede özel isim anlamları da gösterilir
  const isCapitalized = word[0] !== word[0].toLowerCase();
  const names = isCapitalized ? (entry?.names ?? []) : [];
  const hasMeaning =
    entry !== undefined &&
    (entry.forms.length > 0 || entry.senses.length > 0 || names.length > 0);

  return (
    <View style={[styles.panel, { paddingBottom: 16 + insets.bottom }]}>
      <View style={styles.header}>
        <View style={styles.wordRow}>
          <Text style={styles.word}>{word}</Text>
          <Pressable
            onPress={() => speak(word, 0.9)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Kelimeyi seslendir"
          >
            <Ionicons name="volume-high-outline" size={24} color="#2563eb" />
          </Pressable>
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Paneli kapat"
        >
          <Ionicons name="close" size={24} color="#666" />
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {entry?.forms.map((form) => (
          <View key={`${form.lemma}-${form.label}`} style={styles.group}>
            <Text style={styles.formTitle}>
              {form.lemma} · {form.label}
            </Text>
            <SenseList senses={form.senses} />
          </View>
        ))}
        {entry !== undefined && <SenseList senses={entry.senses} />}
        {names.length > 0 && (
          <Text style={styles.sense}>
            <Text style={styles.pos}>özel isim: </Text>
            {names.join("; ")}
          </Text>
        )}
        {!hasMeaning && (
          <Text style={styles.hint}>Bu kelime henüz sözlükte yok.</Text>
        )}
        <View style={styles.sentenceRow}>
          <Text style={styles.sentence}>{sentence}</Text>
          <Pressable
            onPress={() => speak(sentence, 0.8)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Cümleyi seslendir"
          >
            <Ionicons name="volume-medium-outline" size={20} color="#2563eb" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function SenseList({ senses }: { senses: DictionarySense[] }) {
  return senses.map((sense) => (
    <Text key={sense.pos} style={styles.sense}>
      <Text style={styles.pos}>{sense.pos}: </Text>
      {sense.meanings.join(", ")}
    </Text>
  ));
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    gap: 8,
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    // Android'de gölge
    elevation: 12,
    // iOS'ta gölge
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  word: {
    fontSize: 24,
    fontWeight: "bold",
  },
  // Anlamlar çok uzunsa panel ekranı kaplamasın, içi kaydırılsın
  body: {
    maxHeight: 260,
  },
  bodyContent: {
    gap: 8,
  },
  group: {
    gap: 4,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563eb",
  },
  sense: {
    fontSize: 16,
    lineHeight: 24,
    color: "#222",
  },
  pos: {
    fontWeight: "600",
    color: "#666",
  },
  sentenceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  sentence: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#666",
    fontStyle: "italic",
  },
  hint: {
    fontSize: 14,
    color: "#999",
  },
});
