import { NextResponse } from 'next/server';
import { generateFullProductAndBlog } from '@/lib/amazon-generator';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      url,
      query,
      imageUrl,
      categoryId: requestedCategoryId,
      publishImmediately = false,
    } = body;

    if (!url && !query && !imageUrl) {
      return NextResponse.json(
        { error: 'Please provide an Amazon/Product URL, Product Name, or Image URL' },
        { status: 400 }
      );
    }

    // 1. Fetch site affiliate tag from Settings
    const settingTag = await db.setting.findUnique({ where: { key: 'affiliate_tag' } });
    const tag = settingTag ? settingTag.value : 'techpulse-20';

    // 2. Resolve requested category name if categoryId was provided
    let targetCategoryName: string | undefined = undefined;
    if (requestedCategoryId) {
      const selectedCat = await db.category.findUnique({ where: { id: requestedCategoryId } });
      if (selectedCat) {
        targetCategoryName = selectedCat.name;
      }
    }

    // 3. Generate Complete Real Metadata & Draft
    const draft = await generateFullProductAndBlog({
      url: url?.trim() || undefined,
      query: query?.trim() || undefined,
      imageUrl: imageUrl?.trim() || undefined,
      affiliateTag: tag,
      targetCategory: targetCategoryName,
    });

    // 4. Find or Auto-Create Category
    let category = requestedCategoryId
      ? await db.category.findUnique({ where: { id: requestedCategoryId } })
      : await db.category.findFirst({
          where: { name: { equals: draft.categoryName, mode: 'insensitive' } },
        });

    if (!category) {
      category = await db.category.findFirst({
        where: { slug: slugify(draft.categoryName) },
      });
    }

    if (!category) {
      category = await db.category.create({
        data: {
          name: draft.categoryName,
          slug: slugify(draft.categoryName),
          description: `${draft.categoryName} buying guides, real-world benchmarks, and deals.`,
          icon: 'Sparkles',
        },
      });
    }

    const itemStatus = publishImmediately ? 'PUBLISHED' : 'DRAFT';

    // 5. Ensure Unique Slug for Product & Blog
    const baseSlug = draft.slug.replace(/-review$/, '');
    let productSlug = baseSlug;
    let existingProd = await db.product.findUnique({ where: { slug: productSlug } });
    if (existingProd) {
      productSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    let blogSlug = draft.slug;
    let existingBlog = await db.blog.findUnique({ where: { slug: blogSlug } });
    if (existingBlog) {
      blogSlug = `${draft.slug}-${Date.now().toString().slice(-4)}`;
    }

    // 6. Create Product in DB (Automatically saved as DRAFT)
    const createdProduct = await db.product.create({
      data: {
        name: draft.title.replace(/\s+Review:.*$/i, '').trim() || draft.title,
        slug: productSlug,
        brand: draft.brand,
        price: draft.price,
        images: JSON.stringify(draft.images && draft.images.length > 0 ? draft.images : [draft.featuredImage]),
        amazonUrl: draft.amazonUrl,
        affiliateUrl: draft.affiliateUrl,
        marketplaces: JSON.stringify(draft.marketplaces || {}),
        categoryId: category.id,
        specifications: JSON.stringify(draft.specifications),
        features: JSON.stringify(draft.features),
        pros: JSON.stringify(draft.pros),
        cons: JSON.stringify(draft.cons),
        isFeatured: false,
        isTrending: true,
        isDeal: false,
        status: itemStatus,
      },
    });

    // 7. Create Blog in DB (Automatically saved as DRAFT and linked to Product)
    const createdBlog = await db.blog.create({
      data: {
        title: draft.title,
        slug: blogSlug,
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
        marketplaces: JSON.stringify(draft.marketplaces || {}),
        categoryId: category.id,
        productId: createdProduct.id,
        tags: JSON.stringify(draft.tags),
        status: itemStatus,
      },
    });

    // 8. Revalidate cached routes
    try {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath('/products');
      revalidatePath('/admin/blogs');
      revalidatePath('/admin/products');
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Successfully generated and saved ${itemStatus === 'DRAFT' ? 'Draft' : 'Published'} Blog & Product!`,
      status: itemStatus,
      blog: createdBlog,
      product: createdProduct,
      category: category,
      draft,
    });
  } catch (error: any) {
    console.error('Amazon & AI generator API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate product and blog content' },
      { status: 500 }
    );
  }
}
