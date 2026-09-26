'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Upload, Check, Image as ImageIcon, Trash, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: MediaAsset) => void;
  title?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Image from Media Library',
}: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAssets(data);
        }
      } else {
        setErrorMsg('Failed to load media assets.');
      }
    } catch {
      setErrorMsg('Network error while loading media assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setAssets((prev) => [data, ...prev]);
        setSelectedUrl(data.url);
      } else {
        setErrorMsg(data.error || 'Upload failed.');
      }
    } catch {
      setErrorMsg('Upload request failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  const filteredAssets = assets.filter((a) =>
    a.filename.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmSelect = () => {
    if (selectedUrl) {
      const asset = assets.find((a) => a.url === selectedUrl);
      onSelect(selectedUrl, asset);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#121826] border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">{title}</h2>
              <p className="text-xs text-neutral-500">Choose an image from your library or upload a new one.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Upload Bar */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search images by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>

          <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all shrink-0">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload New File'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Media Grid Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-16 text-neutral-400 text-xs">Loading media assets...</div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mx-auto flex items-center justify-center font-bold text-xl">
                🖼️
              </div>
              <p className="text-xs text-neutral-500">No media assets found. Upload your first image above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => {
                const isSelected = selectedUrl === asset.url;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedUrl(asset.url)}
                    className={`group relative rounded-2xl border p-2 cursor-pointer transition-all overflow-hidden space-y-2 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/30'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="aspect-square rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden relative">
                      <img
                        src={asset.url}
                        alt={asset.filename}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 px-1">
                      <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                        {asset.filename}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {(asset.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-500 truncate max-w-sm">
            {selectedUrl ? (
              <span className="text-blue-600 dark:text-blue-400 font-semibold truncate">
                Selected: {selectedUrl.slice(0, 45)}...
              </span>
            ) : (
              'Click an image to select'
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={handleConfirmSelect}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all"
            >
              Use Selected Image
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
