require('dotenv').config();
const BASE = 'http://127.0.0.1:5000/api';

async function tryFetch(url, opts) {
  try { return await fetch(url, opts); } catch (e) { console.log('FETCH ERR', e.cause?.code || e.message); return tryFetch(url, opts); }
}

(async () => {
  const loginRes = await tryFetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'noman@gmail.com', password: '123456' }),
  });
  const login = await loginRes.json();
  if (!login.token) { console.log('LOGIN FAIL:', JSON.stringify(login)); return; }
  console.log('LOGIN OK, role:', login.user?.role);
  const headers = { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' };

  const sub = await tryFetch(`${BASE}/welfare`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type: 'fee', reason: 'Test request from script', amountRequested: 2500 }),
  });
  const subData = await sub.json();
  console.log('SUBMIT', sub.status, subData._id || JSON.stringify(subData));

  const mine = await tryFetch(`${BASE}/welfare/mine`, { headers });
  const mineData = await mine.json();
  console.log('MINE', mine.status, 'count:', Array.isArray(mineData) ? mineData.length : JSON.stringify(mineData));
  if (Array.isArray(mineData)) mineData.slice(0, 3).forEach((r) => console.log(' -', r.type, r.amountRequested, r.status));
})();
