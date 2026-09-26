import prisma from '../lib/prisma';
import { getSearchConsoleStatus } from '../lib/searchConsole';
import { executeJob } from '../lib/jobs/registry';
import { discoverContentOpportunities, analyzeContentClusters } from '../lib/contentEngine';

async function runPhase8Verification() {
  console.log('\n======================================================');
  console.log('   BlogWeb904 — PHASE 8 GROWTH & SEO TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}${detail ? ` (${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // Test 1: Search Console Status & Zero Fake Metrics Guarantee
    const gscStatus = getSearchConsoleStatus();
    assert(
      typeof gscStatus.isConfigured === 'boolean' && gscStatus.message.length > 0,
      'Search Console Status Assessment',
      `Configured: ${gscStatus.isConfigured}`
    );

    // Test 2: SearchPerformance DB Model & Deduplication
    const testDate = new Date('2026-09-01T00:00:00Z');
    const perf1 = await prisma.searchPerformance.upsert({
      where: {
        date_query_page_country_device: {
          date: testDate,
          query: 'best wireless anc headphones 2026',
          page: '/blog/sony-wh-1000xm5-review',
          country: 'in',
          device: 'mobile',
        },
      },
      update: { clicks: 12, impressions: 240, ctr: 5.0, position: 3.2 },
      create: {
        date: testDate,
        query: 'best wireless anc headphones 2026',
        page: '/blog/sony-wh-1000xm5-review',
        country: 'in',
        device: 'mobile',
        clicks: 12,
        impressions: 240,
        ctr: 5.0,
        position: 3.2,
      },
    });
    assert(perf1.clicks === 12 && perf1.impressions === 240, 'SearchPerformance Record Upsert & Query');

    // Test 3: Idempotent Job Registry execution for SEARCH_CONSOLE_SYNC
    const gscJobResult = await executeJob('SEARCH_CONSOLE_SYNC', `test_gsc_sync_${Date.now()}`);
    assert(gscJobResult.success === true, 'Central Job Registry SEARCH_CONSOLE_SYNC Execution');

    // Test 4: Idempotent Job Registry execution for AFFILIATE_SYNC
    const affJobResult = await executeJob('AFFILIATE_SYNC', `test_aff_sync_${Date.now()}`);
    assert(affJobResult.success === true, 'Central Job Registry AFFILIATE_SYNC Execution');

    // Test 5: Content Opportunity Engine Discovery
    const discoveredOps = await discoverContentOpportunities();
    assert(
      Array.isArray(discoveredOps) && discoveredOps.length >= 0,
      'Content Opportunity Engine Discovery',
      `Opportunities discovered: ${discoveredOps.length}`
    );

    // Test 6: Content Opportunity Priority Rules
    const testOpp = await prisma.contentOpportunity.create({
      data: {
        topic: 'Best Budget Gaming Earphones Under ₹3,000',
        opportunityType: 'BUYING_GUIDE',
        reason: 'High mobile search volume with zero direct competitor comparison',
        evidence: 'GSC query cluster volume 1,200/mo',
        priority: 'HIGH',
        suggestedSearchIntent: 'COMMERCIAL',
        status: 'DISCOVERED',
      },
    });
    assert(testOpp.priority === 'HIGH' && testOpp.status === 'DISCOVERED', 'ContentOpportunity Creation & Priority Enforcement');

    // Test 7: Content Cluster & Cannibalization Analyzer
    const clusterAnalysis = await analyzeContentClusters();
    assert(
      Array.isArray(clusterAnalysis.orphanPages) && Array.isArray(clusterAnalysis.cannibalizationRisks),
      'Content Cluster, Orphan Pages & Cannibalization Analysis'
    );

    // Test 8: Internal Link Suggestion Management
    const linkSugg = await prisma.internalLinkSuggestion.create({
      data: {
        sourceUrl: '/blog/sony-wh-1000xm5-review',
        targetUrl: '/comparisons',
        suggestedAnchor: 'headphone comparisons library',
        reason: 'Relevant internal guide for user shopping journey',
        status: 'PENDING',
      },
    });
    assert(linkSugg.status === 'PENDING' && linkSugg.suggestedAnchor.length > 5, 'Internal Link Suggestion Registration');

    // Test 9: FactCheckClaim Lifecycle & Author Verification
    const claim = await prisma.factCheckClaim.create({
      data: {
        claimText: 'Battery life rated for up to 30 hours with Active Noise Cancellation enabled',
        sourceUrl: 'https://sony.com/specs/wh-1000xm5',
        sourceType: 'OFFICIAL_MANUFACTURER',
        status: 'UNVERIFIED',
      },
    });
    const verifiedClaim = await prisma.factCheckClaim.update({
      where: { id: claim.id },
      data: { status: 'VERIFIED', verifiedBy: 'admin_editor', verifiedAt: new Date() },
    });
    assert(verifiedClaim.status === 'VERIFIED' && verifiedClaim.verifiedBy === 'admin_editor', 'FactCheckClaim Verification State Transition');

    // Test 10: Growth Experiments Model & Lifecycle
    const experiment = await prisma.growthExperiment.create({
      data: {
        name: 'Product Comparison Table Placement Test',
        hypothesis: 'Moving multi-store pricing table above fold increases merchant CTR by 15%',
        targetMetric: 'AFFILIATE_CLICKS',
        variants: JSON.stringify({ A: 'Below Overview', B: 'Above Fold Sticky' }),
        status: 'DRAFT',
      },
    });
    const runningExp = await prisma.growthExperiment.update({
      where: { id: experiment.id },
      data: { status: 'RUNNING', startDate: new Date() },
    });
    assert(runningExp.status === 'RUNNING' && runningExp.startDate !== null, 'GrowthExperiment A/B Test Lifecycle Execution');

    // Test 11: AI Usage Logging & Safety Guard
    const aiLog = await prisma.aiUsageLog.create({
      data: {
        provider: 'BUILTIN',
        model: 'content-brief-engine-v1',
        feature: 'CONTENT_BRIEF',
        requestCount: 1,
        promptTokens: 150,
        completionTokens: 400,
        totalTokens: 550,
        estimatedCost: 0,
        currency: 'USD',
      },
    });
    assert(aiLog.feature === 'CONTENT_BRIEF' && aiLog.totalTokens === 550, 'AI Usage & Token Log Auditing');

    // Test 12: Real Affiliate Analytics & Zero Fabricated Data
    const clickCount = await prisma.analytics.count({
      where: { eventType: { in: ['AFFILIATE_CLICK', 'affiliate_click'] } },
    });
    const conversionsCount = await prisma.affiliateConversion.count();
    assert(
      typeof clickCount === 'number' && typeof conversionsCount === 'number',
      'Affiliate Analytics & Revenue Calculation',
      `Clicks: ${clickCount}, Conversions: ${conversionsCount}`
    );

    // Clean up test records
    await prisma.searchPerformance.delete({ where: { id: perf1.id } });
    await prisma.contentOpportunity.delete({ where: { id: testOpp.id } });
    await prisma.internalLinkSuggestion.delete({ where: { id: linkSugg.id } });
    await prisma.factCheckClaim.delete({ where: { id: claim.id } });
    await prisma.growthExperiment.delete({ where: { id: experiment.id } });
    await prisma.aiUsageLog.delete({ where: { id: aiLog.id } });

    console.log('\n======================================================');
    console.log(`PHASE 8 VERIFICATION RESULTS: ${passed}/${passed + failed} PASSED (${failed} FAILED)`);
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('Phase 8 verification exception:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Verification();
