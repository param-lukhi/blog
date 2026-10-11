import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDatabaseContent() {
  console.log('--- STARTING SAFE CONTENT REMEDIATION ---');

  // 1. Fix Samsung Galaxy S24 Ultra vs iPhone 15 Pro Max Blog
  const samsungBlog = await prisma.blog.findUnique({
    where: { slug: 'samsung-galaxy-s24-ultra-vs-iphone-15-pro-max-camera-display-spec-matrix' }
  });

  if (samsungBlog) {
    const cleanSamsungSpecs = {
      "Display": "6.8-inch Dynamic AMOLED 2X, Flat, 120Hz LTPO, 2,600 nits peak",
      "Screen Protection": "Corning Gorilla Armor (Anti-Reflective Coating)",
      "Processor": "Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm)",
      "Rear Cameras": "200MP Main (OIS) + 50MP 5x Periscope (OIS) + 10MP 3x Telephoto + 12MP Ultrawide",
      "Front Camera": "12MP Dual Pixel AF",
      "Battery & Charging": "5,000 mAh, 45W Wired, 15W Wireless, Reverse Wireless",
      "RAM & Storage": "12GB LPDDR5X RAM, 256GB / 512GB / 1TB UFS 4.0",
      "Chassis Material": "Grade 2 Titanium Frame, Flat Glass Back",
      "Stylus": "Integrated S-Pen with Bluetooth Remote Functions",
      "Software Support": "7 Generations of Android OS Updates & 7 Years of Security Patches",
      "Weight": "232g",
      "Water Resistance": "IP68 (up to 1.5m for 30 minutes)"
    };

    const cleanSamsungFaqs = [
      {
        question: "Which phone has the better camera system overall?",
        answer: "The Samsung Galaxy S24 Ultra offers greater zoom versatility with its dedicated 3x and 5x optical lenses and superior 10x–30x hybrid reach, along with an ultra-high-resolution 200MP sensor for cropping. The iPhone 15 Pro Max holds an edge in video consistency, offering 4K 60fps ProRes recording directly to external storage and more natural color grading for video creators."
      },
      {
        question: "Does the anti-reflective Gorilla Armor glass actually make a difference?",
        answer: "Yes, Corning Gorilla Armor on the S24 Ultra reduces ambient surface reflections by up to 75% compared to standard smartphone glass. In bright outdoor sunlight or beneath harsh fluorescent office lights, reflections and glare are noticeably subdued, improving readability without requiring maximum screen brightness."
      },
      {
        question: "How does battery life compare between the S24 Ultra and iPhone 15 Pro Max?",
        answer: "Both devices deliver exceptional multi-day endurance for typical users. The iPhone 15 Pro Max benefits from Apple's efficient iOS standby power management, excelling during continuous video streaming and audio playback. The S24 Ultra features a larger 5,000 mAh cell and faster 45W wired charging (reaching 65% in ~30 minutes vs 25W on the iPhone)."
      },
      {
        question: "Is the S-Pen useful for everyday non-artists?",
        answer: "Beyond digital drawing, the S-Pen provides high everyday utility: signing PDFs without third-party apps, extracting text from unselectable images or video frames, taking remote photos via the Bluetooth shutter button, and precise spreadsheet cell navigation."
      },
      {
        question: "How long will both smartphones be supported with software updates?",
        answer: "Samsung officially commits to 7 full generations of Android OS upgrades and 7 years of security patches for the S24 Ultra (supported through 2031). Apple typically provides 5 to 7 years of major iOS upgrades and security updates for flagship iPhones."
      },
      {
        question: "Which flagship should you buy in 2026?",
        answer: "Choose the Galaxy S24 Ultra if you prioritize the anti-reflective flat display, zoom photography, S-Pen productivity, split-screen multitasking, and long-term 7-year Android support. Choose the iPhone 15 Pro Max if you are already invested in the Apple ecosystem (Mac, iPad, Apple Watch), prioritize professional video workflows, or prefer lighter hand ergonomics."
      }
    ];

    const cleanSamsungPros = [
      "Corning Gorilla Armor drastically cuts outdoor sunlight glare and reflections",
      "Unmatched zoom versatility with 3x optical, 5x optical, and crisp 10x hybrid clarity",
      "Integrated S-Pen provides exceptional digital note-taking, signing, and remote shutter",
      "Guaranteed 7-year software and security upgrade lifecycle",
      "Vibrant 2,600-nit flat AMOLED display with slim uniform bezels"
    ];

    const cleanSamsungCons = [
      "Substantial 232g weight and sharp boxy corners can feel bulky in compact pockets",
      "45W wired charging is slower than competitor 65W–100W fast chargers",
      "Premium flagship price demands a significant financial investment"
    ];

    const cleanSamsungConclusion = "Both the Samsung Galaxy S24 Ultra and Apple iPhone 15 Pro Max represent the pinnacle of premium mobile engineering. The S24 Ultra earns our recommendation for power users, productivity-focused professionals, and photographers who leverage optical zoom and digital stylus input. The iPhone 15 Pro Max remains the benchmark for mobile videographers and those deeply integrated into Apple services. Neither device compromises on battery endurance or build quality, making the choice dependent on your preferred operating system and workflow requirements.";

    await prisma.blog.update({
      where: { id: samsungBlog.id },
      data: {
        specifications: JSON.stringify(cleanSamsungSpecs),
        faqs: JSON.stringify(cleanSamsungFaqs),
        pros: JSON.stringify(cleanSamsungPros),
        cons: JSON.stringify(cleanSamsungCons),
        conclusion: cleanSamsungConclusion,
        affiliateUrl: 'https://www.amazon.in/dp/B0CS5X851P?tag=techpulse-20',
        amazonUrl: 'https://www.amazon.in/dp/B0CS5X851P',
      }
    });
    console.log('✓ Fixed Samsung S24 Ultra vs iPhone 15 Pro Max blog content (hallucination removed, specs cleaned, genuine pros/cons/faqs added)');
  }

  // 2. Fix Samsung Product
  const samsungProd = await prisma.product.findUnique({
    where: { slug: 'samsung-galaxy-s24-ultra' }
  });

  if (samsungProd) {
    const rawProdSpecs = JSON.parse(samsungProd.specifications);
    delete rawProdSpecs._ratingScores;
    delete rawProdSpecs._priceHistory;

    await prisma.product.update({
      where: { id: samsungProd.id },
      data: {
        specifications: JSON.stringify(rawProdSpecs),
        affiliateUrl: 'https://www.amazon.in/dp/B0CS5X851P?tag=techpulse-20',
        amazonUrl: 'https://www.amazon.in/dp/B0CS5X851P',
      }
    });
    console.log('✓ Cleaned Samsung product specifications (removed fake scores and history)');
  }

  // 3. Fix Dreame Product & Blog (remove fake rating scores)
  const dreameBlog = await prisma.blog.findUnique({
    where: { slug: 'dreame-x60-ultra-complete-features-indian-homes' }
  });

  if (dreameBlog && dreameBlog.specifications) {
    try {
      const rawDreameBlogSpecs = JSON.parse(dreameBlog.specifications);
      delete rawDreameBlogSpecs._ratingScores;
      delete rawDreameBlogSpecs._priceHistory;
      await prisma.blog.update({
        where: { id: dreameBlog.id },
        data: { specifications: JSON.stringify(rawDreameBlogSpecs) }
      });
      console.log('✓ Cleaned Dreame blog specifications');
    } catch (e) {}
  }

  const dreameProd = await prisma.product.findUnique({
    where: { slug: 'dreame-x60-ultra-complete' }
  });

  if (dreameProd && dreameProd.specifications) {
    try {
      const rawDreameProdSpecs = JSON.parse(dreameProd.specifications);
      delete rawDreameProdSpecs._ratingScores;
      delete rawDreameProdSpecs._priceHistory;
      await prisma.product.update({
        where: { id: dreameProd.id },
        data: { specifications: JSON.stringify(rawDreameProdSpecs) }
      });
      console.log('✓ Cleaned Dreame product specifications');
    } catch (e) {}
  }

  // 4. Update Settings to remove misleading claims
  await prisma.setting.upsert({
    where: { key: 'hero_title' },
    update: { value: 'Research-Based Tech Reviews & Buying Guides' },
    create: { key: 'hero_title', value: 'Research-Based Tech Reviews & Buying Guides' }
  });

  await prisma.setting.upsert({
    where: { key: 'hero_subtitle' },
    update: { value: 'We analyze technical specifications, hardware benchmarks, and verified user feedback to help you make informed buying decisions.' },
    create: { key: 'hero_subtitle', value: 'We analyze technical specifications, hardware benchmarks, and verified user feedback to help you make informed buying decisions.' }
  });

  console.log('✓ Updated site settings (removed false claim of testing thousands of products)');
  console.log('--- REMEDIATION SCRIPT COMPLETE ---');
}

fixDatabaseContent()
  .catch((e) => {
    console.error('Error fixing database content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
