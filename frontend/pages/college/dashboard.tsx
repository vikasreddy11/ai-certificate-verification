import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function CollegeDashboard() {
  const [studentsCount, setStudentsCount] = useState(0);
  const [certsCount, setCertsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stuRes, certRes] = await Promise.all([
        api.get('/api/students'),
        api.get('/api/certificates'),
      ]);
      setStudentsCount(stuRes.data.length);
      setCertsCount(certRes.data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="COLLEGE_ADMIN">
      <Head>
        <title>Institution Dashboard - CertiVerify AI</title>
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Institution Control Center</h1>
        <p className="text-sm text-slate-500">Manage enrolled student rosters, generate Ed25519-signed credentials, and download QR codes.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{studentsCount}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issued Certificates</span>
            <div className="text-3xl font-extrabold text-blue-600 mt-2">{certsCount}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security State</span>
            <div className="text-xl font-bold text-emerald-600 mt-2">Ed25519 Active</div>
          </div>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-1">Student Enrollment</h3>
          <p className="text-xs text-slate-500 mb-4">Add single student entries or bulk upload records via CSV.</p>
          <a
            href="/college/students"
            className="inline-block px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
          >
            Go to Student Directory →
          </a>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-1">Issue Credentials & QR</h3>
          <p className="text-xs text-slate-500 mb-4">Digitally sign degrees and generate high-density tamper-evident QR codes.</p>
          <a
            href="/college/certificates"
            className="inline-block px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
          >
            Open Certificate Vault →
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}

