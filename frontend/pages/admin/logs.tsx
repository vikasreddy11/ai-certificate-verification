import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/analytics/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <Head>
        <title>System Audit Logs - CertiVerify AI</title>
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">System Security & Audit Trail</h1>
        <p className="text-sm text-slate-500">Immutable ledger of administrative actions, credential issuances, revocations, and authentication events.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Retrieving audit ledger...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No audit events recorded yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Action</th>
                <th className="px-6 py-4 text-left">Entity</th>
                <th className="px-6 py-4 text-left">Entity ID</th>
                <th className="px-6 py-4 text-left">Details</th>
                <th className="px-6 py-4 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-semibold text-blue-700 font-mono text-xs">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{log.entity_type}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{log.entity_id || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{log.details || '—'}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

