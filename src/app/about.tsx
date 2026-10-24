import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { books } from "@/data/books";
import type { License } from "@/types/book";

// Lisans kimliklerinin ekranda görünen adları
const LICENSE_NAMES: Record<License, string> = {
  "public-domain": "Kamu malı (ABD)",
  "CC-BY-4.0": "CC BY 4.0",
  "CC-BY-SA-4.0": "CC BY-SA 4.0",
};

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? "?";

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.appName}>English Reader</Text>
        <Text style={styles.muted}>Sürüm {version}</Text>
        <Text style={styles.body}>
          İngilizce kitap okuyarak kelime öğrenmek için. Reklamsız, internetsiz.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Kitaplar</Text>
        {books.map((book) => (
          <View key={book.id} style={styles.item}>
            <Text style={styles.itemTitle}>
              {book.title}
              {book.author ? ` · ${book.author}` : ""}
            </Text>
            <Text style={styles.muted}>
              {book.source.name} · {LICENSE_NAMES[book.license]}
            </Text>
            <ExternalLink url={book.source.url} />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Sözlük</Text>
        <Text style={styles.body}>
          {"Kelime anlamları Türkçe ve İngilizce Vikisözlük (Wiktionary) " +
            "içeriğinden, kaikki.org'un Wiktextract verisi kullanılarak " +
            "üretilmiştir. Sözlük verisi Creative Commons " +
            "Atıf-AynıLisanslaPaylaş (CC BY-SA 4.0) lisanslıdır."}
        </Text>
        <ExternalLink url="https://tr.wiktionary.org" />
        <ExternalLink url="https://en.wiktionary.org" />
        <ExternalLink url="https://kaikki.org" />
        <ExternalLink url="https://creativecommons.org/licenses/by-sa/4.0/deed.tr" />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Açık kaynak yazılımlar</Text>
        <Text style={styles.body}>
          Uygulama Expo, React Native ve React gibi açık kaynak yazılımlarla
          geliştirilmiştir; her biri kendi lisansına tabidir.
        </Text>
      </View>

      <Text style={styles.muted}>© 2026 Yusuf Gürkan. Tüm hakları saklıdır.</Text>
    </ScrollView>
  );
}

function ExternalLink({ url }: { url: string }) {
  return (
    <Text
      style={styles.link}
      onPress={() => void Linking.openURL(url)}
      accessibilityRole="link"
    >
      {url}
    </Text>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: "#222",
  },
  muted: {
    fontSize: 14,
    color: "#666",
  },
  item: {
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  link: {
    fontSize: 14,
    color: "#2563eb",
    textDecorationLine: "underline",
  },
});
