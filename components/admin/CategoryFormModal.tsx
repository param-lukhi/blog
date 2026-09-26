'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Sparkles } from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';
import { slugify } from '@/lib/utils';
import { AdminCategoryItem } from './CategoryCardGrid';

const EMOJI_PRESETS = [
  { group: 'Tech & Gadgets', emojis: ['💻', '📱', '🎧', '📺', '⚡', '⌚', '📷', '🎮', '🖥️', '🔊', '🔋', '🔌'] },
  { group: 'Home & Lifestyle', emojis: ['🏠', '🍳', '🛋️', '☕', '💡', '🧹', '🪴', '🛏️', '🧴', '👕', '🚲', '🏋️'] },
  { group: 'Shopping & Deals', emojis: ['⭐', '🔥', '💎', '🚀', '🏷️', '🎯', '✨', '👑', '🎁', '🛒', '📦', '🌟'] },
];

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: AdminCategoryItem | null;
  mainCategories: { id: string; name: string }[];
  initialParentId?: string;
  onSaved: () => void;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
  mainCategories,
  initialParentId = '',
  onSaved,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [image, setImage] = useState('');
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || '');
      setDescription(category.description || '');
      setIcon(category.icon || '📁');
      setImage(category.image || '');
      setParentId(category.parentId || '');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIcon('📁');
      setImage('');
      setParentId(initialParentId || '');
    }
  }, [category, initialParentId, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      slug: slug || slugify(name),
      description: description || null,
      icon: icon || '📁',
      image: image || null,
      parentId: parentId || null,
    };

    try {
      if (category?.id) {
        const res = await fetch(`/api/categories/${category.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update category');
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create category');
        }
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/50">
          <div>
            <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">
              {category ? 'Edit Category' : 'Create New Category'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Configure category name, slug hierarchy, and emoji badge icon.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Wireless Audio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Parent Category (Optional - For Subcategories)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              aria-label="Parent Category"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-500"
            >
              <option value="">None (Top-Level Main Category)</option>
              {mainCategories
                .filter((c) => !category || c.id !== category.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    📁 {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Emoji Icon Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Category Emoji Badge
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                className="w-14 text-center text-xl px-2 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-brand-500"
              />
              <span className="text-xs text-neutral-400">Click a preset below or type any emoji:</span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2">
              {EMOJI_PRESETS.map((group, gIdx) => (
                <div key={gIdx} className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase mr-1">
                    {group.group}:
                  </span>
                  {group.emojis.map((em, eIdx) => (
                    <button
                      key={eIdx}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${
                        icon === em ? 'bg-brand-100 dark:bg-brand-900/60 ring-2 ring-brand-500' : ''
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Description (SEO & Category Header)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description about this category..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Banner Image URL (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="px-3 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 text-xs font-bold flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media</span>
              </button>
            </div>
          </div>

          <MediaPickerModal
            isOpen={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onSelect={(url) => setImage(url)}
            title="Select Category Banner Image"
          />

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Category...' : 'Save Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
