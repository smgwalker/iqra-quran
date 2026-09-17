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
