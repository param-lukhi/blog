'use client';

import React, { useState, useEffect } from 'react';
import {
  History, Search, Filter, RefreshCw, Calendar, User,
  FileText, ShoppingBag, DollarSign, ShieldAlert, ArrowLeft, ArrowRight
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface ActivityLogItem {
  id: string;
  userName?: string;
  userEmail?: string | null;
  adminEmail?: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  summary?: string;
  metadata?: string | null;
  details?: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const fetchLogs = async (targetPage = 1) => {
    setLoading(true);
    try {
      const url = new URL('/api/activity', window.location.origin);
      url.searchParams.set('page', String(targetPage));
      url.searchParams.set('limit', '25');
      if (selectedAction) url.searchParams.set('action', selectedAction);
      if (selectedEntity) url.searchParams.set('entity', selectedEntity);
      if (adminEmail) url.searchParams.set('adminEmail', adminEmail);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (e) {
      console.error('Error fetching logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [selectedAction, selectedEntity]);

  const getActionBadge = (action: string) => {
    if (action.includes('CREATED')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">CREATED</span>;
    }
    if (action.includes('UPDATED') || action.includes('VERIFIED')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">{action}</span>;
    }
    if (action.includes('PUBLISHED')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">PUBLISHED</span>;
    }
    if (action.includes('DELETED')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">DELETED</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">{action}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Admin Activity Audit Log
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Complete immutable audit trail of administrative modifications, price verifications, and publishing events.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(page)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Log
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121826] p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="w-full sm:w-auto flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Filter by Admin Email..."
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)}
            className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs"
          />
        </div>

        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold"
        >
          <option value="">All Entities</option>
          <option value="Blog">Blog</option>
          <option value="Product">Product</option>
          <option value="ProductPrice">ProductPrice</option>
          <option value="ProductResearch">ProductResearch</option>
          <option value="Store">Store</option>
          <option value="Media">Media</option>
        </select>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold"
        >
          <option value="">All Actions</option>
          <option value="BLOG_CREATED">BLOG_CREATED</option>
          <option value="BLOG_PUBLISHED">BLOG_PUBLISHED</option>
          <option value="BLOG_UPDATED">BLOG_UPDATED</option>
          <option value="BLOG_DELETED">BLOG_DELETED</option>
          <option value="PRICE_UPDATED">PRICE_UPDATED</option>
          <option value="PRICE_VERIFIED">PRICE_VERIFIED</option>
          <option value="PRODUCT_RESEARCH_CREATED">PRODUCT_RESEARCH_CREATED</option>
          <option value="STORE_UPDATED">STORE_UPDATED</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-[#121826] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <History className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">No activity logged yet</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Administrative actions like blog publishing, product updates, and price verifications will be recorded automatically here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300">
                  <th className="py-3.5 px-4 font-bold">Timestamp</th>
                  <th className="py-3.5 px-4 font-bold">Admin User</th>
                  <th className="py-3.5 px-4 font-bold">Action</th>
                  <th className="py-3.5 px-4 font-bold">Entity</th>
                  <th className="py-3.5 px-4 font-bold">Details</th>
                  <th className="py-3.5 px-4 font-bold">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {logs.map((log) => {
                  let detailsObj: any = null;
                  try {
                    const raw = log.metadata || log.details;
                    if (raw) detailsObj = JSON.parse(raw);
                  } catch {}

                  const userDisplay = log.userEmail || log.adminEmail || log.userName || 'Admin';
                  const summaryText = log.summary || (detailsObj ? JSON.stringify(detailsObj) : (log.details || '-'));

                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                        {userDisplay}
                      </td>
                      <td className="py-3 px-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">
                        {log.entity} {log.entityId ? <span className="text-[10px] text-neutral-400 font-mono">({log.entityId.slice(0, 8)}...)</span> : ''}
                      </td>
                      <td className="py-3 px-4 max-w-sm text-neutral-600 dark:text-neutral-300 break-words font-mono text-[11px]">
                        {summaryText}
                      </td>
                      <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                        {log.ipAddress || 'system'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <div>
              Showing {logs.length} of {totalCount} log records
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => fetchLogs(page - 1)}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-neutral-900 dark:text-white px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchLogs(page + 1)}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-40"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
