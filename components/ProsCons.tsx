import React from 'react';
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

interface ProsConsProps {
  pros: string[];
  cons: string[];
}

export default function ProsCons({ pros, cons }: ProsConsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
      {/* Pros Card */}
      <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 dark:border-emerald-800/60">
          <div className="flex items-center gap-2 font-extrabold text-emerald-900 dark:text-emerald-300 text-base">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
            </div>
            <span>PROS (Key Strengths)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold">
            {pros.length} Highlights
          </span>
        </div>

        <ul className="space-y-3 text-sm text-neutral-800 dark:text-neutral-200">
          {pros.map((pro, i) => (
            <li key={i} className="flex items-start gap-2.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-medium">{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons Card */}
      <div className="bg-gradient-to-br from-rose-50/90 to-red-50/50 dark:from-rose-950/40 dark:to-red-950/20 border border-rose-200/80 dark:border-rose-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-200/60 dark:border-rose-800/60">
          <div className="flex items-center gap-2 font-extrabold text-rose-900 dark:text-rose-300 text-base">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ThumbsDown className="w-4 h-4" />
            </div>
            <span>CONS (Trade-Offs & Limits)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 text-[11px] font-extrabold">
            {cons.length} Points
          </span>
        </div>

        <ul className="space-y-3 text-sm text-neutral-800 dark:text-neutral-200">
          {cons.map((con, i) => (
            <li key={i} className="flex items-start gap-2.5 leading-relaxed">
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium">{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
