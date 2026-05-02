import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.K6_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

export const options = {
  vus: 50,
  duration: __ENV.K6_DURATION || '15s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

function jsonHeaders(extra = {}) {
  return { headers: { 'Content-Type': 'application/json', ...extra } };
}

function maybeLogin() {
  const email = __ENV.PERF_EMAIL;
  const password = __ENV.PERF_PASSWORD;
  if (!email || !password) return null;

  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password }),
    jsonHeaders()
  );

  check(res, { 'login status is 200': (r) => r.status === 200 });
  if (res.status !== 200) return null;

  const body = res.json();
  return body?.accessToken || null;
}

export default function () {
  // Basic health check (always available)
  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    'health status is 200': (r) => r.status === 200,
    'health json has status ok': (r) => r.json('status') === 'ok',
  });

  // Public pages citizens see
  const announcements = http.get(`${BASE_URL}/common/announcements`);
  check(announcements, { 'announcements status is 200': (r) => r.status === 200 });

  const serviceTypes = http.get(`${BASE_URL}/common/service-types`);
  check(serviceTypes, { 'service-types status is 200': (r) => r.status === 200 });

  // Optional authenticated check (only if PERF_EMAIL/PERF_PASSWORD are set)
  const token = maybeLogin();
  if (token) {
    const notif = http.get(`${BASE_URL}/citizen/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    check(notif, { 'notifications status is 200/401': (r) => r.status === 200 || r.status === 401 });
  }

  sleep(1);
}

