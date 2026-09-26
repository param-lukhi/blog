'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity, Database, Server, RefreshCw, CheckCircle2,
  AlertTriangle, XCircle, Clock, Play, ShieldCheck, Mail,
  Search, ExternalLink, HardDrive, FileText, AlertCircle, Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function AdminSystemHealthPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'jobs' | 'database' | 'errors'>('services');
  const [healthData, setHealthData] = useState<any>(null);
  const [jobsData, setJobsData] = useState<any>(null);
  const [errorsData, setErrorsData] = useState<any>(null);
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);

  const fetchAllData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/system/health').then((r) => r.json()),
      fetch('/api/admin/system/jobs').then((r) => r.json()),
      fetch('/api/admin/system/errors').then((r) => r.json()),
    ])
      .then(([health, jobs, errors]) => {
        if (health.success) setHealthData(health);
        if (jobs.success) setJobsData(jobs);
        if (errors.success) setErrorsData(errors);
      })
      .catch((err) => console.error('Health fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleTriggerJob = async (jobName: string) => {
    setTriggeringJob(jobName);
    try {
      const res = await fetch('/api/admin/system/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobName }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Job trigger error:', err);
    } finally {
      setTriggeringJob(null);
    }
  };

  const handleResolveError = async (errorId: string, status: string) => {
    try {
      await fetch('/api/admin/system/errors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorId, status }),
      });
      fetchAllData();
    } catch (err) {
      console.error('Error update failed:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'HEALTHY' || status === 'COMPLETED') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> {status}
        </span>
      );
    }
    if (status === 'WARNING' || status === 'PARTIAL' || status === 'RUNNING') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[11px] inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {status}
        </span>
      );
    }
    if (status === 'FAILED') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] inline-flex items-center gap-1">
          <XCircle className="w-3 h-3" /> {status}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold text-[11px]">
        {status}
      </span>
    );
  };

  const services = healthData?.services;

  return (
    <div className="space-y-8 pb-16 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" /> Production Operations & Observability
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            System Health & Automated Operations Hub
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Monitor real database latency, automated cron jobs, email delivery, error logs, and provider backup status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-extrabold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Health</span>
          </button>
        </div>
      </div>

      {/* Overall Health Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              healthData?.overallHealth === 'HEALTHY'
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : healthData?.overallHealth === 'WARNING'
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
            }`}
          >
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Overall Production Status
            </div>
            <div className="text-xl font-extrabold text-neutral-900 dark:text-white mt-0.5">
              System State: {healthData?.overallHealth || 'CHECKING'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-neutral-400">DB Latency: </span>
            <strong className="text-emerald-600">{services?.database?.latencyMs ?? 0}ms</strong>
          </div>
          <div className="text-right">
            <span className="text-neutral-400">Open Errors: </span>
            <strong className={errorsData?.criticalErrorsCount > 0 ? 'text-rose-600' : 'text-neutral-700 dark:text-neutral-300'}>
              {errorsData?.criticalErrorsCount ?? 0} Critical
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'services'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Services Health
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'jobs'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Automated Jobs Registry ({jobsData?.jobs?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'database'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Database & Backups
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'errors'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Error Logs ({errorsData?.errors?.length ?? 0})
        </button>
      </div>

      {/* Tab 1: Services Grid */}
      {activeTab === 'services' && services && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Database */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>Neon PostgreSQL</span>
              </div>
              {getStatusBadge(services.database.status)}
            </div>
            <p className="text-xs text-neutral-500">
              Latency: <strong>{services.database.latencyMs}ms</strong> | Serverless connection pool active.
            </p>
          </div>

          {/* Cron & Schedules */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Vercel Cron & Jobs</span>
              </div>
              {getStatusBadge(services.cron.status)}
            </div>
            <p className="text-xs text-neutral-500">
              Cron trigger authorization active via HMAC/Bearer secret.
            </p>
          </div>

          {/* Email Engine */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>Email Provider</span>
              </div>
              {getStatusBadge(services.email.status)}
            </div>
            <p className="text-xs text-neutral-500">{services.email.description}</p>
          </div>

          {/* Affiliate Webhooks */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Affiliate Webhooks</span>
              </div>
              {getStatusBadge(services.affiliateWebhooks.status)}
            </div>
            <p className="text-xs text-neutral-500">
              Endpoint: <code className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-[11px]">{services.affiliateWebhooks.endpoint}</code>
            </p>
          </div>

          {/* Storage */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                <HardDrive className="w-4 h-4 text-indigo-500" />
                <span>Media Storage</span>
              </div>
              {getStatusBadge(services.storage.status)}
            </div>
            <p className="text-xs text-neutral-500">{services.storage.backend}</p>
          </div>

          {/* Search Console */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                <Search className="w-4 h-4 text-emerald-500" />
                <span>Google Search Console</span>
              </div>
              {getStatusBadge(services.searchConsole.status)}
            </div>
            <p className="text-xs text-neutral-500">{services.searchConsole.note}</p>
          </div>
        </div>
      )}

      {/* Tab 2: Automated Jobs Registry */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                Registered Scheduled & Maintenance Jobs
              </h3>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {jobsData?.jobs?.map((j: any) => (
                <div key={j.name} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white font-mono">
                        {j.name}
                      </h4>
                      {getStatusBadge(j.lastStatus)}
                    </div>
                    <p className="text-xs text-neutral-500">{j.description}</p>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      Schedule: {j.schedule} | Last Run: {j.lastRunAt ? new Date(j.lastRunAt).toLocaleString() : 'Never'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTriggerJob(j.name)}
                    disabled={triggeringJob === j.name}
                    className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Play className={`w-3.5 h-3.5 ${triggeringJob === j.name ? 'animate-spin' : ''}`} />
                    <span>{triggeringJob === j.name ? 'Executing...' : 'Run Job Now'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Job Logs Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                Recent Job Execution Audit Trail
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Job Name</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Processed</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4">Run ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {!jobsData?.recentLogs || jobsData.recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-400">
                        No job logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    jobsData.recentLogs.map((l: any) => (
                      <tr key={l.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                        <td className="py-3 px-4">{getStatusBadge(l.status)}</td>
                        <td className="py-3 px-4 font-bold font-mono">{l.jobName}</td>
                        <td className="py-3 px-4 font-mono text-neutral-500">{l.durationMs ? `${l.durationMs}ms` : '-'}</td>
                        <td className="py-3 px-4 font-mono">{l.recordsProcessed}</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{l.recordsUpdated}</td>
                        <td className="py-3 px-4 font-mono text-neutral-400 text-[11px] truncate max-w-[120px]">{l.runId}</td>
                        <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">{new Date(l.startedAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Database & Backup Center */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4">
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
              Database Table Metrics & Row Counts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {services?.database?.tables &&
                Object.entries(services.database.tables).map(([tbl, cnt]: any) => (
                  <div key={tbl} className="bg-neutral-50 dark:bg-neutral-800 p-3.5 rounded-2xl">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{tbl}</div>
                    <div className="text-xl font-extrabold text-neutral-900 dark:text-white font-mono mt-1">{cnt}</div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-4">
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Production Backup & Recovery Architecture</span>
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-2">
              <p>
                <strong>Provider-Managed Continuous Recovery: </strong>
                BlogWeb904 uses Neon Serverless PostgreSQL, which includes continuous write-ahead log (WAL) archiving and Point-in-Time Recovery (PITR).
              </p>
              <p>
                <strong>Manual Restore Procedure: </strong>
                To restore from a previous point in time, access the Neon Console &rarr; Branches &rarr; Create Branch from Timestamp. No destructive restore actions are executed directly through browser clients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Error Logs */}
      {activeTab === 'errors' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Application Error Stream (Sanitized & Redacted)
            </h3>
          </div>

          {!errorsData?.errors || errorsData.errors.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              No errors logged. All application and cron services are running normally.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {errorsData.errors.map((err: any) => (
                <div key={err.id} className="p-6 space-y-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          err.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {err.severity}
                      </span>
                      <span className="font-bold text-xs text-neutral-900 dark:text-white font-mono">
                        Source: {err.source}
                      </span>
                      <span className="text-[10px] text-neutral-400">[{err.status}]</span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-xl">
                      {err.message}
                    </p>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      Logged at: {new Date(err.createdAt).toLocaleString()} {err.requestPath ? `| Path: ${err.requestPath}` : ''}
                    </div>
                  </div>

                  {err.status === 'OPEN' && (
                    <button
                      type="button"
                      onClick={() => handleResolveError(err.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold self-start cursor-pointer"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
