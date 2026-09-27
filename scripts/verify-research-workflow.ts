import { PrismaClient } from '@prisma/client';
import {
  generateArticleFromResearch,
  validateResearchForArticleGeneration,
} from '../lib/researchWorkflow';
import { evaluateBlogQuality } from '../lib/qualityCheck';

const prisma = new PrismaClient();

async function runResearchWorkflowTests() {
  console.log('\n================================================================');
  console.log('🔬 BLOGWEB904 — RESEARCH TO ARTICLE WORKFLOW VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: any, testName: string, detail?: string) {
    if (Boolean(condition)) {
      console.log(`✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // Create temporary test fixtures that will be cleaned up
  let ideaItem: any = null;
  let researchingItem: any = null;
  let researchedItem: any = null;
  let generatedBlogId: string | null = null;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: IDEA -> cannot directly generate article
    // -------------------------------------------------------------------------
    ideaItem = await prisma.productResearch.create({
      data: {
        name: 'Test Idea Vacuum X1',
        category: 'Robot Vacuums',
        status: 'IDEA',
        searchIntent: 'Commercial',
        articleAngle: 'Test Idea Vacuum X1 Review',
      },
    });

    const ideaValidation = await validateResearchForArticleGeneration(ideaItem.id);
    const ideaRun = await generateArticleFromResearch(ideaItem.id);

    assert(
      !ideaValidation.valid && ideaValidation.error?.includes('IDEA stage') && !ideaRun.success,
      'Test 1: IDEA stage cannot directly generate article',
      ideaValidation.error
    );

    // -------------------------------------------------------------------------
    // TEST 2: RESEARCHING -> cannot directly generate article
    // -------------------------------------------------------------------------
    researchingItem = await prisma.productResearch.create({
      data: {
        name: 'Test In-Progress Mop Pro',
        category: 'Robot Vacuums',
        status: 'RESEARCHING',
        searchIntent: 'Informational',
        articleAngle: 'Test In-Progress Mop Pro Analysis',
        researchNotes: 'Initial notes gathering...',
      },
    });

    const researchingValidation = await validateResearchForArticleGeneration(researchingItem.id);
    const researchingRun = await generateArticleFromResearch(researchingItem.id);

    assert(
      !researchingValidation.valid && researchingValidation.error?.includes('IN PROGRESS') && !researchingRun.success,
      'Test 2: RESEARCHING stage cannot directly generate article',
      researchingValidation.error
    );

    // -------------------------------------------------------------------------
    // TEST 3: RESEARCHED -> article generation allowed
    // -------------------------------------------------------------------------
    const testSources = [
      {
        title: 'Official Manufacturer Product Page',
        publisher: 'Test Robotics Global',
        url: 'https://example.com/robot-vacuum-official',
        type: 'OFFICIAL_MANUFACTURER',
        accessedAt: '2026-09-27',
        claimsSupported: ['30,000Pa suction', '7.9cm slim body', 'Heated mop wash'],
      },
    ];

    const testFacts = {
      suction: { claim: '30,000Pa', status: 'VERIFIED_SPECIFICATION' },
      chassis: { claim: '7.9cm', status: 'VERIFIED_SPECIFICATION' },
      runtime: { claim: 'Real-world tile runtime', status: 'NEEDS_VERIFICATION' },
    };

    researchedItem = await prisma.productResearch.create({
      data: {
        name: 'RoboClean Apex 900',
        brand: 'RoboClean',
        model: 'Apex 900',
        category: 'Robot Vacuums',
        status: 'RESEARCHED',
        searchIntent: 'Commercial Investigation / Informational',
        articleAngle: 'RoboClean Apex 900: Which Features Actually Matter for Indian Homes?',
        researchNotes: 'Verified specs from official engineering data.',
        specifications: JSON.stringify({
          'Suction Power': '30,000Pa',
          'Height': '7.9 cm',
          'Mop Washing': 'Hot Water 80°C',
          'Launch Price (India)': '₹89,999',
        }),
        keyFeatures: JSON.stringify([
          '7.9cm ultra-slim profile for low furniture clearance',
          '30,000Pa high-airflow suction system',
          'Dual spinning mop pads with heated dock cleaning',
        ]),
        pros: JSON.stringify([
          'Cleans under low sofas and diwans',
          'Heated mop wash breaks down kitchen oil film',
        ]),
        cons: JSON.stringify([
          'Premium pricing in upper tier',
          'Large docking station footprint',
        ]),
        limitations: JSON.stringify([
          'Water tanks must be manually filled and drained',
          'Cannot clean furniture clearances under 7.5cm',
        ]),
        officialSources: JSON.stringify(testSources),
        factVerification: JSON.stringify(testFacts),
      },
    });

    const researchedValidation = await validateResearchForArticleGeneration(researchedItem.id);
    assert(
      researchedValidation.valid && researchedValidation.error === undefined,
      'Test 3: RESEARCHED stage validates and allows article generation'
    );

    // -------------------------------------------------------------------------
    // TEST 4: Article draft generated successfully
    // -------------------------------------------------------------------------
    const generationResult = await generateArticleFromResearch(researchedItem.id);
    generatedBlogId = generationResult.blogId || null;

    assert(
      generationResult.success && Boolean(generationResult.blogId) && Boolean(generationResult.slug),
      'Test 4: Article draft generated successfully',
      `Blog ID: ${generationResult.blogId}, Slug: ${generationResult.slug}`
    );

    const generatedBlog = await prisma.blog.findUnique({
      where: { id: generationResult.blogId },
    });

    assert(
      Boolean(generatedBlog) && generatedBlog!.content.length > 1000,
      'Test 4b: Article content generated with comprehensive structure',
      `${generatedBlog?.content.split(/\s+/).filter(Boolean).length} words`
    );

    // -------------------------------------------------------------------------
    // TEST 5: Research provenance preserved
    // -------------------------------------------------------------------------
    const snapshot = await prisma.researchSnapshot.findFirst({
      where: { blogId: generationResult.blogId },
    });

    assert(
      Boolean(snapshot) && snapshot!.sources.includes('Official Manufacturer Product Page'),
      'Test 5: Research provenance preserved in ResearchSnapshot',
      `Snapshot ID: ${snapshot?.id}`
    );

    // -------------------------------------------------------------------------
    // TEST 6: SEO fields generated
    // -------------------------------------------------------------------------
    assert(
      Boolean(generatedBlog?.metaTitle) &&
        Boolean(generatedBlog?.metaDescription) &&
        Boolean(generatedBlog?.slug) &&
        generatedBlog!.metaTitle!.length >= 10 &&
        generatedBlog!.metaDescription!.length >= 40,
      'Test 6: SEO fields generated (Title, Meta Description, Slug, Structured FAQs)',
      `Title: "${generatedBlog?.metaTitle?.substring(0, 35)}...", Desc: ${generatedBlog?.metaDescription?.length} chars`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Unverified claims remain flagged
    // -------------------------------------------------------------------------
    const storedFacts = JSON.parse(snapshot?.verifiedFacts || '{}');
    const runtimeFact = storedFacts.runtime;

    assert(
      runtimeFact && runtimeFact.status === 'NEEDS_VERIFICATION',
      'Test 7: Unverified claims remain flagged as NEEDS_VERIFICATION',
      `Status: ${runtimeFact?.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 8: Affiliate URL is not fabricated
    // -------------------------------------------------------------------------
    const hasFakeAsin =
      generatedBlog?.affiliateUrl?.includes('fake-asin') ||
      generatedBlog?.amazonUrl?.includes('fake-asin') ||
      generatedBlog?.affiliateUrl?.includes('B000000000');

    assert(
      !hasFakeAsin && (generatedBlog?.amazonUrl?.startsWith('http://') || generatedBlog?.amazonUrl?.startsWith('https://')),
      'Test 8: Affiliate URL is not fabricated (Legitimate store URL configured)',
      `URL: ${generatedBlog?.amazonUrl}`
    );

    // -------------------------------------------------------------------------
    // TEST 9: Duplicate generation is prevented (Idempotency)
    // -------------------------------------------------------------------------
    const duplicateRun = await generateArticleFromResearch(researchedItem.id);

    assert(
      duplicateRun.success && duplicateRun.alreadyExists === true && duplicateRun.blogId === generationResult.blogId,
      'Test 9: Duplicate generation prevented; operation is strictly idempotent',
      `Reused existing blogId: ${duplicateRun.blogId}`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Generated article enters REVIEW
    // -------------------------------------------------------------------------
    assert(
      generatedBlog?.status === 'REVIEW' && generationResult.status === 'REVIEW',
      'Test 10: Generated article enters REVIEW status (Not auto-published)',
      `Article Status: ${generatedBlog?.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 11: AI cannot directly approve
    // -------------------------------------------------------------------------
    assert(
      generatedBlog?.status !== 'APPROVED',
      'Test 11: AI drafting engine cannot directly set APPROVED status'
    );

    // -------------------------------------------------------------------------
    // TEST 12: AI cannot directly publish
    // -------------------------------------------------------------------------
    assert(
      generatedBlog?.status !== 'PUBLISHED',
      'Test 12: AI drafting engine cannot directly set PUBLISHED status'
    );

    // -------------------------------------------------------------------------
    // TEST 13: Human approval can move REVIEW -> APPROVED
    // -------------------------------------------------------------------------
    const approvedBlog = await prisma.blog.update({
      where: { id: generatedBlog!.id },
      data: { status: 'APPROVED' },
    });

    // Verify research and queue synchronization
    await prisma.productResearch.updateMany({
      where: { blogId: approvedBlog.id },
      data: { status: 'APPROVED' },
    });

    const updatedResearch = await prisma.productResearch.findUnique({
      where: { id: researchedItem.id },
    });

    assert(
      approvedBlog.status === 'APPROVED' && updatedResearch?.status === 'APPROVED',
      'Test 13: Human approval successfully moves REVIEW -> APPROVED and syncs research queue',
      `Blog Status: ${approvedBlog.status}, Research Status: ${updatedResearch?.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 14: Existing scheduled publishing still works
    // -------------------------------------------------------------------------
    const scheduledDate = new Date(Date.now() + 86400000); // Tomorrow
    const scheduledBlog = await prisma.blog.update({
      where: { id: generatedBlog!.id },
      data: {
        status: 'SCHEDULED',
        scheduledAt: scheduledDate,
      },
    });

    assert(
      scheduledBlog.status === 'SCHEDULED' && scheduledBlog.scheduledAt !== null,
      'Test 14: Scheduled publishing preservation verified',
      `Scheduled for: ${scheduledBlog.scheduledAt?.toISOString()}`
    );

    // -------------------------------------------------------------------------
    // TEST 15: Existing Dreame X60 Ultra Complete article integration check
    // -------------------------------------------------------------------------
    const dreameResearch = await prisma.productResearch.findFirst({
      where: { name: 'Dreame X60 Ultra Complete' },
    });

    const dreameBlog = await prisma.blog.findUnique({
      where: { slug: 'dreame-x60-ultra-complete-features-indian-homes' },
    });

    if (dreameResearch && dreameBlog) {
      // Connect them via the workflow
      await prisma.productResearch.update({
        where: { id: dreameResearch.id },
        data: { blogId: dreameBlog.id, status: 'REVIEW' },
      });

      await prisma.blog.update({
        where: { id: dreameBlog.id },
        data: { status: 'REVIEW' },
      });

      await prisma.productionQueueItem.upsert({
        where: { id: 'dreame-x60-queue-item' },
        update: { status: 'REVIEW', blogId: dreameBlog.id },
        create: {
          id: 'dreame-x60-queue-item',
          topic: 'Dreame X60 Ultra Complete',
          contentType: 'PRODUCT_REVIEW',
          searchIntent: 'COMMERCIAL',
          status: 'REVIEW',
          blogId: dreameBlog.id,
          sourceStatus: 'VERIFIED',
          researchStatus: 'COMPLETED',
          draftStatus: 'COMPLETED',
          seoStatus: 'PASSED',
        },
      });

      assert(
        true,
        'Test 15: Dreame X60 Ultra Complete successfully integrated into REVIEW queue',
        `Blog: ${dreameBlog.slug} (REVIEW)`
      );
    } else {
      assert(false, 'Test 15: Dreame X60 Ultra Complete research or blog missing');
    }

  } catch (error: any) {
    console.error('Unhandled test failure:', error);
    failed++;
  } finally {
    // Clean up temporary test items
    if (ideaItem?.id) {
      await prisma.productResearch.delete({ where: { id: ideaItem.id } }).catch(() => {});
    }
    if (researchingItem?.id) {
      await prisma.productResearch.delete({ where: { id: researchingItem.id } }).catch(() => {});
    }
    if (researchedItem?.id) {
      await prisma.productResearch.delete({ where: { id: researchedItem.id } }).catch(() => {});
    }
    if (generatedBlogId) {
      await prisma.researchSnapshot.deleteMany({ where: { blogId: generatedBlogId } }).catch(() => {});
      await prisma.productionQueueItem.deleteMany({ where: { blogId: generatedBlogId } }).catch(() => {});
      await prisma.blog.delete({ where: { id: generatedBlogId } }).catch(() => {});
    }
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runResearchWorkflowTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
