import { createSessionToken, verifySessionToken, verifySessionTokenEdge } from '../lib/auth';
import { checkRateLimit } from '../lib/rate-limit';
import { validateMediaFile } from '../lib/storage';

async function runSecurityTests() {
  console.log('==============================================');
  console.log('🛡️  BLOGWEB904 PHASE 1 SECURITY VERIFICATION');
  console.log('==============================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Session Token Tests
  const testUser = { id: 'admin-123', email: 'admin@blogweb904.com', role: 'ADMIN' };
  const validToken = createSessionToken(testUser);

  assert(typeof validToken === 'string' && validToken.includes('.'), 'Generates HMAC signed session token');

  const verifiedNode = verifySessionToken(validToken);
  assert(verifiedNode !== null && verifiedNode.email === testUser.email && verifiedNode.role === 'ADMIN', 'Node HMAC token verification succeeds for valid token');

  const verifiedEdge = await verifySessionTokenEdge(validToken);
  assert(verifiedEdge !== null && verifiedEdge.email === testUser.email && verifiedEdge.role === 'ADMIN', 'Edge WebCrypto HMAC token verification succeeds');

  // 2. Blacklist & Legacy Bypass Token Tests
  assert(verifySessionToken('authenticated_token_secret') === null, 'Node rejects legacy "authenticated_token_secret" token');
  assert(await verifySessionTokenEdge('authenticated_token_secret') === null, 'Edge rejects legacy "authenticated_token_secret" token');
  assert(verifySessionToken('techpulse_secure_session_key_2026') === null, 'Node rejects legacy "techpulse_secure_session_key_2026" token');
  assert(await verifySessionTokenEdge('techpulse_secure_session_key_2026') === null, 'Edge rejects legacy "techpulse_secure_session_key_2026" token');
  assert(verifySessionToken('admin') === null, 'Node rejects simple string "admin"');
  assert(verifySessionToken('random.fake_signature') === null, 'Node rejects tampered signature');

  // 3. Rate Limiter Tests
  const testIp = '192.168.1.99';
  const r1 = checkRateLimit(`test_${testIp}`, 3, 60);
  const r2 = checkRateLimit(`test_${testIp}`, 3, 60);
  const r3 = checkRateLimit(`test_${testIp}`, 3, 60);
  const r4 = checkRateLimit(`test_${testIp}`, 3, 60);

  assert(r1.allowed && r2.allowed && r3.allowed, 'Rate limiter allows requests under threshold (3/3)');
  assert(!r4.allowed && r4.remaining === 0, 'Rate limiter strictly blocks 4th request when limit is 3');

  // 4. Media File Validation Tests
  const validImage = { size: 1024 * 100, type: 'image/webp', name: 'photo.webp' };
  const oversizedFile = { size: 10 * 1024 * 1024, type: 'image/jpeg', name: 'large.jpg' };
  const dangerousFile = { size: 1024, type: 'application/x-msdownload', name: 'virus.exe' };

  assert(validateMediaFile(validImage).valid === true, 'Accepts valid WebP image under 5MB');
  assert(validateMediaFile(oversizedFile).valid === false, 'Rejects oversized file (> 5MB)');
  assert(validateMediaFile(dangerousFile).valid === false, 'Rejects dangerous executable/unsupported MIME type');

  console.log('\n==============================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('==============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runSecurityTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
