import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function CompanyDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/api/analytics/company/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalChecks = history.length;
  const verifiedCount = history.filter((h) => h.verification_status === 'VERIFIED').length;
  const mismatchCount = history.filter((h) => h.verification_status === 'MISMATCH').length;

  return (
    <DashboardLayout role="COMPANY">
      <Head>
        <title>Recruiter Dashboard - CertiVerify AI</title>
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Recruiter Verification Center</h1>
        <p className="text-sm text-slate-500">Scan QR codes on academic certificates or upload document scans for instant AI/OCR verification.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Credentials Verified</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalChecks}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Authentic Credentials</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">{verifiedCount}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Discrepancies / Mismatches</span>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">{mismatchCount}</div>
          </div>
        </div>
      )}

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4">
              📷
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Scan Physical QR Code</h3>
            <p className="text-sm text-slate-500 mb-6">Use your webcam/mobile camera or enter a Certificate ID directly to query the institutional blockchain registry.</p>
          </div>
          <a
            href="/company/scan"
            className="w-full text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Launch QR Scanner →
          </a>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4">
              📄
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">AI & OCR File Verification</h3>
            <p className="text-sm text-slate-500 mb-6">Upload certificate images (JPG, PNG) or PDFs to execute OpenCV document pre-processing and field-by-field matching.</p>
          </div>
          <a
            href="/company/upload"
            className="w-full text-center py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Upload Certificate Document →
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}

