import { NextResponse } from 'next/server';
import { generateAmazonBlogDraft } from '@/lib/amazon-generator';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { amazonUrl, autoSave } = await request.json();

    if (!amazonUrl || !amazonUrl.includes('amazon')) {
      return NextResponse.json(
        { error: 'Please provide a valid Amazon URL' },
        { status: 400 }
      );
    }

    // Fetch site affiliate tag from Settings
    const settingTag = await db.setting.findUnique({ where: { key: 'affiliate_tag' } });
    const tag = settingTag ? settingTag.value : 'techpulse-20';

    // Generate Blog Draft
    const draft = generateAmazonBlogDraft(amazonUrl, tag);

    // Find matching category or fallback to 'Mobiles' / 'Laptops'
    let category = await db.category.findFirst({
      where: { name: draft.categoryName }
    });

    if (!category) {
      category = await db.category.findFirst();
    }

    if (autoSave && category) {
      // Automatically save as a draft in DB
      const createdBlog = await db.blog.create({
        data: {
          title: draft.title,
          slug: draft.slug,
          metaTitle: draft.metaTitle,
          metaDescription: draft.metaDescription,
          featuredImage: draft.featuredImage,
          content: draft.content,
          specifications: JSON.stringify(draft.specifications),
          features: JSON.stringify(draft.features),
          pros: JSON.stringify(draft.pros),
          cons: JSON.stringify(draft.cons),
          faqs: JSON.stringify(draft.faqs),
          conclusion: draft.conclusion,
          amazonUrl: draft.amazonUrl,
          affiliateUrl: draft.affiliateUrl,
          categoryId: category.id,
          tags: JSON.stringify(draft.tags),
          status: 'DRAFT',
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Blog generated and saved as Draft!',
        blog: createdBlog,
        draft,
      });
    }

    return NextResponse.json({
      success: true,
      draft,
      categoryId: category ? category.id : null,
    });
  } catch (error) {
    console.error('Amazon generator error:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog from Amazon URL' },
      { status: 500 }
    );
  }
}
