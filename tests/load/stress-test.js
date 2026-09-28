import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE_URL = 'http://localhost:4000';

// ============================================================
// SETUP: Login dengan retry
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

    if (res.status === 200 || res.status === 201) break;
    console.log(`[SETUP] Attempt ${i + 1} failed: ${res.status}. Retrying in 2s...`);
    sleep(2);
  }

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed after 3 attempts: ${res.status} - ${res.body}`);
  }

  const token = res.json('token');
  console.log(`[SETUP] ✅ Login OK (status ${res.status})`);
  return { token };
}

// ============================================================
// OPTIONS: Stress test scenario
// Ramp up 100 → 300 → 500 → 1000 VU
// ============================================================
export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },   // 0 → 100
        { duration: '2m', target: 300 },   // 100 → 300
        { duration: '2m', target: 500 },   // 300 → 500
        { duration: '2m', target: 1000 },  // 500 → 1000
        { duration: '1m', target: 0 },     // turun
      ],
      gracefulRampDown: '30s',
    },
  },
  // Threshold dilonggarin — stress test SENGAJA bikin error
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 2 detik (longgar)
    http_req_failed: ['rate<0.10'],    // toleransi 10% error
  },
};

// ============================================================
// DEFAULT: Test scenario
// ============================================================
export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // 1. HEALTH
  group('health', () => {
    const res = http.get(`${BASE_URL}/api/v2/health`, { headers });
    check(res, { 'health 200': (r) => r.status === 200 });
  });

  // 2. AUTH ME
  group('auth-me', () => {
    const res = http.get(`${BASE_URL}/api/v2/auth/me`, { headers });
    check(res, { 'me 200': (r) => r.status === 200 });
  });

  // 3. CHAPTERS (query DB)
  group('chapters', () => {
    const res = http.get(`${BASE_URL}/api/v2/chapters`, { headers });
    check(res, { 'chapters 200': (r) => r.status === 200 });
  });

  // 4. PROGRESS (Express legacy)
  group('progress', () => {
    const res = http.get(`${BASE_URL}/api/progress/me`, { headers });
    check(res, { 'progress 200': (r) => r.status === 200 });
  });

  // Sleep lebih pendek biar beban tinggi
  sleep(0.5 + Math.random() * 1);
}