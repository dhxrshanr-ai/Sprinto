/**
 * Basic API integration tests
 * Run with: npm test
 */

const http = require('http');

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

async function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            method,
            hostname: 'localhost',
            port: process.env.PORT || 5000,
            path,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
            },
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

let passed = 0, failed = 0;

async function test(name, fn) {
    try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ❌ ${name}: ${err.message}`);
        failed++;
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

(async () => {
    console.log('\n── Sprinto API Tests ──────────────────────\n');

    // Health
    await test('GET /api/health returns 200', async () => {
        const res = await request('GET', '/api/health');
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(res.body.status === 'ok', 'Status field should be ok');
    });

    // Auth
    const testEmail   = `test_${Date.now()}@Sprinto.test`;
    const testPassword = 'password123';
    let token;

    await test('POST /api/auth/register creates account', async () => {
        const res = await request('POST', '/api/auth/register', {
            name: 'Test User', email: testEmail, password: testPassword
        });
        assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
        assert(res.body.token, 'Token should be returned');
        token = res.body.token;
    });

    await test('POST /api/auth/register rejects duplicate', async () => {
        const res = await request('POST', '/api/auth/register', {
            name: 'Test User', email: testEmail, password: testPassword
        });
        assert(res.status === 400, `Expected 400, got ${res.status}`);
    });

    await test('POST /api/auth/login returns token', async () => {
        const res = await request('POST', '/api/auth/login', {
            email: testEmail, password: testPassword
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(res.body.token, 'Token should be returned');
    });

    await test('POST /api/auth/login rejects bad credentials', async () => {
        const res = await request('POST', '/api/auth/login', {
            email: testEmail, password: 'wrongpassword'
        });
        assert(res.status === 401, `Expected 401, got ${res.status}`);
    });

    await test('GET /api/auth/me returns profile (authenticated)', async () => {
        const res = await request('GET', '/api/auth/me', null, token);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(res.body.email === testEmail, 'Email should match');
    });

    await test('GET /api/auth/me returns 401 without token', async () => {
        const res = await request('GET', '/api/auth/me');
        assert(res.status === 401, `Expected 401, got ${res.status}`);
    });

    // Projects
    let projectId;
    await test('POST /api/projects creates project', async () => {
        const res = await request('POST', '/api/projects', { name: 'CI Test Project', description: 'Test' }, token);
        assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
        projectId = res.body._id;
    });

    await test('GET /api/projects returns list', async () => {
        const res = await request('GET', '/api/projects', null, token);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(Array.isArray(res.body), 'Should return array');
    });

    // Tasks
    await test('POST /api/tasks creates task', async () => {
        const res = await request('POST', '/api/tasks', {
            title: 'Test Task', project: projectId, column: 'To Do', priority: 'medium'
        }, token);
        assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    });

    await test('GET /api/tasks?project= returns tasks', async () => {
        const res = await request('GET', `/api/tasks?project=${projectId}`, null, token);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(Array.isArray(res.body), 'Should return array');
    });

    // Cleanup
    await test('DELETE /api/projects/:id deletes project', async () => {
        const res = await request('DELETE', `/api/projects/${projectId}`, null, token);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
    });

    console.log(`\n── Results: ${passed} passed, ${failed} failed ──\n`);
    process.exit(failed > 0 ? 1 : 0);
})();
