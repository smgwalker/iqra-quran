# Bundled Quran data sources

## Primary dataset
- Package: [quran-json](https://github.com/risan/quran-json) **v3.1.2**
- CDN URL used: `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json`
- Processed locally into `quran.json` (Arabic Uthmani + English per ayah)
- Package / redistribution license: **CC BY-SA 4.0** (see upstream README)

## Text & translation attributions (from quran-json)
- **Arabic (Uthmani):** The Noble Qur'an Encyclopedia (quranenc.com)
- **English translation:** Saheeh International (Umm Muhammad), via [Tanzil.net](https://tanzil.net/trans/en.sahih)
- **Transliteration names:** included in dataset; transliteration text originally from Tanzil.net

## Juz boundaries
- Standard 30 Juz (Para) Hafs divisions hardcoded in `juz.json` (public domain / conventional)

## Audio (streamed, not bundled)
- Reciter: Mishary Rashid Alafasy (128 kbps)
- URL pattern: `https://everyayah.com/data/Alafasy_128kbps/{SSS}{AAA}.mp3`
  where SSS and AAA are zero-padded surah and ayah numbers
- Source: [everyayah.com](https://everyayah.com) — public Quran audio CDN
