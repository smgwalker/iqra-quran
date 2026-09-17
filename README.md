# Iqra

A polished, offline-first Qur’an reading app for **iOS** and **Android**, built with **Expo (React Native) + TypeScript + Expo Router**.

Display name: **Iqra**

## Features (v1)

- **Surah index** — all 114 surahs with Arabic name, English name, ayah count, Meccan/Medinan
- **Surah reader** — large RTL Arabic (Uthmani), ayah numbers, optional English under each ayah
- **Juz / Para index** — jump to any of the 30 juz
- **Continue reading** — restores last viewed ayah (AsyncStorage)
- **Bookmarks** — save / list / remove ayahs
- **Search** — local Arabic or English full-text search
- **Audio** — play/pause ayah recitation (Mishary Alafasy via everyayah.com CDN)
- **Settings** — translation toggle, Arabic font size, theme (system / light / dark)
- **About** — attributions and licenses

## Stack

- Expo managed workflow + Expo Router
- TypeScript
- `@react-native-async-storage/async-storage` for bookmarks, last-read, settings
- `expo-audio` for ayah recitation playback
- Bundled local JSON for offline Arabic + English

## Quick start

```bash
cd /workspace/iqra-quran   # or your clone path
npm install
npx expo start
```

Then:

- Scan the QR code with **Expo Go** (Android) or the Camera app (iOS)
- Press `a` for Android emulator / `i` for iOS simulator (macOS)
- Press `w` for web (layout is mobile-first)

### Requirements

- Node.js 20+
- Expo Go app on a physical device, **or** Android Studio / Xcode simulators

## Project layout

```
app/                 # Expo Router screens
  (tabs)/            # Surahs, Juz, Bookmarks, Search, Settings
  surah/[id].tsx     # Reader
  about.tsx          # Attributions
assets/data/         # Bundled Quran + Juz JSON
contexts/            # Settings, bookmarks, audio
lib/                 # Quran helpers, storage, audio URLs
components/ui/       # Shared UI
```

## Data sources & licenses

Documented in-app (**About**) and in `assets/data/SOURCES.md`.

| Asset | Source | Notes |
|-------|--------|-------|
| Arabic Uthmani + English | [quran-json@3.1.2](https://github.com/risan/quran-json) `quran_en.json` | CDN: `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json` |
| Arabic text origin | [quranenc.com](https://quranenc.com) (via quran-json) | Uthmani script |
| English translation | **Saheeh International** (Umm Muhammad) via [Tanzil](https://tanzil.net/trans/en.sahih) | Bundled for offline reading with attribution |
| Package license | **CC BY-SA 4.0** (quran-json) | See upstream README |
| Juz boundaries | Standard Hafs 30 juz | `assets/data/juz.json` |
| Audio | [everyayah.com](https://everyayah.com) Alafasy 128kbps | Streamed; not bundled. Pattern: `https://everyayah.com/data/Alafasy_128kbps/{SSS}{AAA}.mp3` |

**Not used:** QuranMajeed or any commercial app content/scraping.

## Product decisions

- Single bundled English translation (Saheeh International) for a clean v1
- Cream / teal reading theme with system-aware dark mode
- Audio is ayah-level play/pause (network required); text works fully offline
- Last-read updates as you scroll the reader

## Out of scope (v1)

Tajweed coloring, prayer times, Qibla, social features, multi-translation pack UI

## Next steps

- Offline audio download / queue
- Additional translations (toggle)
- Word-by-word / tafsir panels
- Custom Arabic fonts (e.g. Amiri / Scheherazade)
- Continuous surah playback (auto-advance ayahs)

## License

App code: MIT (see `LICENSE` if present). Quran text/translations remain under their respective upstream licenses — always preserve attribution.
