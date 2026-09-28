import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE_URL = 'http://localhost:4000';

export function setup() {
  let res;
  for (let i = 0; i < 3; i++) {
    res = http.post(`${BASE_URL}/api/v2/auth/login`, JSON.stringify({
      email: 'demo@cimory.com',
      password: 'demo123',
    }), { headers: { 'Content-Type': 'application/json' }, timeout: '30s' });
    if (res.status === 200 || res.status === 201) break;
    sleep(2);
  }
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed: ${res.status}`);
  }
  console.log(`[SETUP] ✅ Login OK`);
  return { token: res.json('token') };
}

export const options = {
  scenarios: {
    soak: {
      executor: 'constant-vus',
      vus: 500,           // 500 user konstan
      duration: '1h',     // 1 jam
      gracefulStop: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // konsisten < 2s
    http_req_failed: ['rate<0.01'],     // error < 1%
  },
};

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  group('health', () => {
    const res = http.get(`${BASE_URL}/api/v2/health`, { headers });
    check(res, { 'health 200': (r) => r.status === 200 });
  });

  group('chapters', () => {
    const res = http.get(`${BASE_URL}/api/v2/chapters`, { headers });
    check(res, { 'chapters 200': (r) => r.status === 200 });
  });

  group('progress', () => {
    const res = http.get(`${BASE_URL}/api/progress/me`, { headers });
    check(res, { 'progress 200': (r) => r.status === 200 });
  });

  sleep(1 + Math.random() * 2);
}