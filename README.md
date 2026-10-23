# English Reader

İngilizce kitap okuyarak kelime öğrenmeye yarayan, reklamsız ve internetsiz çalışmayı hedefleyen mobil uygulama.<br>
<sub>A reading-first English vocabulary app built with Expo and React Native. Early stage, Android first.</sub>

![Durum](https://img.shields.io/badge/durum-geliştiriliyor-orange)
![Expo](https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

## Neden bu uygulama?

Play Store'daki İngilizce uygulamalar sürekli "pro sürüme geç" diye bastırıyor. English Reader şu ilkelerle yapılıyor:

- Temel özellikler ücretsiz, reklam yok.
- Önce açık kaynak ve ücretsiz içerik. Her kitabın kaynağı ve lisansı uygulamada gösterilecek.
- Hesap ve sunucu gerektirmez.

Bu proje aynı zamanda bir mobil uygulamayı baştan sona geliştirip mağazada yayınlamayı öğrenme çalışmam.

## Hedef

Kullanıcı seviyesine uygun (A1, A2, B1) bir kitap seçer ve okur. Bilmediği kelimeye dokununca Türkçesini görür, kelimeyi kaydeder, sonra kaydettiği kelimelerle aralıklı tekrar (Leitner kutuları) testi çözer. Hepsi internetsiz çalışır.

**Bitiş çizgisi:** Uygulama Google Play kapalı testinde en az 12 kişi tarafından kullanılıyor.

## Durum

| Faz | Konu | Durum |
|---|---|---|
| 0 | İskelet: Expo Router, 3 sekmeli yapı | ✅ Tamamlandı |
| 1 | Kütüphane ve okuyucu | 🚧 Devam ediyor |
| 2 | İnternetsiz sözlük | Planlandı |
| 3 | Kelimelerim (SQLite) | Planlandı |
| 4 | Test (Leitner kutuları) | Planlandı |
| 5 | Cila: ikon, açılış ekranı, boş durumlar | Planlandı |
| 6 | Yayın: Play Store kapalı test | Planlandı |

Uygulamada şu an Kitaplar, Kelimelerim ve Test sekmeleri var. Okuyucu, sözlük ve test ekranları sonraki fazlarda doluyor. Kararlar ve ilerleme: [docs/ROADMAP.md](docs/ROADMAP.md)

## Teknoloji

- Expo SDK 58, React Native 0.88, React 19.3
- Expo Router: dosya tabanlı yönlendirme, tipli rotalar
- TypeScript ve ESLint
- AsyncStorage (şimdilik geçici). Planlanan: `expo-sqlite`, `expo-speech`

## Çalıştırma

Gereksinim: Node.js (güncel LTS) ve telefonunuzda [Expo Go](https://expo.dev/go).

```bash
git clone https://github.com/yusufgurkan/english-reader.git
cd english-reader
npm install
npx expo start
```

Terminalde çıkan QR kodu Expo Go ile okutun.

Kontroller:

```bash
npm run lint
npx tsc --noEmit
```

## Proje yapısı

```
src/app/    Ekranlar (Expo Router): (tabs)/ ve book/[id]
src/data/   Kitap verileri (books/)
src/types/  Ortak tipler (Book)
assets/     İkon ve açılış görselleri
docs/       Yol haritası
```

## Çalışma şekli

Her faz ayrı bir branch'te geliştirilir (`faz-1-okuyucu` gibi), faz bitince Pull Request ile `main`'e birleşir. Lint ve tip denetimi geçmeden iş bitmiş sayılmaz.

## Lisans

Tüm hakları saklıdır © 2026 Yusuf Gürkan. Kodun hiçbir bölümü izin alınmadan kopyalanamaz, değiştirilemez, dağıtılamaz veya kullanılamaz. Ayrıntılar: [LICENSE](LICENSE).

Kullanılan açık kaynak paketler ve kitap metinleri kendi lisanslarına tabidir: [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
