import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = (__ENV.K6_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

// Small set of representative endpoints (keep it stable for reporting)
const publicPaths = new SharedArray('publicPaths', () => [
  '/health',
  '/common/announcements',
  '/common/service-types',
]);

export const options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: __ENV.K6_RAMP_UP || '20s', target: Number(__ENV.K6_VUS || 20) },
        { duration: __ENV.K6_STEADY || '40s', target: Number(__ENV.K6_VUS || 20) },
        { duration: __ENV.K6_RAMP_DOWN || '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: [
      'p(90)<600',
      'p(95)<900',
      'p(99)<1500',
    ],
  },
};

export default function () {
  const idx = Math.floor(Math.random() * publicPaths.length);
  const url = `${BASE_URL}${publicPaths[idx]}`;
  const res = http.get(url);

  check(res, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
  });

  sleep(Number(__ENV.K6_SLEEP || 0.2));
}

