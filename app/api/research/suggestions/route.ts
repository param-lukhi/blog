import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface DailySuggestion {
  id: string;
  productName: string;
  brand: string;
  category: string;
  relevanceType: "Search-oriented opportunity" | "Currently relevant" | "Potential topic";
  whyUseful: string;
  searchIntent: string;
  potentialAngle: string;
  targetAudience: string;
  requiredResearch: string[];
  comparisonOpportunities: string[];
  affiliatePotential: "High" | "Medium" | "Moderate";
  suggestedSpecs: Record<string, string>;
}

// Curated pool of verified product categories and search-oriented topics
const SUGGESTION_POOL: Omit<DailySuggestion, "id">[] = [
  {
    productName: "Sony WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    category: "Audio & Headphones",
    relevanceType: "Search-oriented opportunity",
    whyUseful: "High consumer interest in premium active noise cancellation with active multi-store price variations.",
    searchIntent: "Commercial Investigation / Best Noise-Cancelling Headphones",
    potentialAngle: "Sony WH-1000XM5 In-Depth Spec Breakdown & Price Comparison vs Bose QC Ultra",
    targetAudience: "Commuters, remote workers, audio enthusiasts seeking verified ANC performance.",
    requiredResearch: [
      "Verify exact battery life with ANC on (30 hours claimed)",
      "Confirm multi-point Bluetooth version and codec support (LDAC, AAC)",
      "Gather live store prices across Amazon, Best Buy, and official Sony store",
    ],
    comparisonOpportunities: ["Bose QuietComfort Ultra", "Apple AirPods Max", "Sennheiser Momentum 4"],
    affiliatePotential: "High",
    suggestedSpecs: {
      "Battery Life": "30 hours (ANC on)",
      "Weight": "250g",
      "Driver Size": "30mm",
      "Bluetooth": "5.2 (LDAC/AAC/SBC)",
      "Microphones": "8 mics with beamforming",
    },
  },
  {
    productName: "Apple MacBook Air M3 (13-inch, 2024)",
    brand: "Apple",
    category: "Laptops & Computing",
    relevanceType: "Currently relevant",
    whyUseful: "Perennial high-intent buyer research on base 8GB vs 16GB RAM configurations and external display support.",
    searchIntent: "Commercial Investigation / Student & Productivity Laptop",
    potentialAngle: "MacBook Air M3 Buying Guide: Is the Base Configuration Worth It in 2026?",
    targetAudience: "College students, professionals, portable productivity creators.",
    requiredResearch: [
      "Verify dual external display support limitations (clamshell mode only)",
      "Document SSD read/write speeds on 256GB vs 512GB",
      "Compare authorized retailer prices (B&H, Amazon, Apple Store)",
    ],
    comparisonOpportunities: ["Dell XPS 13 (2024)", "MacBook Air M2 (Discounted)", "Lenovo ThinkPad X1 Carbon"],
    affiliatePotential: "High",
    suggestedSpecs: {
      "Processor": "Apple M3 (8-core CPU, 8 or 10-core GPU)",
      "Display": "13.6-inch Liquid Retina (2560x1664)",
      "Weight": "1.24 kg (2.7 lbs)",
      "Battery": "Up to 18 hours",
      "Ports": "2x Thunderbolt / USB 4, MagSafe 3, 3.5mm jack",
    },
  },
  {
    productName: "Logitech MX Master 3S Wireless Mouse",
    brand: "Logitech",
    category: "Peripherals & Productivity",
    relevanceType: "Potential topic",
    whyUseful: "Benchmark ergonomic mouse with consistent multi-store stocking and competitive accessory discounts.",
    searchIntent: "Transactional & Review / Best Productivity Mouse",
    potentialAngle: "Logitech MX Master 3S Long-Term Ergonomic & Multi-Device Workflow Review",
    targetAudience: "Software developers, designers, spreadsheet power users.",
    requiredResearch: [
      "Verify 8K DPI sensor accuracy on glass surfaces",
      "Compare electromagnetic MagSpeed wheel features with MX Master 3",
      "Check authorized distributor price history",
    ],
    comparisonOpportunities: ["Logitech Lift Vertical", "Razer Pro Click", "Apple Magic Mouse"],
    affiliatePotential: "Medium",
    suggestedSpecs: {
      "Sensor": "Darkfield high precision (8000 DPI)",
      "Connectivity": "Bluetooth Low Energy & Logi Bolt USB",
      "Battery": "Up to 70 days on full charge",
      "Weight": "141g",
      "Buttons": "7 customizable buttons",
    },
  },
  {
    productName: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Smartphones",
    relevanceType: "Search-oriented opportunity",
    whyUseful: "High-ticket flagship mobile device with significant price disparities across carrier and retail channels.",
    searchIntent: "Commercial Comparison / Flagship Android Smartphone",
    potentialAngle: "Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max: Camera, Display & Spec Matrix",
    targetAudience: "Tech enthusiasts, mobile photographers, power users.",
    requiredResearch: [
      "Confirm Gorilla Armor anti-reflective glass benefits",
      "Verify 5x optical periscope vs older 10x sensor details",
      "Collect multi-carrier trade-in and retail prices",
    ],
    comparisonOpportunities: ["Apple iPhone 15 Pro Max", "Google Pixel 8 Pro", "OnePlus 12"],
    affiliatePotential: "High",
    suggestedSpecs: {
      "Processor": "Snapdragon 8 Gen 3 for Galaxy",
      "Display": "6.8-inch Dynamic AMOLED 2X (120Hz, 2600 nits)",
      "Battery": "5000 mAh (45W wired)",
      "Camera": "200MP Main + 50MP 5x Periscope + 10MP 3x + 12MP Ultrawide",
      "Weight": "232g",
    },
  },
  {
    productName: "Kindle Paperwhite (11th Gen / 16GB)",
    brand: "Amazon",
    category: "E-Readers & Tablets",
    relevanceType: "Currently relevant",
    whyUseful: "High conversion product with frequent seasonal price adjustments and clear feature tradeoffs vs base Kindle.",
    searchIntent: "Commercial Investigation / Best E-Reader for Reading",
    potentialAngle: "Kindle Paperwhite vs Basic Kindle: Is the Warm Light & Waterproofing Essential?",
    targetAudience: "Avid book readers, travelers, students.",
    requiredResearch: [
      "Verify IPX8 waterproof rating depth and duration",
      "Confirm battery life in hours vs weeks under standard 30min/day usage",
      "Check Amazon and Best Buy availability",
    ],
    comparisonOpportunities: ["Amazon Kindle (Base Model)", "Kobo Clara 2E", "Boox Palma"],
    affiliatePotential: "Medium",
    suggestedSpecs: {
      "Display": "6.8-inch Paperwhite with adjustable warm light (300 ppi)",
      "Battery": "Up to 10 weeks",
      "Waterproofing": "IPX8 (2 meters fresh water for 60 mins)",
      "Weight": "205g",
      "Storage": "16GB",
    },
  },
];

export async function GET(req: NextRequest) {
  const isAuth = isAuthorizedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Generate deterministic 3 suggestions based on day-of-year so all admins see consistent daily recommendations
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Pick 3 rotating items from the verified pool
    const selectedIndices = [
      dayOfYear % SUGGESTION_POOL.length,
      (dayOfYear + 1) % SUGGESTION_POOL.length,
      (dayOfYear + 2) % SUGGESTION_POOL.length,
    ];

    // Check if any of these already exist in research database
    const existingResearch = await db.productResearch.findMany({
      select: { name: true, status: true, id: true },
    });

    const suggestions: DailySuggestion[] = selectedIndices.map((idx, i) => {
      const base = SUGGESTION_POOL[idx];
      const matched = existingResearch.find(
        (r: any) => r.name.toLowerCase() === base.productName.toLowerCase()
      );

      return {
        ...base,
        id: `sug-${dayOfYear}-${i}`,
        whyUseful: matched
          ? `${base.whyUseful} (Already tracked in research queue as: ${matched.status})`
          : base.whyUseful,
      };
    });

    return NextResponse.json({
      date: now.toISOString().split("T")[0],
      note: "Daily search-oriented product suggestions generated from editorial knowledge matrix. No fake trending claims.",
      suggestions,
    });
  } catch (error: any) {
    console.error("[Suggestions API] Error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
