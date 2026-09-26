'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, Plus, RefreshCw, X } from 'lucide-react';

export default function IncidentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [affectedSystem, setAffectedSystem] = useState('DATABASE');
  const [rootCause, setRootCause] = useState('');

  // Update states
  const [updateStatus, setUpdateStatus] = useState('OPEN');
  const [updateResolution, setUpdateResolution] = useState('');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system/incidents');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/system/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, severity, affectedSystem, rootCause }),
      });
      setShowCreateModal(false);
      setTitle('');
      setRootCause('');
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    try {
      await fetch('/api/admin/system/incidents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedIncident.id,
          status: updateStatus,
          resolution: updateResolution,
        }),
      });
      setSelectedIncident(null);
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-orange-500/15 text-orange-400 border border-orange-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-800 text-slate-400 border border-slate-700">LOW</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Open</span>;
      case 'INVESTIGATING':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Investigating</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved</span>;
      case 'CLOSED':
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">Closed</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Operational Incident Center</h1>
          </div>
          <p className="text-sm text-slate-400">
            Track operational anomalies, service degradation, external API outages, and resolution timelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Log Incident
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : data ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Recorded</span>
              <div className="mt-2 text-3xl font-extrabold text-white">{data.summary?.total || 0}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active & Investigating</span>
              <div className="mt-2 text-3xl font-extrabold text-amber-400">
                {(data.summary?.openCount || 0) + (data.summary?.investigatingCount || 0)}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Open</span>
              <div className="mt-2 text-3xl font-extrabold text-rose-400">{data.summary?.criticalCount || 0}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Successfully Resolved</span>
              <div className="mt-2 text-3xl font-extrabold text-emerald-400">{data.summary?.resolvedCount || 0}</div>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Incident Timeline</h2>
            </div>
            {data.incidents?.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">Zero Active Incidents</h3>
                <p className="text-sm text-slate-400 mt-1">All production subsystems are running normally.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/60 text-xs font-bold text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Incident Title</th>
                      <th className="px-4 py-3">Affected System</th>
                      <th className="px-4 py-3">Started</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.incidents?.map((inc: any) => (
                      <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">{getSeverityBadge(inc.severity)}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-white text-xs">{inc.title}</div>
                          {inc.rootCause && (
                            <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">{inc.rootCause}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-300">{inc.affectedSystem}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{new Date(inc.startedAt).toLocaleString()}</td>
                        <td className="px-4 py-3">{getStatusBadge(inc.status)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedIncident(inc);
                              setUpdateStatus(inc.status);
                              setUpdateResolution(inc.resolution || '');
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Log Operational Incident</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neon connection latency spike"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">System</label>
                  <select
                    value={affectedSystem}
                    onChange={(e) => setAffectedSystem(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DATABASE">DATABASE</option>
                    <option value="SEARCH_CONSOLE">SEARCH CONSOLE</option>
                    <option value="AFFILIATE">AFFILIATE</option>
                    <option value="EMAIL">EMAIL</option>
                    <option value="CRON">CRON</option>
                    <option value="API">API</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Root Cause / Description</label>
                <textarea
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  rows={3}
                  placeholder="Describe root cause and observed symptoms..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg"
                >
                  Save Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Incident Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Update Incident Status</h3>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <div className="text-xs text-slate-400">Incident:</div>
                <div className="text-sm font-bold text-white mt-0.5">{selectedIncident.title}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Resolution Summary</label>
                <textarea
                  value={updateResolution}
                  onChange={(e) => setUpdateResolution(e.target.value)}
                  rows={3}
                  placeholder="Detail the fix or resolution applied..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
