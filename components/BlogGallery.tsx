'use client';

import React, { useState } from 'react';
import { Camera, Sparkles, ShieldCheck, ChevronLeft, ChevronRight, Maximize2, X, CheckCircle2 } from 'lucide-react';

interface BlogGalleryProps {
  images: string[];
  title: string;
  brand?: string;
  categoryName?: string;
}

export default function BlogGallery({ images, title, brand, categoryName }: BlogGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Clean images array
  const cleanImages = (images && images.length > 0)
    ? images.filter((img) => typeof img === 'string' && img.trim().length > 0)
    : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80'];

  const activeImage = cleanImages[activeIndex] || cleanImages[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % cleanImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + cleanImages.length) % cleanImages.length);
  };

  return (
    <div className="mb-10 space-y-4">
      {/* Main Image Showcase Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-100 to-neutral-200/60 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-200/80 dark:border-neutral-800 shadow-md group">
        
        {/* Floating Verified Trust Badges */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px] shadow-sm border border-neutral-200/60 dark:border-neutral-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Hardware Data
          </span>
          {brand && (
            <span className="px-3 py-1.5 rounded-full bg-neutral-900/80 dark:bg-neutral-800/80 backdrop-blur-md text-white font-bold text-[11px] shadow-sm">
              {brand}
            </span>
          )}
        </div>

        {/* Floating Zoom & Gallery Count Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {cleanImages.length > 1 && (
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[11px] font-bold">
              {activeIndex + 1} / {cleanImages.length}
            </span>
          )}
          <button
            onClick={() => setLightboxOpen(true)}
            aria-label="View Fullscreen Lightbox"
            className="p-2 rounded-full bg-white/90 dark:bg-neutral-900/90 hover:bg-white text-neutral-800 dark:text-neutral-200 shadow-sm border border-neutral-200/60 dark:border-neutral-700 transition-transform active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Image Container */}
        <div 
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center p-4 sm:p-8 cursor-zoom-in"
        >
          <img
            src={activeImage}
            alt={`${title} - Photo ${activeIndex + 1}`}
            className="max-h-full max-w-full object-contain rounded-2xl transition-all duration-500 group-hover:scale-[1.02] drop-shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Carousel Navigation Arrows */}
        {cleanImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous Image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-900/90 hover:bg-white text-neutral-800 dark:text-white shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 border border-neutral-200/60 dark:border-neutral-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-900/90 hover:bg-white text-neutral-800 dark:text-white shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 border border-neutral-200/60 dark:border-neutral-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {cleanImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
          {cleanImages.map((img, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-20 h-16 sm:w-24 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all p-1 bg-white dark:bg-neutral-900 ${
                  isSelected
                    ? 'border-brand-600 dark:border-brand-500 shadow-md scale-105 ring-2 ring-brand-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 opacity-70 hover:opacity-100 hover:border-neutral-400'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain rounded-xl"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <span className="text-white text-xs font-mono">
              {activeIndex + 1} / {cleanImages.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={title}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />

            {cleanImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
