#!/usr/bin/env node
/**
 * Sync artwork data from Notion databases to local JSON.
 *
 * Usage:
 *   NOTION_API_KEY=secret_xxx NOTION_GENERAL_DB_ID=xxx NOTION_SOPA_DB_ID=xxx node scripts/sync-notion.mjs
 *
 * This pulls "Selected" entries from both General and SOPA databases,
 * merges them, and writes data/artworks.json.
 */

import { Client } from '@notionhq/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const GENERAL_DB = process.env.NOTION_GENERAL_DB_ID;
const SOPA_DB = process.env.NOTION_SOPA_DB_ID;

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractText(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title.map((t) => t.plain_text).join('');
  if (prop.type === 'rich_text') return prop.rich_text.map((t) => t.plain_text).join('');
  if (prop.type === 'select') return prop.select?.name || '';
  if (prop.type === 'number') return prop.number || 0;
  return '';
}

function extractImage(page) {
  // Try cover image first
  if (page.cover) {
    if (page.cover.type === 'file') return page.cover.file.url;
    if (page.cover.type === 'external') return page.cover.external.url;
  }
  // Try properties that might contain images
  for (const [key, val] of Object.entries(page.properties)) {
    if (val.type === 'files' && val.files.length > 0) {
      const file = val.files[0];
      if (file.type === 'file') return file.file.url;
      if (file.type === 'external') return file.external.url;
    }
  }
  return '';
}

async function fetchDatabase(databaseId, category) {
  const artworks = [];
  let cursor = undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      filter: {
        property: 'Status',
        select: { equals: 'Gallery - Selected' },
      },
    });

    for (const page of response.results) {
      const props = page.properties;

      // Try common property names (adjust to match your Notion schema)
      const title =
        extractText(props['Title'] || props['Name'] || props['Artwork Title'] || props['title']);
      const artist =
        extractText(props['Artist Name'] || props['Artist'] || props['artist_name']);
      const medium = extractText(props['Medium'] || props['medium']);
      const dimensions = extractText(props['Dimensions'] || props['dimensions'] || props['Size']);
      const description =
        extractText(props['Description'] || props['Artist Statement'] || props['description']);
      const image = extractImage(page);

      if (title) {
        artworks.push({
          id: slugify(`${title}-${artist}`) || page.id,
          notionId: page.id,
          title,
          artist,
          medium,
          dimensions: typeof dimensions === 'number' ? '' : dimensions,
          description,
          image,
          category,
        });
      }
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return artworks;
}

async function main() {
  console.log('Syncing artwork data from Notion...\n');

  if (!GENERAL_DB && !SOPA_DB) {
    console.error('Error: Set NOTION_GENERAL_DB_ID and/or NOTION_SOPA_DB_ID environment variables.');
    process.exit(1);
  }

  let all = [];

  if (GENERAL_DB) {
    console.log(`Fetching General Submissions (${GENERAL_DB})...`);
    const general = await fetchDatabase(GENERAL_DB, 'general');
    console.log(`  Found ${general.length} selected artworks.`);
    all = all.concat(general);
  }

  if (SOPA_DB) {
    console.log(`Fetching SOPA Submissions (${SOPA_DB})...`);
    const sopa = await fetchDatabase(SOPA_DB, 'sopa');
    console.log(`  Found ${sopa.length} selected artworks.`);
    all = all.concat(sopa);
  }

  // Deduplicate by id
  const seen = new Set();
  all = all.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  const outPath = join(__dirname, '..', 'data', 'artworks.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(all, null, 2));

  console.log(`\nWrote ${all.length} artworks to data/artworks.json`);
  console.log('\nNote: Notion image URLs expire after ~1 hour.');
  console.log('For production, download images to public/images/artworks/ and update the paths.');
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
