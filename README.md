# Iqra

A polished, offline-first Qur’an reading app for **iOS** and **Android**, built with **Expo (React Native) + TypeScript + Expo Router**.

Display name: **Iqra**

## Features

- **Surah index** — all 114 surahs with Arabic name, English name, ayah count, Meccan/Medinan
- **Surah reader** — large RTL Arabic (Uthmani), ayah numbers, optional English under each ayah
- **Juz / Para index** — jump to any of the 30 juz
- **Continue reading** — restores last viewed ayah (AsyncStorage)
- **Bookmarks** — save / list / remove ayahs
- **Search** — local Arabic or English full-text search
- **Audio** — play/pause ayah recitation (Mishary Alafasy via everyayah.com CDN)
- **Offline audio** — download entire surahs; playback prefers local files
- **Continuous playback** — auto-advance ayahs until the surah ends
- **Translations** — Saheeh International, Pickthall, Yusuf Ali (settings picker)
- **Study panels** — optional word-by-word gloss + Ibn Kathir (abridged) tafsir
- **Arabic fonts** — System, Amiri, Scheherazade New (size + family in settings)
- **Settings** — translation, fonts, continuous play, study toggles, theme
- **About** — attributions and licenses

## Stack

- Expo managed workflow + Expo Router
- TypeScript
- `@react-native-async-storage/async-storage` for bookmarks, last-read, settings, caches
- `expo-audio` for ayah recitation playback
- `expo-file-system` for offline Alafasy downloads
- Bundled local JSON for offline Arabic + English translations

## Quick start

```bash
cd /workspace/iqra-quran   # or your clone path
npm install
npx expo start
```

Then:

- Scan the QR code with **Expo Go** (Android) or the Camera app (iOS)
- Press `a` for Android emulator / `i` for iOS simulator (macOS)
- Press `w` for web (layout is mobile-first; offline downloads are native-only)

### Requirements

- Node.js 20+
- Expo Go app on a physical device, **or** Android Studio / Xcode simulators

## Project layout

```
app/                 # Expo Router screens
  (tabs)/            # Surahs, Juz, Bookmarks, Search, Settings
  surah/[id].tsx     # Reader
  downloads.tsx      # Offline audio manager
  about.tsx          # Attributions
assets/data/         # Bundled Quran, translations, study subset
assets/fonts/        # SpaceMono, Amiri, Scheherazade New (OFL)
contexts/            # Settings, bookmarks, audio, downloads
lib/                 # Quran helpers, storage, audio, downloads, study
components/ui/       # Shared UI
```

## Data sources & licenses

Documented in-app (**About**) and in `assets/data/SOURCES.md`.

| Asset | Source | Notes |
|-------|--------|-------|
| Arabic Uthmani + Saheeh | [quran-json@3.1.2](https://github.com/risan/quran-json) | CC BY-SA 4.0 package |
| Pickthall / Yusuf Ali | alquran.cloud (Tanzil editions) | Bundled under `assets/data/translations/` |
| Word-by-word / tafsir | Quran.com API v4 | Offline subset for 1, 112–114; else fetch+cache |
| Juz boundaries | Standard Hafs 30 juz | `assets/data/juz.json` |
| Audio | [everyayah.com](https://everyayah.com) Alafasy 128kbps | Stream or download offline |
| Fonts | Amiri, Scheherazade New | SIL OFL 1.1 |

**Not used:** QuranMajeed or any commercial app content/scraping.

## How to try the newer features

1. **Offline audio** — Settings → Manage audio downloads → download a short surah (e.g. 112). Open it and play; status shows “offline” when local.
2. **Translations** — Settings → Translation → Pickthall or Yusuf Ali; open any surah.
3. **Study panels** — Settings → enable Word-by-word and/or Tafsir → open Al-Fatiha → tap the book icon on an ayah.
4. **Fonts** — Settings → Arabic font → Amiri or Scheherazade New.
5. **Continuous play** — Settings → Continuous surah playback (on by default) → open a surah → Play surah (or play any ayah).

## Product decisions

- Three bundled English translations for offline reading
- Cream / teal reading theme with system-aware dark mode
- Audio streams by default; optional per-surah offline cache
- Study panels stay collapsed until the reader taps an ayah (keeps the page clean)
- Last-read updates as you scroll the reader

## License

App code: MIT (see `LICENSE` if present). Quran text/translations/fonts remain under their respective upstream licenses — always preserve attribution.
