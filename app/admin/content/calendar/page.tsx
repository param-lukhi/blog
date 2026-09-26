'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar, Sparkles, CheckCircle2, AlertCircle, FileText,
  RefreshCw, ArrowUpRight, ShieldCheck, Compass
} from 'lucide-react';

export default function ContentCalendarPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCalendar = () => {
    setLoading(true);
    fetch('/api/admin/content/calendar')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Content Editorial Calendar</h1>
          </div>
          <p className="text-sm text-slate-400">
            Publishing timeline, review schedules, and daily top-3 content opportunities.
          </p>
        </div>

        <button
          onClick={fetchCalendar}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Pipeline
        </button>
      </div>

      {/* Daily Recommendations Panel (Max 3) */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Daily Content Recommendations</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Top 3 Opportunities Today
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-6 text-slate-500">Loading daily recommendations...</div>
          ) : !data?.dailyRecommendations || data.dailyRecommendations.length === 0 ? (
            <div className="col-span-3 text-center py-6 text-slate-400 text-sm">
              All immediate high-priority content gaps covered.
            </div>
          ) : (
            data.dailyRecommendations.map((rec: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {rec.opportunityType}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                      {rec.priority}
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm leading-snug">{rec.topic}</div>
                  <p className="text-xs text-slate-400 mt-1">{rec.reason}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-amber-300 flex items-start gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                  <span>{rec.verificationReminder}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Content Event Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Recent Editorial Events</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading timeline...</div>
        ) : !data?.calendarEvents || data.calendarEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No articles recorded.</div>
        ) : (
          <div className="divide-y divide-slate-800 text-sm">
            {data.calendarEvents.map((ev: any) => (
              <div key={ev.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-medium text-white">{ev.title}</div>
                    <div className="text-xs font-mono text-slate-500">/blog/{ev.slug}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    ev.status === 'PUBLISHED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : ev.status === 'DRAFT'
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {ev.status}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(ev.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
