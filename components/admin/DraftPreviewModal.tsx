'use client';

import React from 'react';
import { Eye, ShieldCheck, CheckCircle2, Clock, X, ExternalLink } from 'lucide-react';
import { parseMarkdownToHtml } from '@/lib/markdown';

interface DraftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: {
    title: string;
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    featuredImage?: string;
    content: string;
    conclusion?: string;
    amazonUrl?: string;
    affiliateUrl?: string;
    pros?: string[];
    cons?: string[];
    faqs?: { question: string; answer: string }[];
    specs?: { key: string; value: string }[];
  };
  onPublish?: () => void;
}

export default function DraftPreviewModal({
  isOpen,
  onClose,
  blog,
  onPublish,
}: DraftPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Toolbar */}
        <div className="p-4 sm:px-6 bg-neutral-50 dark:bg-[#1e293b] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              Live Article Preview (Editorial Review Mode)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onPublish && (
              <button
                onClick={onPublish}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20"
              >
                Approve &amp; Publish
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Article Body Preview */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-neutral-50/30 dark:bg-neutral-950">
          {/* Header */}
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Editorial Preview
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
              {blog.title || 'Untitled Draft Article'}
            </h1>
            {blog.metaDescription && (
              <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {blog.metaDescription}
              </p>
            )}

            {/* Author & Disclosure bar */}
            <div className="flex items-center justify-between py-3 border-y border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  T
                </div>
                <span>TechPulse Editorial Team</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Independent Research</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-800">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Specs Table */}
          {blog.specs && blog.specs.length > 0 && (
            <div className="bg-white dark:bg-[#121826] p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {blog.specs.map((s, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-500">{s.key}</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body Content */}
          <div
            className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed text-sm"
            dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(blog.content || '') }}
          />

          {/* Conclusion & CTA */}
          {blog.conclusion && (
            <div className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Final Verdict
              </h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {blog.conclusion}
              </p>
              {blog.amazonUrl && (
                <div className="pt-2">
                  <a
                    href={blog.affiliateUrl || blog.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-900 font-extrabold text-xs shadow-md shadow-amber-500/20"
                  >
                    Check Latest Price on Amazon <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
