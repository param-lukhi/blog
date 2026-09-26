export interface QualityCheckItem {
  id: string;
  label: string;
  category: "Editorial" | "SEO" | "Product" | "Trust";
  required: boolean;
  passed: boolean;
  notes?: string;
}

export interface BlogQualityReport {
  score: number; // 0 to 100
  allRequiredPassed: boolean;
  items: QualityCheckItem[];
  readyForApproval: boolean;
  readyForPublishing: boolean;
  warnings: string[];
}

export function evaluateBlogQuality(blog: {
  title?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  content?: string;
  featuredImage?: string;
  amazonUrl?: string;
  affiliateUrl?: string;
  specifications?: any;
  faqs?: any;
  qualityChecklist?: any;
}): BlogQualityReport {
  const title = (blog.title || "").trim();
  const slug = (blog.slug || "").trim();
  const metaTitle = (blog.metaTitle || title).trim();
  const metaDescription = (blog.metaDescription || "").trim();
  const content = (blog.content || "").trim();
  const featuredImage = (blog.featuredImage || "").trim();
  const affiliateUrl = (blog.affiliateUrl || blog.amazonUrl || "").trim();

  let faqsList: any[] = [];
  try {
    if (typeof blog.faqs === "string") {
      faqsList = JSON.parse(blog.faqs);
    } else if (Array.isArray(blog.faqs)) {
      faqsList = blog.faqs;
    }
  } catch {}

  let userChecklist: Record<string, boolean> = {};
  try {
    if (typeof blog.qualityChecklist === "string") {
      userChecklist = JSON.parse(blog.qualityChecklist);
    } else if (typeof blog.qualityChecklist === "object" && blog.qualityChecklist !== null) {
      userChecklist = blog.qualityChecklist;
    }
  } catch {}

  const warnings: string[] = [];

  // 1. Content & Editorial
  const hasContentLength = content.length >= 300;
  if (!hasContentLength) warnings.push("Content is shorter than recommended 300 characters.");

  const noFakeClaimsPassed = Boolean(userChecklist.noFakeClaims);
  const researchCompletePassed = Boolean(userChecklist.researchComplete || (content.length > 500));
  const factsVerifiedPassed = Boolean(userChecklist.factsVerified);
  const sourcesAddedPassed = Boolean(userChecklist.sourcesAdded);

  // 2. SEO
  const hasValidSlug = slug.length >= 3 && /^[a-z0-9-]+$/.test(slug);
  const hasValidMetaTitle = metaTitle.length >= 10 && metaTitle.length <= 70;
  const hasValidMetaDesc = metaDescription.length >= 40 && metaDescription.length <= 170;
  const hasFeaturedImage = featuredImage.length > 10 && (featuredImage.startsWith("http://") || featuredImage.startsWith("https://"));

  // 3. Product & Affiliate
  const hasAffiliate = affiliateUrl.length > 5 && (affiliateUrl.startsWith("http://") || affiliateUrl.startsWith("https://"));
  const hasFaqs = Array.isArray(faqsList) && faqsList.length >= 2;
  const priceCheckedPassed = Boolean(userChecklist.priceChecked);

  // 4. Trust
  const disclosurePassed = Boolean(userChecklist.disclosureChecked ?? true);
  const authorPassed = Boolean(userChecklist.authorAssigned ?? true);

  const items: QualityCheckItem[] = [
    {
      id: "noFakeClaims",
      label: "No Fabricated Claims / Genuine Editorial Synthesis",
      category: "Editorial",
      required: true,
      passed: noFakeClaimsPassed,
      notes: "Strict editorial confirmation that claims are verifiable and not hallucinated.",
    },
    {
      id: "researchComplete",
      label: "Product Research & Key Angle Defined",
      category: "Editorial",
      required: true,
      passed: researchCompletePassed,
      notes: "Detailed product context, specifications, and use cases.",
    },
    {
      id: "factsVerified",
      label: "Important Facts Verified Against Official Sources",
      category: "Product",
      required: true,
      passed: factsVerifiedPassed,
      notes: "Battery life, dimensions, weight, compatibility verified.",
    },
    {
      id: "sourcesAdded",
      label: "Traceable Sources & Documentation Added",
      category: "Editorial",
      required: true,
      passed: sourcesAddedPassed,
      notes: "Official manufacturer and retailer sources recorded.",
    },
    {
      id: "priceChecked",
      label: "Multi-Store Price Timestamp Verified",
      category: "Product",
      required: true,
      passed: priceCheckedPassed,
      notes: "Price data verified within freshness threshold.",
    },
    {
      id: "affiliateConfigured",
      label: "Valid Affiliate / Store URL Configured",
      category: "Product",
      required: true,
      passed: hasAffiliate,
      notes: "Accurate destination link configured for store checkout.",
    },
    {
      id: "seoTitle",
      label: "SEO Title Length (10-70 characters)",
      category: "SEO",
      required: true,
      passed: hasValidMetaTitle,
      notes: `Current length: ${metaTitle.length} chars`,
    },
    {
      id: "metaDescription",
      label: "Meta Description (40-170 characters)",
      category: "SEO",
      required: true,
      passed: hasValidMetaDesc,
      notes: `Current length: ${metaDescription.length} chars`,
    },
    {
      id: "cleanSlug",
      label: "Clean URL Slug (kebab-case)",
      category: "SEO",
      required: true,
      passed: hasValidSlug,
    },
    {
      id: "featuredImage",
      label: "Valid Featured Image",
      category: "SEO",
      required: true,
      passed: hasFeaturedImage,
    },
    {
      id: "faqs",
      label: "At least 2 FAQs for Structured Schema",
      category: "SEO",
      required: false,
      passed: hasFaqs,
      notes: `Current FAQs count: ${faqsList.length}`,
    },
    {
      id: "authorAndDisclosure",
      label: "Affiliate Disclosure & Editorial Trust Notice",
      category: "Trust",
      required: true,
      passed: disclosurePassed && authorPassed,
    },
  ];

  const totalPassed = items.filter((i) => i.passed).length;
  const score = Math.round((totalPassed / items.length) * 100);
  const requiredItems = items.filter((i) => i.required);
  const allRequiredPassed = requiredItems.every((i) => i.passed);

  return {
    score,
    allRequiredPassed,
    items,
    readyForApproval: allRequiredPassed,
    readyForPublishing: allRequiredPassed && hasContentLength,
    warnings,
  };
}
