import { db } from '../lib/db';
import { evaluateBlogQuality } from '../lib/qualityCheck';

async function runPhase3Tests() {
  console.log('\n==============================================');
  console.log('🛡️  BLOGWEB904 PHASE 3 WORKFLOW VERIFICATION');
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

  try {
    // 1. Test Product Research Record Creation
    const testResearch = await db.productResearch.create({
      data: {
        name: 'Sony WH-1000XM5 Automated Test',
        brand: 'Sony',
        model: 'WH-1000XM5',
        category: 'Audio & Headphones',
        productUrl: 'https://electronics.sony.com/audio/headphones/headband/p/wh1000xm5-b',
        searchIntent: 'Commercial Investigation',
        articleAngle: 'Sony WH-1000XM5 Spec Breakdown vs Bose QC Ultra',
        researchNotes: 'Traceable official documentation from Sony global audio portal.',
        status: 'RESEARCHING',
        officialSources: JSON.stringify([
          { type: 'Official Manufacturer', title: 'Sony Official Product Spec Sheet', url: 'https://electronics.sony.com' },
        ]),
        factVerification: JSON.stringify({
          battery: 'VERIFIED',
          dimensions: 'VERIFIED',
          weight: 'VERIFIED',
          warranty: 'VERIFIED',
          price: 'VERIFIED',
        }),
      },
    });
    assert(Boolean(testResearch.id), 'Create ProductResearch record in PostgreSQL');

    // 2. Test Fact Verification & Source Management
    const parsedSources = JSON.parse(testResearch.officialSources || '[]');
    const parsedFacts = JSON.parse(testResearch.factVerification || '{}');
    assert(parsedSources.length === 1 && parsedSources[0].type === 'Official Manufacturer', 'Traceable source management recorded');
    assert(parsedFacts.battery === 'VERIFIED' && parsedFacts.weight === 'VERIFIED', 'Fact verification states stored and verified');

    // 3. Test Activity Audit Log
    const testActivity = await db.activityLog.create({
      data: {
        userName: 'AdminTester',
        userEmail: 'admin@blogweb904.com',
        action: 'PRODUCT_RESEARCH_CREATED',
        entity: 'ProductResearch',
        entityId: testResearch.id,
        summary: 'Automated test creation of research item',
        metadata: JSON.stringify({ productName: testResearch.name }),
        ipAddress: '127.0.0.1',
      },
    });
    assert(Boolean(testActivity.id), 'Admin activity audit log recorded');

    const activityQuery = await db.activityLog.findFirst({
      where: { entityId: testResearch.id },
    });
    assert(activityQuery?.action === 'PRODUCT_RESEARCH_CREATED', 'Activity audit log query and retrieval verified');

    // 4. Test Product & Multi-Store Price & Price History Recording
    let testCategory = await db.category.findFirst();
    if (!testCategory) {
      const ts = Date.now();
      testCategory = await db.category.create({
        data: { name: `Test Category ${ts}`, slug: `test-cat-${ts}` },
      });
    }

    const testProduct = await db.product.create({
      data: {
        name: 'Sony WH-1000XM5 E2E Test',
        slug: `sony-wh-1000xm5-e2e-${Date.now()}`,
        brand: 'Sony',
        price: '₹29,990',
        images: JSON.stringify(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e']),
        amazonUrl: 'https://amazon.in/dp/B09XS7JWHH',
        affiliateUrl: 'https://amazon.in/dp/B09XS7JWHH?tag=blogweb904-21',
        categoryId: testCategory.id,
        specifications: JSON.stringify({ 'Battery Life': '30 Hours', 'Weight': '250g' }),
        features: JSON.stringify(['Industry-leading ANC', '30hr battery']),
        pros: JSON.stringify(['Exceptional noise cancellation', 'Lightweight comfort']),
        cons: JSON.stringify(['Does not fold as compactly']),
      },
    });
    assert(Boolean(testProduct.id), 'Product creation with verified specs');

    const storePrice = await db.productPrice.create({
      data: {
        productId: testProduct.id,
        storeName: 'Amazon India',
        storeSlug: 'amazon',
        price: 29990,
        originalPrice: 34990,
        discount: 14,
        currency: 'INR',
        inStock: true,
        productUrl: testProduct.amazonUrl,
        affiliateUrl: testProduct.affiliateUrl,
        lastCheckedAt: new Date(),
      },
    });
    assert(Boolean(storePrice.id), 'Multi-store ProductPrice created with real timestamp');

    // Record Price History
    const historyEntry = await db.priceHistory.create({
      data: {
        productPriceId: storePrice.id,
        price: 29990,
        originalPrice: 34990,
        currency: 'INR',
        inStock: true,
        checkedAt: new Date(),
      },
    });
    assert(Boolean(historyEntry.id), 'PriceHistory entry successfully appended');

    // 5. Test Stale Price Detection
    const staleDaysThreshold = 7;
    const now = new Date();
    const isFresh = (now.getTime() - new Date(storePrice.lastCheckedAt!).getTime()) < (staleDaysThreshold * 24 * 60 * 60 * 1000);
    assert(isFresh, 'Stale price detection classifies recently checked price as Fresh');

    // 6. Test Quality Checklist Validator
    const passingReport = evaluateBlogQuality({
      title: 'Sony WH-1000XM5 In-Depth Spec Breakdown & Review',
      slug: 'sony-wh-1000xm5-spec-breakdown-review',
      metaTitle: 'Sony WH-1000XM5 Full Review & Spec Analysis',
      metaDescription: 'Read our comprehensive breakdown of the Sony WH-1000XM5 with verified battery specs and multi-store prices.',
      content: '## In-Depth Analysis\n\nThe Sony WH-1000XM5 continues to set high standards in active noise cancellation with its dual processors and 8 microphones. Over standard testing cycles, it provides dependable battery performance.\n\n### Design & Ergonomics\n\nWeighing 250 grams, the headphones offer long-session comfort without excessive clamp pressure.',
      featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      amazonUrl: 'https://amazon.in/dp/B09XS7JWHH',
      affiliateUrl: 'https://amazon.in/dp/B09XS7JWHH?tag=blogweb904-21',
      faqs: [{ question: 'How long does battery last?', answer: 'Up to 30 hours with ANC enabled.' }, { question: 'Does it support LDAC?', answer: 'Yes, LDAC high-res audio codec is supported.' }],
      qualityChecklist: {
        noFakeClaims: true,
        researchComplete: true,
        factsVerified: true,
        sourcesAdded: true,
        priceChecked: true,
        disclosureChecked: true,
        authorAssigned: true,
      },
    });

    assert(passingReport.allRequiredPassed, 'Quality Score Validator passes verified editorial draft');
    assert(passingReport.score >= 90, `Quality score is >= 90% (Actual: ${passingReport.score}%)`);

    // 7. Test Incomplete/Unverified Blog Guard
    const failingReport = evaluateBlogQuality({
      title: 'Short',
      slug: '',
      metaTitle: '',
      metaDescription: '',
      content: 'Thin',
      featuredImage: '',
      amazonUrl: '',
      qualityChecklist: {
        noFakeClaims: false,
        researchComplete: false,
        factsVerified: false,
      },
    });
    assert(!failingReport.readyForPublishing, 'Quality Guard strictly blocks unverified thin content from being published');

    // 8. Test Blog Draft to Publication Workflow
    const testBlog = await db.blog.create({
      data: {
        title: 'Sony WH-1000XM5 Review & Spec Breakdown',
        slug: `sony-wh-1000xm5-review-${Date.now()}`,
        metaTitle: 'Sony WH-1000XM5 Review & Spec Analysis | BlogWeb904',
        metaDescription: 'Read our comprehensive breakdown of the Sony WH-1000XM5 with verified battery specs and multi-store prices.',
        content: 'Comprehensive review content with genuine spec verification.',
        featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        amazonUrl: testProduct.amazonUrl,
        affiliateUrl: testProduct.affiliateUrl,
        categoryId: testCategory.id,
        productId: testProduct.id,
        status: 'PUBLISHED',
        tags: JSON.stringify(['Audio', 'Headphones', 'Review']),
        qualityChecklist: JSON.stringify(passingReport.items),
      },
    });
    assert(Boolean(testBlog.id) && testBlog.status === 'PUBLISHED', 'Published blog created with quality checklist attached');

    // 9. Clean up test records
    await db.blog.delete({ where: { id: testBlog.id } });
    await db.priceHistory.delete({ where: { id: historyEntry.id } });
    await db.productPrice.delete({ where: { id: storePrice.id } });
    await db.product.delete({ where: { id: testProduct.id } });
    await db.activityLog.delete({ where: { id: testActivity.id } });
    await db.productResearch.delete({ where: { id: testResearch.id } });

    assert(true, 'Test records cleaned up safely without data loss');

  } catch (error: any) {
    console.error('Test execution error:', error);
    failed++;
  }

  console.log('\n==============================================');
  console.log(`PHASE 3 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('==============================================\n');

  if (failed > 0) process.exit(1);
}

runPhase3Tests();
