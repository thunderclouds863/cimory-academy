import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:4000';

export function setup() {
  const res = http.post(`${BASE_URL}/api/v2/auth/login`, JSON.stringify({
    email: 'demo@cimory.com',
    password: 'demo123',
  }), { headers: { 'Content-Type': 'application/json' } });
  
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed: ${res.status}`);
  }
  console.log('[SETUP] ✅ Login OK');
  return { token: res.json('token') };
}

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  const res = http.get(`${BASE_URL}/api/v2/health`, { headers });
  check(res, { 'health 200': (r) => r.status === 200 });
  sleep(1);
}