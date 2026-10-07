#!/usr/bin/env node
/**
 * Builds assets/data/azkar.json from two MIT-licensed open datasets pinned to exact commits.
 * Text, transliteration, translation, counts and references are copied verbatim;
 * this script only selects entries and groups them into app categories.
 *
 *   node scripts/build-azkar-data.mjs
 *
 * See assets/data/SOURCES.md for licenses.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEEN = {
  repo: 'Seen-Arabic/Morning-And-Evening-Adhkar-DB',
  commit: '29d7623fede52eca835a789025dfda866e8cfe44',
  file: 'en.json',
  license: 'MIT (Copyright (c) 2024 Seen Arabic)',
};
const FITRAHIVE = {
  repo: 'fitrahive/dua-dhikr',
  commit: 'f42f895f914319a844c3e3c2279483cae060ea19',
  version: '0.1.3',
  license: 'MIT (Copyright (c) 2023 Fitrahive)',
};

const raw = (repo, commit, path) => `https://raw.githubusercontent.com/${repo}/${commit}/${path}`;

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const clean = (s) => (typeof s === 'string' && s.trim() ? s.trim() : undefined);

function parseCount(notes) {
  const m = typeof notes === 'string' ? notes.match(/(\d+)\s*x/i) : null;
  return m ? Number(m[1]) : null;
}

const duas = {};

function addSeen(item) {
  const id = `ma-${item.order}`;
  duas[id] = {
    id,
    arabic: item.content.trim(),
    transliteration: clean(item.transliteration),
    translation: item.translation.trim(),
    count: item.count,
    countLabel: clean(item.count_description),
    reference: clean(item.source),
    virtue: clean(item.fadl),
    origin: `${SEEN.repo}/${SEEN.file}#order=${item.order}`,
  };
  return id;
}

function addFitrahive(slug, list, index) {
  const item = list[index];
  if (!item) throw new Error(`missing ${slug}[${index}]`);
  const id = `fh-${slug}-${index}`;
  const count = parseCount(item.notes);
  duas[id] = {
    id,
    title: item.title.trim(),
    arabic: item.arabic.trim(),
    transliteration: clean(item.latin),
    translation: item.translation.trim(),
    count: count ?? 1,
    countLabel: clean(item.notes),
    reference: clean(item.source),
    virtue: clean(item.benefits ?? item.fawaid),
    origin: `${FITRAHIVE.repo}/data/dua-dhikr/${slug}/en.json#${index}`,
  };
  return id;
}

async function main() {
  const seen = await getJson(raw(SEEN.repo, SEEN.commit, SEEN.file));
  const fh = {};
  for (const slug of ['morning-dhikr', 'evening-dhikr', 'daily-dua', 'selected-dua', 'dhikr-after-salah']) {
    fh[slug] = await getJson(raw(FITRAHIVE.repo, FITRAHIVE.commit, `data/dua-dhikr/${slug}/en.json`));
  }

  const sortedSeen = [...seen].sort((a, b) => a.order - b.order);
  // type: 0 = morning & evening, 1 = morning only, 2 = evening only (per dataset README)
  const morning = sortedSeen.filter((d) => d.type === 0 || d.type === 1).map(addSeen);
  const evening = sortedSeen.filter((d) => d.type === 0 || d.type === 2).map(addSeen);

  const F = (slug, ...idx) => idx.map((i) => addFitrahive(slug, fh[slug], i));

  const categories = [
    { id: 'morning', title: 'Morning azkar', subtitle: 'After Fajr until sunrise', icon: 'sunny', color: '#F5A623', duaIds: morning },
    { id: 'evening', title: 'Evening azkar', subtitle: 'After Asr until Maghrib', icon: 'moon', color: '#5856D6', duaIds: evening },
    { id: 'after-salah', title: 'After salah', subtitle: 'Following the obligatory prayers', icon: 'hand-left', color: '#1B5E3B',
      duaIds: F('dhikr-after-salah', ...fh['dhikr-after-salah'].map((_, i) => i)) },
    { id: 'sleep', title: 'Before sleep', subtitle: 'When lying down', icon: 'bed', color: '#3A3A8C', duaIds: F('daily-dua', 0) },
    { id: 'waking', title: 'Waking up', subtitle: 'Upon waking', icon: 'alarm', color: '#FF9500', duaIds: F('daily-dua', 1) },
    { id: 'home', title: 'Entering & leaving home', subtitle: 'At the door', icon: 'home', color: '#34C759', duaIds: F('daily-dua', 12, 13, 14, 15) },
    { id: 'eating', title: 'Eating & drinking', subtitle: 'Before and after meals', icon: 'restaurant', color: '#FF6B35', duaIds: F('daily-dua', 4, 5, 6) },
    { id: 'travel', title: 'Travel', subtitle: 'Journeys and riding', icon: 'airplane', color: '#0095F6', duaIds: F('daily-dua', 21, 16, 17, 18) },
    { id: 'distress', title: 'Distress & anxiety', subtitle: 'Hardship, grief and debt', icon: 'heart-half', color: '#AF52DE',
      duaIds: [...F('daily-dua', 28, 30, 27, 29), ...F('selected-dua', 5)] },
    { id: 'forgiveness', title: 'Forgiveness (istighfar)', subtitle: 'Seeking pardon', icon: 'water', color: '#00A6A6',
      duaIds: [...F('daily-dua', 26), ...F('dhikr-after-salah', 0), ...F('morning-dhikr', 18), ...F('daily-dua', 37)] },
    { id: 'quranic', title: 'Quranic duas', subtitle: 'Supplications from the Qur’an', icon: 'book', color: '#8B6914',
      duaIds: [...F('selected-dua', 0, 3), ...F('daily-dua', 35, 37)] },
    { id: 'mosque', title: 'Mosque, wudu & adhan', subtitle: 'Purification and prayer', icon: 'business', color: '#154A2F', duaIds: F('daily-dua', 9, 10, 7, 8, 36) },
    { id: 'clothing', title: 'Clothing', subtitle: 'Getting dressed', icon: 'shirt', color: '#FF2D55', duaIds: F('daily-dua', 20, 19) },
    { id: 'weather', title: 'Rain & wind', subtitle: 'Weather', icon: 'rainy', color: '#64D2FF', duaIds: F('daily-dua', 22, 23, 24, 25) },
    { id: 'bathroom', title: 'Restroom', subtitle: 'Entering and leaving', icon: 'exit', color: '#8E8E93', duaIds: F('daily-dua', 2, 3) },
    { id: 'sneezing', title: 'Sneezing', subtitle: 'Sneezing and replying', icon: 'chatbubbles', color: '#C9A227', duaIds: F('daily-dua', 31, 32, 33) },
    { id: 'fasting', title: 'Fasting', subtitle: 'Breaking the fast', icon: 'cafe', color: '#D4AF37', duaIds: F('daily-dua', 11) },
    { id: 'general', title: 'Selected duas', subtitle: 'Steadfastness, character, good news', icon: 'sparkles', color: '#E91E63',
      duaIds: [...F('selected-dua', 1, 2, 4, 7), ...F('daily-dua', 34)] },
  ];

  const out = {
    meta: {
      note: 'Generated by scripts/build-azkar-data.mjs. Do not edit by hand; text is verbatim from the sources below.',
      sources: [
        {
          id: 'seen-arabic',
          name: 'Morning and Evening Adhkar DB',
          url: `https://github.com/${SEEN.repo}`,
          commit: SEEN.commit,
          file: raw(SEEN.repo, SEEN.commit, SEEN.file),
          license: SEEN.license,
          usedFor: 'Morning azkar, Evening azkar',
        },
        {
          id: 'fitrahive',
          name: 'Dua & Dhikr (fitrahive)',
          url: `https://github.com/${FITRAHIVE.repo}`,
          version: FITRAHIVE.version,
          commit: FITRAHIVE.commit,
          file: raw(FITRAHIVE.repo, FITRAHIVE.commit, 'data/dua-dhikr/<category>/en.json'),
          license: FITRAHIVE.license,
          usedFor: 'All other categories',
        },
      ],
    },
    categories,
    duas,
  };

  const here = dirname(fileURLToPath(import.meta.url));
  const dest = join(here, '..', 'assets', 'data', 'azkar.json');
  await writeFile(dest, JSON.stringify(out) + '\n');
  console.log(`wrote ${dest}: ${Object.keys(duas).length} unique duas`);
  for (const c of categories) console.log(`  ${c.id}: ${c.duaIds.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
