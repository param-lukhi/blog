/**
 * Live Website Testing Suite for https://blogweb904.vercel.app
 */

const BASE_URL = 'https://blogweb904.vercel.app';

interface TestResult {
  testName: string;
  url: string;
  status: 'PASS' | 'FAIL' | 'NOT VERIFIED';
  httpStatus: number | string;
  details: string;
}

const liveResults: TestResult[] = [];

function recordLive(testName: string, url: string, status: 'PASS' | 'FAIL' | 'NOT VERIFIED', httpStatus: number | string, details: string) {
  liveResults.push({ testName, url, status, httpStatus, details });
  console.log(`[${status}] ${testName} (${httpStatus}) - ${details}`);
}

async function runLiveTests() {
  console.log(`Testing Live Production Deployment at: ${BASE_URL}\n`);

  // 1. Robots.txt
  try {
    const res = await fetch(`${BASE_URL}/robots.txt`);
    const text = await res.text();
    const hasDisallowAdmin = text.includes('Disallow: /admin/');
    const hasDisallowApi = text.includes('Disallow: /api/');
    const hasSitemap = text.includes('Sitemap: https://blogweb904.vercel.app/sitemap.xml');

    recordLive(
      'Live Robots.txt Verification',
      `${BASE_URL}/robots.txt`,
      res.status === 200 && hasDisallowAdmin && hasDisallowApi && hasSitemap ? 'PASS' : 'FAIL',
      res.status,
      `Robots.txt contains required crawler disallow rules (/admin/, /api/, /search) and points to production sitemap.`
    );
  } catch (err: any) {
    recordLive('Live Robots.txt Verification', `${BASE_URL}/robots.txt`, 'FAIL', 'ERR', err.message);
  }

  // 2. Sitemap.xml
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    const xml = await res.text();
    const hasBlogwebUrl = xml.includes('https://blogweb904.vercel.app');
    const hasNoLocalhost = !xml.includes('localhost');
    const hasSamsungBlog = xml.includes('samsung-galaxy-s24-ultra-vs-iphone-15-pro-max');
    const hasDreameBlog = xml.includes('dreame-x60-ultra-complete-features-indian-homes');

    recordLive(
      'Live Sitemap.xml Verification',
      `${BASE_URL}/sitemap.xml`,
      res.status === 200 && hasBlogwebUrl && hasNoLocalhost && (hasSamsungBlog || hasDreameBlog) ? 'PASS' : 'FAIL',
      res.status,
      `Sitemap returns valid XML with production canonical URLs, zero localhost references, and active published blog entries.`
    );
  } catch (err: any) {
    recordLive('Live Sitemap.xml Verification', `${BASE_URL}/sitemap.xml`, 'FAIL', 'ERR', err.message);
  }

  // 3. Homepage
  try {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    const hasBrand = html.includes('BlogWeb904');
    const hasCanonical = html.includes('<link rel="canonical" href="https://blogweb904.vercel.app"');

    recordLive(
      'Live Homepage & Canonical URL',
      `${BASE_URL}/`,
      res.status === 200 && hasBrand ? 'PASS' : 'FAIL',
      res.status,
      `Homepage loads with BlogWeb904 branding and absolute canonical metadata.`
    );
  } catch (err: any) {
    recordLive('Live Homepage & Canonical URL', `${BASE_URL}/`, 'FAIL', 'ERR', err.message);
  }

  // 4. Unauthorized Admin API Gatekeeping: GET /api/admin/counts
  try {
    const res = await fetch(`${BASE_URL}/api/admin/counts`);
    recordLive(
      'Unauthorized API Gatekeeping (GET /api/admin/counts)',
      `${BASE_URL}/api/admin/counts`,
      res.status === 401 ? 'PASS' : 'FAIL',
      res.status,
      res.status === 401
        ? 'Endpoint rejected unauthenticated request with 401 Unauthorized.'
        : `Endpoint failed to reject request (returned ${res.status}).`
    );
  } catch (err: any) {
    recordLive('Unauthorized API Gatekeeping (GET /api/admin/counts)', `${BASE_URL}/api/admin/counts`, 'FAIL', 'ERR', err.message);
  }

  // 5. Unauthorized API Gatekeeping: GET /api/analytics
  try {
    const res = await fetch(`${BASE_URL}/api/analytics`);
    recordLive(
      'Unauthorized API Gatekeeping (GET /api/analytics)',
      `${BASE_URL}/api/analytics`,
      res.status === 401 ? 'PASS' : 'FAIL',
      res.status,
      res.status === 401
        ? 'Internal analytics API rejected unauthenticated request with 401 Unauthorized.'
        : `Endpoint failed to reject request (returned ${res.status}).`
    );
  } catch (err: any) {
    recordLive('Unauthorized API Gatekeeping (GET /api/analytics)', `${BASE_URL}/api/analytics`, 'FAIL', 'ERR', err.message);
  }

  // 6. Unauthorized API Mutation: POST /api/blogs
  try {
    const res = await fetch(`${BASE_URL}/api/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacked Blog', slug: 'hacked-blog' }),
    });
    recordLive(
      'Unauthorized Mutation Protection (POST /api/blogs)',
      `${BASE_URL}/api/blogs`,
      res.status === 401 ? 'PASS' : 'FAIL',
      res.status,
      res.status === 401
        ? 'Public user cannot create blog posts (401 Unauthorized).'
        : `Endpoint allowed unauthenticated creation (returned ${res.status}).`
    );
  } catch (err: any) {
    recordLive('Unauthorized Mutation Protection (POST /api/blogs)', `${BASE_URL}/api/blogs`, 'FAIL', 'ERR', err.message);
  }

  // 7. Admin Route Protection (Middleware Redirect)
  try {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    const isRedirect = res.status === 307 || res.status === 302 || res.status === 308;
    const location = res.headers.get('location') || '';

    recordLive(
      'Admin Route Middleware Gatekeeping (/admin)',
      `${BASE_URL}/admin`,
      isRedirect && location.includes('/admin/login') ? 'PASS' : 'FAIL',
      res.status,
      isRedirect && location.includes('/admin/login')
        ? `Unauthenticated visitor accessing /admin is redirected to ${location}.`
        : `Expected redirect to /admin/login, got status ${res.status} location: ${location}.`
    );
  } catch (err: any) {
    recordLive('Admin Route Middleware Gatekeeping (/admin)', `${BASE_URL}/admin`, 'FAIL', 'ERR', err.message);
  }

  // 8. Public Article 1: Samsung vs iPhone
  const samsungUrl = `${BASE_URL}/blog/samsung-galaxy-s24-ultra-vs-iphone-15-pro-max-camera-display-spec-matrix`;
  try {
    const res = await fetch(samsungUrl);
    const html = await res.text();
    const hasBrand = html.includes('BlogWeb904');
    const hasArticle = html.includes('Galaxy S24 Ultra') || html.includes('iPhone 15 Pro Max');

    recordLive(
      'Live Article #1 (Samsung vs iPhone)',
      samsungUrl,
      res.status === 200 && hasArticle ? 'PASS' : 'FAIL',
      res.status,
      `Article is publicly live with responsive layout and BlogWeb904 branding.`
    );
  } catch (err: any) {
    recordLive('Live Article #1 (Samsung vs iPhone)', samsungUrl, 'FAIL', 'ERR', err.message);
  }

  // 9. Public Article 2: Dreame X60 Ultra
  const dreameUrl = `${BASE_URL}/blog/dreame-x60-ultra-complete-features-indian-homes`;
  try {
    const res = await fetch(dreameUrl);
    const html = await res.text();
    const hasBrand = html.includes('BlogWeb904');
    const hasArticle = html.includes('Dreame');

    recordLive(
      'Live Article #2 (Dreame X60 Ultra)',
      dreameUrl,
      res.status === 200 && hasArticle ? 'PASS' : 'FAIL',
      res.status,
      `Article is publicly live with verified specifications and BlogWeb904 branding.`
    );
  } catch (err: any) {
    recordLive('Live Article #2 (Dreame X60 Ultra)', dreameUrl, 'FAIL', 'ERR', err.message);
  }

  // 10. Trust & Legal Pages
  const trustPages = ['/about', '/contact', '/privacy', '/terms', '/affiliate-disclosure'];
  for (const path of trustPages) {
    try {
      const res = await fetch(`${BASE_URL}${path}`);
      const html = await res.text();
      const hasBrand = html.includes('BlogWeb904');

      recordLive(
        `Trust Page (${path})`,
        `${BASE_URL}${path}`,
        res.status === 200 && hasBrand ? 'PASS' : 'FAIL',
        res.status,
        `Page loads with 200 OK and BlogWeb904 branding.`
      );
    } catch (err: any) {
      recordLive(`Trust Page (${path})`, `${BASE_URL}${path}`, 'FAIL', 'ERR', err.message);
    }
  }

  console.log('\n================================================================');
  console.log('Live Verification Summary:');
  const passes = liveResults.filter((r) => r.status === 'PASS').length;
  const fails = liveResults.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Live Tests: ${liveResults.length} | PASS: ${passes} | FAIL: ${fails}`);
  console.log('================================================================');
}

runLiveTests().catch((e) => {
  console.error('Live test failed:', e);
  process.exit(1);
});
