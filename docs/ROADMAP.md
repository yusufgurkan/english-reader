# English Reader — Yol Haritası

> **Şu anki faz:** Faz 1 — Kütüphane ve okuyucu
> Her faz bitince bu dosyadaki kutuları işaretle ve "Şu anki faz" satırını güncelle.

## Neden bu uygulama?

Play Store'daki İngilizce uygulamaları sürekli "pro sürüme geç" diye bastırıyor. Bu uygulama İngilizce kitap okuyarak kelime öğrenmek için yapılıyor; aynı zamanda ilk mobil uygulamamı geliştirip yayınlamayı öğrenme projesi.

**İlkeler**

- Temel özellikler ücretsiz. Para isteyen ekranlar, reklam yok.
- Maliyeti olan özellikler (AI, ücretli API) ileride ücretli olabilir, ama kullanıcıyı rahatsız etmeden.
- Önce açık kaynak ve ücretsiz kaynaklar. Her içeriğin kaynağı ve lisansı uygulamada gösterilir.

## MVP hedefi

Kullanıcı seviyesine uygun bir kitap seçer ve okur. Bilmediği kelimeye dokununca Türkçesini görür, kelimeyi kaydeder, sonra kaydettiği kelimelerle test çözer. Hepsi internetsiz çalışır; hesap ve sunucu yok.

**Bitiş çizgisi:** Bu sürüm Google Play'de kapalı testte en az 12 kişi tarafından kullanılıyor.

## Temel kararlar

| Konu     | MVP kararı                                                                          | Neden                                                                                      |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Platform | Önce Android                                                                        | iOS yıllık 99 $'lık Apple hesabı istiyor. Kod ortak, sonra eklenir.                        |
| Kitaplar | Uygulamaya gömülü 6–10 kısa, açık lisanslı metin                                    | İndirme ve dosya yönetimi MVP'yi gereksiz büyütür.                                         |
| Seviye   | Kitabın üstünde A1/A2/B1 etiketi, kullanıcı kendisi seçer                           | Otomatik seviye tespiti MVP sonrasına kaldı.                                               |
| Sözlük   | Sadece bu kitaplardaki kelimeleri kapsayan, bilgisayarda bir scriptle üretilen JSON | Kök bulma gibi zor işler bilgisayarda bir kez yapılır, telefon sadece hazır tabloya bakar. |
| Veri     | Kelimeler `expo-sqlite`'ta, ayarlar ve okuma konumu AsyncStorage'da                 | Aranabilir ve ilişkili veri için veritabanı gerekiyor.                                     |
| Test     | Leitner kutuları                                                                    | Basit ve etkili bir aralıklı tekrar yöntemi.                                               |
| Ortam    | Expo Go                                                                             | MVP'de native kod gerektiren bir modül yok.                                                |

**Mimari not:** Çeviri tek bir `translate(word)` fonksiyonunun arkasında durur. Bugün yerel sözlüğe bakar; ileride bir AI servisine de sorabilir. API anahtarları **asla** uygulamanın içine konmaz (APK açılıp anahtar çalınabilir). Böyle bir özellik için araya küçük bir sunucu gerekir.

## Açık kaynaklar (adaylar)

Her kitabın lisansı eklenmeden önce tek tek kontrol edilir.

| Seviye | Kaynak                                                               | Lisans    |
| ------ | -------------------------------------------------------------------- | --------- |
| A1–A2  | StoryWeaver seviyeli hikâyeler                                       | CC BY 4.0 |
| A1–A2  | Ezop masalları (Gutenberg)                                           | Kamu malı |
| B1     | Grimm ve Andersen masallarının eski İngilizce çevirileri (Gutenberg) | Kamu malı |
| B1     | Simple English Wikipedia                                             | CC BY-SA  |
| B2+    | Kısa öyküler: Sherlock Holmes, O. Henry (Gutenberg)                  | Kamu malı |
| Sözlük | Wiktionary verisi (kaikki.org), ilk aday                             | CC BY-SA  |

## Fazlar

### Faz 0: İskelet ✅

- [x] Bağımlılıkları SDK 57 ile uyumlu hâle getir (`expo-doctor` 21/21)
- [x] ESLint kurulumu (`npx expo lint`)
- [x] Expo Router'a geçiş, `src/app/` yapısı
- [x] Okuyucuyu sekmeden çıkarıp `book/[id]` sayfasına taşı
- [x] Kelimelerim ekranındaki kayıt hatasını düzelt
- [x] Telefonda Expo Go ile dene: 3 sekme açılıyor, örnek kitaba dokununca okuyucu açılıyor

_Öğrenilenler:_ dosya tabanlı yönlendirme, layout'lar, dinamik route.

### Faz 1: Kütüphane ve okuyucu

- [x] `Book` tipi: id, başlık, yazar, seviye, kaynak, lisans, paragraflara bölünmüş bölümler
- [x] İlk örnek kitap (`fox-and-grapes`)
- [x] İkinci kitabı ekle, Kitaplar ekranı gerçek kitapları göstersin (başlık, yazar, seviye rozeti)
- [x] Seviyeye göre filtre
- [ ] Okuyucu: metni paragraf paragraf `FlatList` ile göster
- [ ] Kelimeler dokunulabilir olsun (iç içe `<Text onPress>`), seçilen kelime vurgulansın
- [ ] Alttan açılan kelime paneli
- [ ] Son okunan yeri hatırla

_Öğrenilecekler:_ `FlatList`, metni kelimelere bölme (regex), dokunma olayları, stil.
_Bitti sayılır:_ kitap seçip okuyabiliyorum, dokunduğum kelime panelde görünüyor (çeviri henüz yok).

### Faz 2: İnternetsiz sözlük

- [ ] `scripts/build-dictionary.ts`: kitaplardaki kelimeleri toplar, köklerini bulur ("running" → "run"), Türkçe karşılıklarını çeker ve `src/data/dictionary.json` dosyasını yazar
- [ ] Sözlük kaynağını seç ve lisansını doğrula
- [ ] Panelde anlam ve kelime türü göster, `expo-speech` ile telaffuz ekle
- [ ] Hakkında ekranı: kitap ve sözlük kaynakları

_Öğrenilecekler:_ Node script yazma, veri işleme, lisanslar.
_Bitti sayılır:_ örnek kitaplardaki kelimelerin büyük çoğunluğu çevriliyor.

### Faz 3: Kelimelerim

- [ ] `expo-sqlite` ile `words` tablosu: kelime, kök, çeviri, geçtiği cümle, kitap, tarih, Leitner kutusu, sonraki tekrar tarihi
- [ ] Şema sürümü (migration) mantığı
- [ ] Okuyucudan kelime kaydetme
- [ ] Listede arama ve silme
- [ ] AsyncStorage'daki geçici test listesini kaldır

_Öğrenilecekler:_ SQL, şema tasarımı, kendi hook'unu yazmak (`useWords`).
_Bitti sayılır:_ uygulamayı kapatıp açınca kelimeler duruyor.

### Faz 4: Test

- [ ] Kelime kartı cümlesiyle birlikte gösterilir; cevap "Biliyorum" ya da "Bilmiyorum"
- [ ] Leitner: bilinen kelime üst kutuya çıkar, bilinmeyen 1. kutuya döner
- [ ] "Bugün X kelime tekrar edilecek" bilgisi
- [ ] Kapalı test için 12 kişiyi toplamaya başla

_Öğrenilecekler:_ algoritma kurma, tarih hesapları, durum yönetimi.

### Faz 5: Cila

- [ ] Uygulama adı, ikon, açılış ekranı (splash)
- [ ] `android.package` belirle (ör. `com.yusuf.englishreader`). **Play'e yükledikten sonra değiştirilemez.**
- [ ] Boş ekranlar ve hata durumları
- [ ] Kitap sayısını 6–10'a çıkar
- [ ] Gizlilik politikası sayfası (GitHub Pages yeterli)
- [ ] Kitap metinlerinin Türkiye'deki telif durumunu kontrol et (Gutenberg sadece ABD için "kamu malı" diyor)
- [ ] Kullanılan açık kaynak paketlerin lisanslarını Hakkında ekranında listele

### Faz 6: Yayın

- [ ] `eas build` ile APK al, kendi telefonunda dene
- [ ] Play Console hesabı (bir kerelik 25 $, kimlik doğrulaması birkaç gün sürebilir)
- [ ] Kapalı test: en az 12 kişi, 14 gün
- [ ] Herkese açık yayın

_Öğrenilecekler:_ build, imzalama, mağaza süreci.

## MVP sonrası (sırasız)

- Otomatik seviye tespiti (NGSL kelime sıklığı listesiyle "bu kitabın %92'sini biliyorsun")
- MEB İngilizce kitaplarından sınıf ve ünite bazlı kelime listeleri (telif durumu kontrol edilecek)
- Kullanıcının kendi `.txt` veya `.epub` dosyasını eklemesi
- Gutenberg'den kitap indirme
- AI ile cümle çevirisi (ücretli olabilecek kısım)
- iOS

## Çalışma şekli

- Her faz için ayrı bir branch aç (`faz-1-okuyucu` gibi). Faz bitince Pull Request açıp main'e birleştir.
- Bir işi bitmiş saymadan önce `npx expo lint` ve `npx tsc --noEmit` çalıştır.
- Paket eklerken her zaman `npx expo install <paket>` kullan, ardından `npx expo-doctor` çalıştır.
