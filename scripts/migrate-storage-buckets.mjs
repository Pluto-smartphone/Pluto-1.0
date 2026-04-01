/**
 * ย้ายไฟล์จาก bucket เดิม → bucket ใหม่ (ค่าเริ่ม: product-images → phone-images)
 * และอัปเดต phone_images.storage_path ให้เป็น object key แบบ relative (ไม่ใช่ URL เต็ม)
 *
 * ต้องใช้ Service Role Key (ไม่ใช่ anon key) เพื่อ list/download/upload ข้าม policy
 *
 * ตั้งค่า env (หรือใช้ node --env-file=.env):
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *
 * รัน:
 *   node scripts/migrate-storage-buckets.mjs
 *   node scripts/migrate-storage-buckets.mjs --dry-run
 *   node scripts/migrate-storage-buckets.mjs --db-only
 *   node scripts/migrate-storage-buckets.mjs --storage-only
 *   node scripts/migrate-storage-buckets.mjs --delete-source   (หลังย้ายสำเร็จ ลบของเดิมใน source bucket)
 */

import { createClient } from '@supabase/supabase-js';

const SRC_BUCKET = process.env.SRC_BUCKET ?? 'product-images';
const DST_BUCKET = process.env.DST_BUCKET ?? 'phone-images';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const dbOnly = args.has('--db-only');
const storageOnly = args.has('--storage-only');
const deleteSource = args.has('--delete-source');

if (dbOnly && storageOnly) {
  console.error('ใช้ได้แค่ตัวใดตัวหนึ่ง: --db-only หรือ --storage-only');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    'ตั้งค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ก่อนรัน\n' +
      'ตัวอย่าง: $env:SUPABASE_SERVICE_ROLE_KEY="..." ; node scripts/migrate-storage-buckets.mjs'
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** @param {string} prefix */
async function listAllObjectPaths(bucket, prefix = '') {
  const paths = [];
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) throw error;

  for (const item of data ?? []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.metadata === null) {
      const sub = await listAllObjectPaths(bucket, path);
      paths.push(...sub);
    } else {
      paths.push(path);
    }
  }
  return paths;
}

/**
 * ดึง object key จาก URL แบบ public ของ Supabase
 * เช่น .../storage/v1/object/public/product-images/uuid/a.jpg → uuid/a.jpg
 * @param {string} storagePath
 * @param {string} [bucketName]
 */
function normalizeStoragePath(storagePath, bucketName = SRC_BUCKET) {
  if (!storagePath || typeof storagePath !== 'string') return storagePath;
  const t = storagePath.trim();
  if (!t.startsWith('http://') && !t.startsWith('https://')) {
    if (t.startsWith(`${bucketName}/`)) return t.slice(bucketName.length + 1);
    return t;
  }
  try {
    const u = new URL(t);
    const re = new RegExp(`/storage/v1/object/public/([^/]+)/(.+)$`);
    const m = u.pathname.match(re);
    if (m) {
      const b = m[1];
      const rest = m[2];
      if (b === bucketName || b === DST_BUCKET) return decodeURIComponent(rest);
    }
  } catch {
    /* ignore */
  }
  return t;
}

async function migrateStorage() {
  console.log(`\n[storage] ${SRC_BUCKET} → ${DST_BUCKET}${dryRun ? ' (dry-run)' : ''}\n`);

  const paths = await listAllObjectPaths(SRC_BUCKET);
  console.log(`พบ ${paths.length} ไฟล์ใน ${SRC_BUCKET}`);

  let copied = 0;
  let skipped = 0;
  let failed = 0;

  for (const path of paths) {
    if (dryRun) {
      console.log(`  would copy: ${path}`);
      copied++;
      continue;
    }

    const { data: fileBlob, error: dlErr } = await supabase.storage.from(SRC_BUCKET).download(path);
    if (dlErr) {
      console.error(`  download fail: ${path}`, dlErr.message);
      failed++;
      continue;
    }

    const contentType = fileBlob.type && fileBlob.type !== '' ? fileBlob.type : 'application/octet-stream';
    const { error: upErr } = await supabase.storage.from(DST_BUCKET).upload(path, fileBlob, {
      upsert: true,
      contentType,
    });

    if (upErr) {
      console.error(`  upload fail: ${path}`, upErr.message);
      failed++;
      continue;
    }

    copied++;
    console.log(`  ok: ${path}`);

    if (deleteSource) {
      const { error: rmErr } = await supabase.storage.from(SRC_BUCKET).remove([path]);
      if (rmErr) console.error(`  remove source fail: ${path}`, rmErr.message);
    }
  }

  console.log(`\nสรุป storage: copied=${copied}, failed=${failed}, skipped=${skipped}`);
}

async function migrateDbPaths() {
  console.log(`\n[database] ปรับ phone_images.storage_path${dryRun ? ' (dry-run)' : ''}\n`);

  const { data: rows, error } = await supabase.from('phone_images').select('id, storage_path');
  if (error) throw error;

  let updated = 0;
  let unchanged = 0;

  for (const row of rows ?? []) {
    const raw = row.storage_path;
    const next = normalizeStoragePath(raw, SRC_BUCKET);
    if (next === raw) {
      unchanged++;
      continue;
    }
    if (dryRun) {
      console.log(`  would update ${row.id}:\n    ${raw}\n    → ${next}`);
      updated++;
      continue;
    }
    const { error: upErr } = await supabase
      .from('phone_images')
      .update({ storage_path: next })
      .eq('id', row.id);
    if (upErr) {
      console.error(`  update fail ${row.id}:`, upErr.message);
    } else {
      updated++;
      console.log(`  ok ${row.id}: ${next}`);
    }
  }

  console.log(`\nสรุป DB: updated=${updated}, unchanged=${unchanged}`);
}

async function main() {
  try {
    if (!dbOnly) await migrateStorage();
    if (!storageOnly) await migrateDbPaths();
    console.log('\nเสร็จแล้ว');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
