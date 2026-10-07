# Bundled Quran data sources

## Primary dataset
- Package: [quran-json](https://github.com/risan/quran-json) **v3.1.2**
- CDN URL used: `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json`
- Processed locally into `quran.json` (Arabic Uthmani + English Saheeh International per ayah)
- Package / redistribution license: **CC BY-SA 4.0** (see upstream README)

## Text & translation attributions
- **Arabic (Uthmani):** The Noble Qur'an Encyclopedia (quranenc.com), via quran-json
- **Saheeh International** (Umm Muhammad), via [Tanzil.net](https://tanzil.net/trans/en.sahih) — bundled in `quran.json`
- **Pickthall** (Mohammed Marmaduke William Pickthall) — public domain; bundled from `api.alquran.cloud/v1/quran/en.pickthall` into `translations/pickthall.json`
- **Yusuf Ali** (Abdullah Yusuf Ali) — redistributed with attribution from Tanzil `en.yusufali` via alquran.cloud into `translations/yusufali.json`
- **Transliteration names:** included in quran-json dataset; originally from Tanzil.net

## Study data (word-by-word / tafsir)
- **Word-by-word:** Quran.com API v4 English word glosses
- **Tafsir:** Ibn Kathir (Abridged) via Quran.com `en-tafisr-ibn-kathir`
- **Offline subset:** surahs 1, 112, 113, 114 bundled under `study/` (`wbw-subset.json`, `tafsir-ibn-kathir-subset.json`)
- **Other ayahs:** fetched on demand and cached in AsyncStorage (not scraped from commercial apps)

## Juz boundaries
- Standard 30 Juz (Para) Hafs divisions hardcoded in `juz.json` (public domain / conventional)

## Audio (streamed by default; optional offline download)
- Reciter: Mishary Rashid Alafasy (128 kbps)
- URL pattern: `https://everyayah.com/data/Alafasy_128kbps/{SSS}{AAA}.mp3`
  where SSS and AAA are zero-padded surah and ayah numbers
- Source: [everyayah.com](https://everyayah.com) — public Quran audio CDN
- Offline downloads store files under the app documents directory (`alafasy/`); not redistributed in the repo

## Fonts (SIL OFL)
- **Amiri** — `assets/fonts/Amiri-Regular.ttf` (+ `OFL-Amiri.txt`)
- **Scheherazade New** — `assets/fonts/ScheherazadeNew-Regular.ttf` (+ `OFL-ScheherazadeNew.txt`)
- Upstream: [google/fonts](https://github.com/google/fonts) OFL directories

## Tajweed coloring (reader)
- **Bundled subset:** `tajweed/subset.json` for surahs **1 (Al-Fatihah), 112, 113, 114**
- **Source:** Quran.com API v4 `uthmani_tajweed` (`https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=N`)
- **Processing:** HTML `<tajweed class=…>` tags mapped to legend rules only:
  - `qalaqah` → Qalqala (green)
  - `iqlab` → Iqlab (blue)
  - `idgham_*` → Idgham (purple)
  - `ikhafa*` → Ikhfa'a (red)
  - `ghunnah` → Ghunna (orange)
- Other API classes (`ham_wasl`, `laam_shamsiyah`, `madda_*`, etc.) are left uncolored so the on-screen legend matches the reference.
- **Fallback:** For all other surahs, a lightweight heuristic colors noon-saakin / tanween (ikhfa, idgham, iqlab), qalqala+sukoon, and noon/meem mushaddad (ghunna). This is a demo approximation — not a full tajweed engine.
- **License note:** Annotations derived from Quran.com public API content for offline demo; not scraped from commercial mushaf apps.

## Dua & Azkar (`azkar.json`)
Built by `scripts/build-azkar-data.mjs` from two **MIT-licensed** datasets pinned to exact commits.
Arabic, transliteration, English translation, repeat count, virtue text and reference are copied
**verbatim**; the script only selects entries and groups them into app categories. No text or
references were written by hand. License texts: `licenses/MIT-*.txt`.

### 1. Morning and Evening Adhkar DB — Seen Arabic
- Repo: https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB
- Commit: `29d7623fede52eca835a789025dfda866e8cfe44` (2026-02-14)
- File: https://raw.githubusercontent.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB/29d7623fede52eca835a789025dfda866e8cfe44/en.json
- License: **MIT** — Copyright (c) 2024 Seen Arabic
- Upstream cites Hisn al-Muslim (Sa'id bin Ali bin Wahf Al-Qahtani) and its sharh as sources.
- Fields used: `content` → arabic, `transliteration`, `translation`, `count`, `count_description`,
  `fadl` → virtue, `source` → reference. `type` 0 = morning & evening, 1 = morning only, 2 = evening only.
- Used for: **Morning azkar** (26), **Evening azkar** (24) — 34 unique entries.
- Not used: `audio` (hisnmuslim.com URLs, licensing unclear), `hadith_text`, vocabulary notes.

### 2. Dua & Dhikr — fitrahive
- Repo: https://github.com/fitrahive/dua-dhikr (package `@fitrahive/dua-dhikr` v0.1.3)
- Commit: `f42f895f914319a844c3e3c2279483cae060ea19` (2025-11-29)
- Files: `https://raw.githubusercontent.com/fitrahive/dua-dhikr/f42f895f914319a844c3e3c2279483cae060ea19/data/dua-dhikr/<category>/en.json`
  (`daily-dua`, `selected-dua`, `dhikr-after-salah`, `morning-dhikr`)
- License: **MIT** — Copyright (c) 2023 Fitrahive
- Fields used: `title`, `arabic`, `latin` → transliteration, `translation`, `notes` (count wording),
  `benefits`/`fawaid` → virtue, `source` → reference.
- Repeat count is parsed from `notes` (e.g. "Read 33x" → 33); entries without a count in `notes` default to 1.
- Used for: After salah (13), Before sleep (1), Waking up (1), Entering & leaving home (4),
  Eating & drinking (3), Travel (4), Distress & anxiety (5), Forgiveness (4), Quranic duas (4),
  Mosque/wudu/adhan (5), Clothing (2), Rain & wind (4), Restroom (2), Sneezing (3), Fasting (1),
  Selected duas (5).
- Skipped as duplicate: `selected-dua[6]` (same Arabic as `daily-dua[30]`, Abu Dawud 1555).

### Known gaps
- Neither dataset includes Hisn al-Muslim chapter/dua numbers, so none are shown.
- "Before sleep" and "Waking up" have one entry each; "Eating & drinking" has no drinking-specific dua.
- Tasbeeh presets reuse the after-salah Tasbih/Tahmid/Takbir Arabic from fitrahive; preset targets
  (33/33/34) are app settings, not dataset values.
