'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import { safeJsonParse } from '@/lib/utils';
import { Save, ArrowLeft, Plus, Trash, Zap, ExternalLink } from 'lucide-react';

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [content, setContent] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [tagsStr, setTagsStr] = useState('');
  const [views, setViews] = useState(0);


  // Dynamic Array Fields
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      });

    fetch(`/api/blogs/${params.id}`)
      .then((res) => res.json())
      .then((blog) => {
        if (blog.id) {
          setTitle(blog.title || '');
          setSlug(blog.slug || '');
          setMetaTitle(blog.metaTitle || '');
          setMetaDescription(blog.metaDescription || '');
          setCategoryId(blog.categoryId || '');
          setFeaturedImage(blog.featuredImage || '');
          setContent(blog.content || '');
          setAmazonUrl(blog.amazonUrl || '');
          setAffiliateUrl(blog.affiliateUrl || '');
          setConclusion(blog.conclusion || '');
          setStatus(blog.status || 'PUBLISHED');
          setViews(blog.views || 0);

          const tags = safeJsonParse<string[]>(blog.tags, []);
          setTagsStr(tags.join(', '));

          const pList = safeJsonParse<string[]>(blog.pros, []);
          setPros(pList);

          const cList = safeJsonParse<string[]>(blog.cons, []);
          setCons(cList);

          const fList = safeJsonParse<{ question: string; answer: string }[]>(blog.faqs, []);
          setFaqs(fList);

          const sObj = safeJsonParse<Record<string, string>>(blog.specifications, {});
          const sArr = Object.entries(sObj).map(([k, v]) => ({ key: k, value: v }));
          setSpecs(sArr);
        }
        setLoading(false);
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim()) specObj[s.key.trim()] = s.value.trim();
    });

    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);

    const payload = {
      title,
      slug,
      metaTitle,
      metaDescription,
      categoryId,
      featuredImage,
      content,
      amazonUrl,
      affiliateUrl,
      conclusion,
      status,
      specifications: specObj,
      pros: pros.filter(Boolean),
      cons: cons.filter(Boolean),
      faqs: faqs.filter((f) => f.question.trim()),
      tags,
    };

    const res = await fetch(`/api/blogs/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert('Blog updated successfully!');
      router.push('/admin/blogs');
    } else {
      alert('Failed to update blog post.');
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-500 font-medium">Loading blog data for editing...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-neutral-900">Edit Product Blog</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-extrabold text-xs border border-brand-200">
                👁️ {views.toLocaleString()} Views
              </span>
            </div>
            <p className="text-xs text-neutral-500">ID: {params.id}</p>
          </div>
        </div>


        <div className="flex items-center gap-3">
          <a
            href={`/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live</span>
          </a>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Update Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Blog Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm font-bold text-neutral-900 outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-mono outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs outline-none focus:border-brand-500 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">Detailed Article Content (Rich Editor) *</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm">Pros & Cons Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-2">Pros</label>
                {pros.map((p, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => {
                        const newPros = [...pros];
                        newPros[idx] = e.target.value;
                        setPros(newPros);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setPros(pros.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPros([...pros, ''])}
                  className="text-xs text-brand-600 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" /> Add Pro
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-700 mb-2">Cons</label>
                {cons.map((c, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => {
                        const newCons = [...cons];
                        newCons[idx] = e.target.value;
                        setCons(newCons);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setCons(cons.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCons([...cons, ''])}
                  className="text-xs text-brand-600 font-bold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" /> Add Con
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">Status & Image</h3>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-bold outline-none bg-white"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Featured Image URL</label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs"
              />
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Amazon Affiliate Link</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">Amazon Product URL *</label>
              <input
                type="url"
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">Tagged Affiliate Link</label>
              <input
                type="url"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">SEO Metadata</h3>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
