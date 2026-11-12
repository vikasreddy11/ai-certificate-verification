import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/analytics/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    if (confirm("Reset and clear synthetic demo data?")) {
      await api.post('/api/admin/demo-data/reset');
      fetchAnalytics();
    }
  };

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <Head>
        <title>Admin Overview - CertiVerify AI</title>
      </Head>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Overview & Analytics</h1>
          <p className="text-sm text-slate-500">Real-time statistics across institutions, verification requests, and cryptographic credentials.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleResetDemo}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold text-slate-700"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Colleges</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{analytics?.total_colleges || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students Enrolled</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{analytics?.total_students || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issued Certificates</span>
            <div className="text-3xl font-extrabold text-blue-600 mt-2">{analytics?.total_certificates || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Attempts</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">{analytics?.total_verification_attempts || 0}</div>
          </div>
        </div>
      )}

      {/* Security Status Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-sm mb-2">Verified Authentic</h3>
          <div className="text-2xl font-bold text-emerald-600">{analytics?.verified_attempts || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Confirmed with Ed25519 cryptographic signatures</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-sm mb-2">Mismatches / Tampering</h3>
          <div className="text-2xl font-bold text-amber-600">{analytics?.mismatches_detected || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Discrepancies identified during OCR scan</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-sm mb-2">Revoked Credentials</h3>
          <div className="text-2xl font-bold text-red-600">{analytics?.total_revoked_certificates || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Revoked by authorized institutions</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

