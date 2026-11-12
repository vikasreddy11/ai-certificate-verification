import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function CompanyHistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/analytics/company/history');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">VERIFIED</span>;
      case 'MISMATCH':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">MISMATCH</span>;
      case 'REVOKED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">REVOKED</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <DashboardLayout role="COMPANY">
      <Head>
        <title>Verification History - CertiVerify AI</title>
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Verification Audit Logs</h1>
        <p className="text-sm text-slate-500">Historical records of candidate credential verifications, scan methods, and discrepancy results.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading audit history...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No verification activity recorded yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Certificate ID</th>
                <th className="px-6 py-4 text-left">Method</th>
                <th className="px-6 py-4 text-left">Status Result</th>
                <th className="px-6 py-4 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{log.certificate_id || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{log.verification_method}</td>
                  <td className="px-6 py-4">{getStatusBadge(log.verification_status)}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
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

