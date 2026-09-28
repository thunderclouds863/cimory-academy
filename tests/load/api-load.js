import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE_URL = 'http://localhost:4000';

// ============================================================
// SETUP: Login dengan retry, terima 200 atau 201
// ============================================================
export function setup() {
  console.log('[SETUP] Login attempt...');

  let res;
  for (let i = 0; i < 3; i++) {
    res = http.post(`${BASE_URL}/api/v2/auth/login`, JSON.stringify({
      email: 'demo@cimory.com',
      password: 'demo123',
    }), {
      headers: { 'Content-Type': 'application/json' },
      timeout: '30s',
    });

    // Terima 200 OK atau 201 Created
    if (res.status === 200 || res.status === 201) break;

    console.log(`[SETUP] Attempt ${i + 1} failed: ${res.status}. Retrying in 2s...`);
    sleep(2);
  }

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed after 3 attempts: ${res.status} - ${res.body}`);
  }

  const token = res.json('token');
  console.log(`[SETUP] ✅ Login OK (status ${res.status}), token: ${token.substring(0, 20)}...`);
  return { token };
}

// ============================================================
// OPTIONS: Load test scenario + thresholds
// ============================================================
export const options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },   // ramp up ke 50 user
        { duration: '1m', target: 50 },    // stabil 1 menit
        { duration: '30s', target: 0 },    // ramp down
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

// ============================================================
// DEFAULT: Test scenario per VU
// ============================================================
export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // 1. HEALTH — NestJS v2 (GET)
  group('health', () => {
    const res = http.get(`${BASE_URL}/api/v2/health`, { headers });
    check(res, {
      'health 200': (r) => r.status === 200,
    });
    sleep(1 + Math.random() * 2);
  });

  // 2. AUTH ME — NestJS v2 (GET)
  group('auth-me', () => {
    const res = http.get(`${BASE_URL}/api/v2/auth/me`, { headers });
    check(res, {
      'me 200': (r) => r.status === 200,
    });
    sleep(1 + Math.random() * 2);
  });

  // 3. CHAPTERS — NestJS v2 (GET)
  group('chapters', () => {
    const res = http.get(`${BASE_URL}/api/v2/chapters`, { headers });
    check(res, {
      'chapters 200': (r) => r.status === 200,
      'has data': (r) => Array.isArray(r.json()),
    });
    sleep(1 + Math.random() * 2);
  });

  // 4. PRESIGN — NestJS v2 (POST, return 201)
  group('presign', () => {
    const payload = JSON.stringify({
      filename: 'test.mp4',
      contentType: 'video/mp4',
    });
    const res = http.post(`${BASE_URL}/api/v2/storage/presign`, payload, { headers });
    check(res, {
      'presign 200/201': (r) => r.status === 200 || r.status === 201,
      'has uploadUrl': (r) => {
        try { return !!r.json('uploadUrl'); } catch { return false; }
      },
    });
    sleep(1 + Math.random() * 2);
  });

  // 5. PROGRESS — Express legacy (GET)
  group('progress', () => {
    const res = http.get(`${BASE_URL}/api/progress/me`, { headers });
    check(res, {
      'progress 200': (r) => r.status === 200,
    });
    sleep(1 + Math.random() * 2);
  });
}