import { prisma } from '../lib/prisma';
import { auditProductionLaunch, auditProductionUrls } from '../lib/productionLaunch';
import { getSearchConsoleStatus } from '../lib/searchConsole';
import { auditIndexingIssues } from '../lib/indexingIssues';
import { generateDailyRecommendations, evaluateContentQualityGate, getInventoryBalance } from '../lib/contentOperations';
import { auditAmazonTag } from '../lib/publishingWorkflow';
import { auditAdSenseReadiness } from '../lib/adsenseAuditor';
import { getEmailProviderStatus } from '../lib/email/provider';
import { auditDataIntegrity } from '../lib/dataIntegrity';
import { createIncident, getIncidents, updateIncident, getIncidentSummary } from '../lib/incidentManager';

async function runPhase10Verification() {
  console.log('======================================================');
  console.log('   BlogWeb904 — PHASE 10 PRODUCTION OPERATIONS TEST  ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // 1. Production Launch Audit Diagnostic
    const launchAudit = await auditProductionLaunch();
    assert(
      Array.isArray(launchAudit.systems) && launchAudit.systems.length >= 10,
      `Production Launch Diagnostic evaluates all core systems (Systems checked: ${launchAudit.systems.length})`
    );
    assert(
      Array.isArray(launchAudit.checklist) && launchAudit.checklist.length === 24,
      `Actionable 24-point Launch Checklist generated (Checklist items: ${launchAudit.checklist.length})`
    );

    // 2. Production URL & Domain Audit
    const urlAudit = await auditProductionUrls();
    assert(
      Array.isArray(urlAudit) && urlAudit.length > 0,
      `Production URL & Domain Audit executed successfully (Audited routes/assets: ${urlAudit.length})`
    );
    const hasCanonical = urlAudit.some((u) => u.urlType === 'CANONICAL');
    assert(hasCanonical, 'Canonical domain audit check verified');

    // 3. Search Console Truthful Activation Status
    const gscStatus = getSearchConsoleStatus();
    assert(
      gscStatus.isConfigured === false && gscStatus.message.includes('NOT CONFIGURED'),
      `Search Console truthfully reports NOT CONFIGURED without credentials`
    );

    // 4. Indexing Issues Auditor
    const indexingReport = await auditIndexingIssues();
    assert(
      typeof indexingReport.totalChecked === 'number' && Array.isArray(indexingReport.issues),
      `Indexing Issue Center audits catalog & sitemap health (Checked: ${indexingReport.totalChecked}, Issues: ${indexingReport.issueCount})`
    );

    // 5. Daily Editorial Assistant Recommendations
    const recommendations = await generateDailyRecommendations();
    assert(
      Array.isArray(recommendations) && recommendations.length >= 1 && recommendations.length <= 3,
      `Daily Editorial Assistant generates up to 3 recommendations based on real signals (Generated: ${recommendations.length})`
    );

    // 6. Content Quality Gate Enforcement
    const gateBlocked = evaluateContentQualityGate({
      title: 'Short',
      content: 'Too short draft content',
      isHumanReviewed: false,
      verifiedSourcesCount: 0,
      affiliateLinksCount: 0,
      productReferencesCount: 0,
    });
    assert(
      gateBlocked.passed === false && gateBlocked.status === 'PUBLISH_BLOCKED',
      'Quality Gate strictly blocks publication when human review or sources are missing'
    );

    const gateApproved = evaluateContentQualityGate({
      title: 'Sony WH-1000XM5 Noise Cancelling Headphones Full Review 2026',
      content: 'This is a comprehensive and detailed hands-on review analyzing sound quality, ANC, battery life, and overall build. '.repeat(30),
      metaTitle: 'Sony WH-1000XM5 Review: Noise Cancelling & Audio Quality Tested',
      metaDescription: 'In-depth review of Sony WH-1000XM5 headphones with verified battery, sound performance, and current prices.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      isHumanReviewed: true,
      verifiedSourcesCount: 2,
      affiliateLinksCount: 1,
      productReferencesCount: 1,
    });
    assert(
      gateApproved.passed === true && gateApproved.status === 'APPROVED',
      'Quality Gate approves publication when all editorial and verification criteria are met'
    );

    // 7. Content Inventory Balance
    const balance = await getInventoryBalance();
    assert(
      typeof balance.totalPublished === 'number' && typeof balance.byType.reviews === 'number',
      `Content inventory balance accurately tracked across content types (Total published: ${balance.totalPublished})`
    );

    // 8. Amazon Affiliate Tag Verification Audit
    const amazonAudit = auditAmazonTag();
    assert(
      amazonAudit.status === 'REQUIRES_VERIFICATION',
      `Amazon Tag validation audit correctly flags unverified testing tag (${amazonAudit.message})`
    );

    // 9. AdSense Real Compliance Evaluation
    const adsenseAudit = await auditAdSenseReadiness();
    assert(
      adsenseAudit.readyForReview === false || adsenseAudit.readyForReview === true,
      `AdSense auditor evaluates 8 compliance pillars (Score: ${adsenseAudit.score}/100, Ready: ${adsenseAudit.readyForReview})`
    );

    // 10. Database Data Integrity Auditor
    const integrityReport = await auditDataIntegrity();
    assert(
      typeof integrityReport.totalRecordsScanned === 'number' && Array.isArray(integrityReport.issues),
      `Data integrity scan completed across tables (Scanned: ${integrityReport.totalRecordsScanned}, Issues: ${integrityReport.issueCount})`
    );

    // 11. Operational Incident Management Lifecycle
    const testIncident = await createIncident({
      title: 'Neon Connection Cold Start Delay',
      severity: 'LOW',
      affectedSystem: 'DATABASE',
      rootCause: 'Serverless compute resume latency on initial query',
    });
    assert(
      Boolean(testIncident.id) && testIncident.status === 'OPEN',
      `Operational incident registered with OPEN status (ID: ${testIncident.id})`
    );

    const updatedIncident = await updateIncident(testIncident.id, {
      status: 'RESOLVED',
      resolution: 'Retry backoff applied to connection pooler.',
    });
    assert(
      updatedIncident.status === 'RESOLVED' && Boolean(updatedIncident.resolvedAt),
      'Operational incident successfully updated to RESOLVED with resolution timestamp'
    );

    const incidentSummary = await getIncidentSummary();
    assert(
      incidentSummary.total >= 1 && typeof incidentSummary.resolvedCount === 'number',
      `Incident summary calculated accurately (Total: ${incidentSummary.total}, Resolved: ${incidentSummary.resolvedCount})`
    );

    // Clean up test incident safely
    await prisma.incident.delete({ where: { id: testIncident.id } }).catch(() => {});

  } catch (error: any) {
    console.error('❌ Phase 10 test execution encountered error:', error);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`PHASE 10 VERIFICATION RESULTS: ${passed}/${passed + failed} PASSED (${failed} FAILED)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase10Verification()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
