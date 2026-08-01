'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import { slugify } from '@/lib/utils';
import { Save, ArrowLeft, Plus, Trash, Zap } from 'lucide-react';

export default function NewBlogPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80');
  const [content, setContent] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [tagsStr, setTagsStr] = useState('Tech, Review, Deals');

  // Dynamic Array Fields
  const [pros, setPros] = useState<string[]>(['Exceptional build quality', 'Long battery life']);
  const [cons, setCons] = useState<string[]>(['Higher price tag']);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([
    { question: 'Is this product worth buying in 2026?', answer: 'Yes, it delivers excellent performance and build quality.' }
  ]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Warranty', value: '1 Year Manufacturer' },
    { key: 'Connectivity', value: 'Bluetooth 5.3 / USB-C' }
  ]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setCategoryId(data[0].id);
        }
      });
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) setSlug(slugify(val));
    if (!metaTitle) setMetaTitle(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim()) specObj[s.key.trim()] = s.value.trim();
    });

    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);

    const payload = {
      title,
      slug: slug || slugify(title),
      metaTitle: metaTitle || title,
      metaDescription,
      categoryId,
      featuredImage,
      content,
      amazonUrl,
      affiliateUrl: affiliateUrl || amazonUrl,
      conclusion,
      status,
      specifications: specObj,
      pros: pros.filter(Boolean),
      cons: cons.filter(Boolean),
      faqs: faqs.filter((f) => f.question.trim()),
      tags,
    };

    const res = await fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/admin/blogs');
    } else {
      alert('Failed to save blog post.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      {/* Header Bar */}
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
            <h1 className="text-2xl font-extrabold text-neutral-900">Create New Product Blog</h1>
            <p className="text-xs text-neutral-500">Every blog field is fully editable.</p>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Blog Post</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main 2-Col: Editor & Core Fields */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Title & Slug */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Blog Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="e.g. Apple iPhone 15 Pro Max Review: Best Flagship of 2026"
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

          {/* WordPress-like Rich Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">Detailed Article Content (Rich Editor) *</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          {/* Pros & Cons Section */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm">Pros & Cons Checklist</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-2">Pros (Positive Highlights)</label>
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
                <label className="block text-xs font-bold text-rose-700 mb-2">Cons (Drawbacks)</label>
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

          {/* FAQs Section */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-sm">Frequently Asked Questions (FAQs)</h3>
              <button
                type="button"
                onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                className="text-xs text-brand-600 font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add FAQ
              </button>
            </div>

            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 relative">
                <input
                  type="text"
                  placeholder="Question..."
                  value={faq.question}
                  onChange={(e) => {
                    const newFaqs = [...faqs];
                    newFaqs[idx].question = e.target.value;
                    setFaqs(newFaqs);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold"
                />
                <textarea
                  placeholder="Answer..."
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => {
                    const newFaqs = [...faqs];
                    newFaqs[idx].answer = e.target.value;
                    setFaqs(newFaqs);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar 1-Col: Affiliate Links, Meta & Publishing */}
        <div className="space-y-6">
          
          {/* Status & Save */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">Publication Status</h3>
            
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

          {/* Amazon Affiliate Link */}
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
                placeholder="https://www.amazon.com/dp/..."
                className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">Tagged Affiliate Link</label>
              <input
                type="url"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://www.amazon.com/dp/...?tag=yourtag-20"
                className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white"
              />
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">SEO Meta Data</h3>

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

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs"
              />
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
