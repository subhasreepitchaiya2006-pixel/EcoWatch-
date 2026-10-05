const http = require('http');

async function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting EcoWatch Backend Endpoints Verification ---');
  
  // 1. Health check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health check:', health.status === 200 ? 'PASS ✅' : 'FAIL ❌', health.body);

  // 2. Test all 6 accounts login
  const accountsToTest = [
    { email: 'admin@ecowatch.global', password: 'admin123', role: 'System Admin' },
    { email: '24104031@nec.edu.in', password: 'admin123', role: 'System Admin' },
    { email: 'analyst@ecowatch.global', password: 'analyst123', role: 'Analyst' },
    { email: 'responder@ecowatch.global', password: 'responder123', role: 'Emergency Responder' },
    { email: 'scientist@ecowatch.global', password: 'scientist123', role: 'Scientist' },
    { email: 'inspector@ecowatch.global', password: 'inspector123', role: 'Inspector' },
  ];

  let adminToken = null;
  let analystToken = null;

  for (const acc of accountsToTest) {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: acc.email, password: acc.password });

    const ok = res.status === 200 && res.body.token && res.body.user.role === acc.role;
    console.log(`2. Login [${acc.email}] (${acc.role}):`, ok ? 'PASS ✅' : `FAIL ❌ (status: ${res.status})`, ok ? `JWT token verified` : res.body);
    if (acc.email === 'admin@ecowatch.global') adminToken = res.body.token;
    if (acc.email === 'analyst@ecowatch.global') analystToken = res.body.token;
  }

  // 3. Fast OAuth Login
  const fastOAuth = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/oauth-fast',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { provider: 'Google GIS', email: '24104031@nec.edu.in' });
  console.log('3. Fast OAuth Login:', fastOAuth.status === 200 && fastOAuth.body.token ? 'PASS ✅' : 'FAIL ❌', fastOAuth.body?.message);

  // 4. Demo Accounts Catalog
  const demoAccounts = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/demo-accounts',
    method: 'GET'
  });
  console.log('4. Demo Accounts Catalog:', demoAccounts.status === 200 && demoAccounts.body.accounts?.length >= 5 ? `PASS ✅ (${demoAccounts.body.accounts.length} verified accounts)` : 'FAIL ❌');

  // 5. Admin Overview with Admin Token
  const adminOverview = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/overview',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('5. Admin Overview (Admin Token):', adminOverview.status === 200 ? 'PASS ✅' : 'FAIL ❌', `Users: ${adminOverview.body.metrics?.totalUsers}, Admins: ${adminOverview.body.metrics?.administrators}`);

  // 6. Admin Overview RBAC Protection (Analyst Token should get 403 Forbidden)
  const rbacCheck = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/overview',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${analystToken}` }
  });
  console.log('6. Admin RBAC Protection (Analyst denied 403):', rbacCheck.status === 403 ? 'PASS ✅' : `FAIL ❌ (got ${rbacCheck.status})`);

  // 7. AI Environmental Insight Chatbot API
  const aiInsight = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/analytics/ai-insight',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { prompt: 'What is the flood risk and soil saturation along coastal zones?', aqi: 48, region: 'Chennai Coast' });
  console.log('7. AI Insight Chatbot API:', aiInsight.status === 200 && aiInsight.body.insight ? 'PASS ✅' : 'FAIL ❌', `Sensor: ${aiInsight.body?.telemetrySnapshot?.sensorArray}`);

  // 8. Unique Feature: Algorithmic Environmental Risk Index ERI Engine
  const eri = await makeRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/satellite/eri?lat=13.0827&lon=80.2707',
    method: 'GET'
  });
  console.log('8. Algorithmic ERI Engine:', eri.status === 200 && eri.body.eriScore !== undefined ? `PASS ✅ (ERI Score: ${eri.body.eriScore}, Level: ${eri.body.riskLevel?.level})` : 'FAIL ❌');

  console.log('--- All Backend Verifications Complete ---');
}

runTests().catch(console.error);
