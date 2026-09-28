import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { performance } from 'node:perf_hooks';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', 'backend', 'nestjs', '.env') });

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;

async function testUpload(sizeMB) {
  const dummy = Buffer.alloc(sizeMB * 1024 * 1024, 'a');
  const key = `benchmark/upload-${Date.now()}-${sizeMB}MB.bin`;

  const start = performance.now();
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: dummy,
  }));
  const duration = (performance.now() - start) / 1000;
  const throughput = sizeMB / duration;

  console.log(`Upload ${sizeMB}MB: ${duration.toFixed(2)}s (${throughput.toFixed(2)} MB/s)`);
  return { key, duration, throughput };
}

async function testDownload(key, sizeMB) {
  const start = performance.now();

  const res = await client.send(new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));

  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  const data = Buffer.concat(chunks);

  const duration = (performance.now() - start) / 1000;
  const throughput = (data.length / 1024 / 1024) / duration;

  console.log(`Download ${sizeMB}MB: ${duration.toFixed(2)}s (${throughput.toFixed(2)} MB/s)`);
  return { duration, throughput };
}

(async () => {
  console.log('=== R2 Benchmark ===\n');

  const sizes = [1, 10, 50];
  const results = [];

  for (const size of sizes) {
    console.log(`--- ${size}MB ---`);
    const up = await testUpload(size);
    const down = await testDownload(up.key, size);
    results.push({
      size,
      uploadDuration: up.duration,
      uploadThroughput: up.throughput,
      downloadDuration: down.duration,
      downloadThroughput: down.throughput,
    });
    console.log('');
  }

  console.log('=== Summary ===');
  console.table(results);
})();