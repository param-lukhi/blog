import { PrismaClient } from '@prisma/client';
import { getStoreAdapter, storeAdapters, validateAffiliateUrl } from '../lib/stores/adapters';
import { convertCurrency, formatCurrency, SUPPORTED_CURRENCIES } from '../lib/currency';
import { auditContentSEO, getSearchConsoleStatus } from '../lib/seoHealth';
import { getRelatedContent } from '../lib/internalLinks';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function recordTest(category: string, name: string, passed: boolean, details: string) {
  results.push({ category, name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${category}] ${name}: ${details}`);
}

async function runPhase4Verification() {
  console.log('\n======================================================');
  console.log('   BlogWeb904 — PHASE 4 PRODUCTION TEST SUITE');
  console.log('======================================================\n');

  try {
    // 1. Cron & Price Sync Database Model
    const syncLogCount = await prisma.priceSyncLog.count();
    recordTest(
      'Database',
      'PriceSyncLog Model & Table Integrity',
      true,
      `PriceSyncLog table accessible in Neon DB (records count: ${syncLogCount})`
    );

    // 2. Store Adapter Architecture
    const amazon = storeAdapters.amazon;
    const flipkart = storeAdapters.flipkart;
    const croma = storeAdapters.croma;
    const brand = storeAdapters['brand-store'];

    recordTest(
      'Store Adapters',
      'Amazon Adapter Status & Reason',
      amazon.getStatus().status !== undefined,
      `Status: ${amazon.getStatus().status} (${amazon.getStatus().reason || 'Configured'})`
    );

    recordTest(
      'Store Adapters',
      'Flipkart Adapter Status & Reason',
      flipkart.getStatus().status !== undefined,
      `Status: ${flipkart.getStatus().status} (${flipkart.getStatus().reason || 'Configured'})`
    );

    recordTest(
      'Store Adapters',
      'Croma Adapter Status & Reason',
      croma.getStatus().status !== undefined,
      `Status: ${croma.getStatus().status} (${croma.getStatus().reason || 'Configured'})`
    );

    recordTest(
      'Store Adapters',
      'Official Brand Store Adapter',
      brand.getStatus().status === 'SUPPORTED',
      `Status: ${brand.getStatus().status}`
    );

    // 3. Affiliate URL Validation
    const validAmazon = validateAffiliateUrl('https://www.amazon.in/dp/B0B554271R?tag=techpulse-20', 'amazon');
    recordTest(
      'Affiliate',
      'Valid Amazon Tagged URL',
      validAmazon.isValid && validAmazon.hasAffiliateParam,
      `Valid: ${validAmazon.isValid}, Tag: ${validAmazon.affiliateTagFound}`
    );

    const httpAmazon = validateAffiliateUrl('http://www.amazon.in/dp/B0B554271R', 'amazon');
    recordTest(
      'Affiliate',
      'Insecure HTTP URL Rejection',
      !httpAmazon.isValid,
      `Correctly rejected non-HTTPS URL (Reason: ${httpAmazon.reason})`
    );

    const wrongDomain = validateAffiliateUrl('https://evil-site.com/dp/12345?tag=fake', 'amazon');
    recordTest(
      'Affiliate',
      'Domain Mismatch Rejection',
      !wrongDomain.isValid,
      `Correctly rejected domain mismatch (Reason: ${wrongDomain.reason})`
    );

    // 4. Multi-Currency System
    const inrFormatted = formatCurrency(49999, 'INR');
    recordTest(
      'Multi-Currency',
      'INR Currency Formatting',
      inrFormatted.includes('49,999') && inrFormatted.includes('₹'),
      `Formatted: ${inrFormatted}`
    );

    const inrToUsd = convertCurrency(49999, 'INR', 'USD');
    recordTest(
      'Multi-Currency',
      'INR to USD Conversion Calculation',
      Boolean(inrToUsd && inrToUsd.convertedPrice > 0 && inrToUsd.isApproximate),
      `Original: ${inrToUsd?.formattedOriginal} -> Converted: ${inrToUsd?.formattedConverted} (Rate: ${inrToUsd?.rateUsed.toFixed(4)})`
    );

    const originalPricePreserved = inrToUsd?.originalPrice === 49999 && inrToUsd.originalCurrency === 'INR';
    recordTest(
      'Multi-Currency',
      'Original Source Price Preservation',
      originalPricePreserved,
      'Original DB source price & currency are strictly preserved'
    );

    const gbpConversion = convertCurrency(100, 'USD', 'GBP');
    const eurConversion = convertCurrency(100, 'USD', 'EUR');
    recordTest(
      'Multi-Currency',
      'GBP & EUR Support',
      Boolean(gbpConversion && eurConversion),
      `USD 100 -> GBP: ${gbpConversion?.formattedConverted}, EUR: ${eurConversion?.formattedConverted}`
    );

    // 5. SEO Health Audit Engine
    const mockBlogs = [
      {
        id: 'b1',
        title: 'Best Noise Cancelling Headphones 2026',
        slug: 'best-noise-cancelling-headphones-2026',
        metaTitle: 'Best Noise Cancelling Headphones 2026 Review',
        metaDescription: 'Detailed review and buying guide for the top noise cancelling headphones with comparison matrix.',
        content: '# Top ANC Headphones\n\nFull in-depth 2000 word guide with test notes and battery benchmarks...',
        featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        affiliateUrl: 'https://amazon.in/dp/123?tag=techpulse-20',
        status: 'PUBLISHED',
      },
      {
        id: 'b2',
        title: 'Short Draft',
        slug: 'short-draft',
        metaTitle: null,
        metaDescription: null,
        content: 'Thin text under 50 words',
        featuredImage: null,
        status: 'DRAFT',
      },
    ];

    const seoAudit = auditContentSEO(mockBlogs as any, [], []);
    recordTest(
      'SEO Health',
      'Technical SEO Audit Rule Execution',
      seoAudit.issues.length > 0 && seoAudit.overallScore > 0,
      `Checked: ${seoAudit.totalItemsChecked}, Healthy: ${seoAudit.healthyCount}, Issues: ${seoAudit.issues.length}`
    );

    const scStatus = getSearchConsoleStatus();
    recordTest(
      'SEO Health',
      'Google Search Console Status Check',
      scStatus.status === 'NOT_CONFIGURED' || scStatus.status === 'CONNECTED',
      `Search Console Status: ${scStatus.status} (${scStatus.reason || 'Connected'})`
    );

    // 6. Smart Internal Linking
    const related = await getRelatedContent({ limit: 3 });
    recordTest(
      'Internal Linking',
      'Related Content Query Execution',
      Array.isArray(related.relatedBlogs) && Array.isArray(related.relatedProducts),
      `Related blogs found: ${related.relatedBlogs.length}, Products: ${related.relatedProducts.length}`
    );

    // 7. Activity Log Event Types
    const testLog = await prisma.activityLog.create({
      data: {
        action: 'PRICE_CHANGED',
        entity: 'ProductPrice',
        entityId: 'test_price_item',
        summary: 'Unit test price change event',
        metadata: JSON.stringify({ oldPrice: 19999, newPrice: 18999, difference: -1000 }),
      },
    });

    recordTest(
      'Activity Log',
      'PRICE_CHANGED Event Creation',
      testLog.id !== undefined && testLog.action === 'PRICE_CHANGED',
      `Created ActivityLog ID: ${testLog.id}`
    );

    // Clean up test log
    await prisma.activityLog.delete({ where: { id: testLog.id } }).catch(() => {});

    // Summary
    console.log('\n======================================================');
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = total - passed;
    console.log(`PHASE 4 VERIFICATION RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase4Verification();
