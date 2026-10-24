import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WordPanelProps = {
  word: string;
  sentence: string;
  onClose: () => void;
};

export function WordPanel({ word, sentence, onClose }: WordPanelProps) {
  // Alttaki sistem çubuğunun yüksekliği; panel onun altında kalmasın
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.panel, { paddingBottom: 16 + insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.word}>{word}</Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Paneli kapat"
        >
          <Ionicons name="close" size={24} color="#666" />
        </Pressable>
      </View>
      <Text style={styles.sentence}>{sentence}</Text>
      <Text style={styles.hint}>Türkçe anlamı yakında burada olacak.</Text>
    </View>
  );
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
  word: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sentence: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    fontStyle: "italic",
  },
  hint: {
    fontSize: 13,
    color: "#999",
  },
});
