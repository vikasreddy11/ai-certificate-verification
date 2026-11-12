import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

export default function LandingPage() {
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch live analytics if available
      const res = await api.get('/api/analytics/admin/analytics');
      setStats(res.data);
    } catch (e) {
      // Fallback demo statistics
      setStats({
        total_colleges: 3,
        total_students: 50,
        total_certificates: 50,
        total_verification_attempts: 142,
        verified_attempts: 128,
        mismatches_detected: 14,
        is_demo: true,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
      <Head>
        <title>CertiVerify AI - Enterprise Fake Certificate Detection & Verification Platform</title>
        <meta
          name="description"
          content="AI-based and cryptographic certificate verification platform bridging institutions and recruiters with Ed25519 digital signatures and OCR discrepancy detection."
        />
      </Head>

      {/* Modern SaaS Navigation */}
      <Navbar activePage="home" />

      <main className="flex-1">
        {/* HERO SECTION */}
        <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200/80 rounded-full text-xs font-semibold text-blue-700 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Ed25519 Asymmetric Signatures + OpenCV & PaddleOCR Analysis</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Eliminate Academic Credential Fraud with{' '}
            <span className="text-blue-600 inline-block">AI & Cryptography</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            The unified verification bridge connecting universities and hiring companies. Scan signed QR codes or upload documents to cross-examine physical credentials against authoritative institutional registries in seconds.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <Link
              href="/verify?tab=qr"
              className="w-full sm:w-auto px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition flex items-center justify-center space-x-2.5"
            >
              <span>📷</span>
              <span>Scan QR Code</span>
            </Link>

            <Link
              href="/verify?tab=upload"
              className="w-full sm:w-auto px-7 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition flex items-center justify-center space-x-2.5"
            >
              <span>📄</span>
              <span>Upload Certificate</span>
            </Link>

            <Link
              href="/portal/institution"
              className="w-full sm:w-auto px-7 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition flex items-center justify-center space-x-2"
            >
              <span>🏛️</span>
              <span>Institution Portal</span>
            </Link>
          </div>

          {/* Quick Subtext Trust Signal */}
          <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Tamper-evident QR Tokens</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Multi-field OCR Comparison</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Instant Public Validation</span>
            </span>
          </div>
        </header>

        {/* 4-STAGE 'HOW IT WORKS' WORKFLOW */}
        <section id="how-it-works" className="bg-slate-50 py-20 border-t border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold tracking-wider mb-2 inline-block">
                Trust Architecture
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                How CertiVerify AI Operates
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Four interlocking stages preventing academic credential forgery from generation to employer verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stage 1 */}
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition group">
                <div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center justify-center text-lg mb-5 group-hover:bg-blue-600 group-hover:text-white transition">
                    1
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Institutional Data Submission
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Partner universities securely enroll student records individually or via bulk CSV imports. The institution establishes the sole authoritative ground truth.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600">
                  Role: College Administrator
                </div>
              </div>

              {/* Stage 2 */}
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition group">
                <div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center justify-center text-lg mb-5 group-hover:bg-blue-600 group-hover:text-white transition">
                    2
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Signed QR Generation
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The backend generates an authoritative unique Certificate ID and signs the metadata using asymmetric Ed25519 cryptography, producing a high-density tamper-evident QR code.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600">
                  Security: Ed25519 Signature
                </div>
              </div>

              {/* Stage 3 */}
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition group">
                <div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center justify-center text-lg mb-5 group-hover:bg-blue-600 group-hover:text-white transition">
                    3
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Recruiter Camera Scanning
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Recruiters scan the printed QR code using device cameras or query the unique ID directly. The system immediately checks certificate revocation and signature integrity.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600">
                  Speed: Sub-second Query
                </div>
              </div>

              {/* Stage 4 */}
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition group">
                <div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center justify-center text-lg mb-5 group-hover:bg-blue-600 group-hover:text-white transition">
                    4
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    AI/OCR Field Verification
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    When digital scans or PDFs are uploaded, OpenCV pre-processing and PaddleOCR extract candidate fields, comparing every string against the database to flag discrepancies.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-600">
                  Engine: OpenCV & PaddleOCR
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SAMPLE VERIFICATION RESULT PREVIEW COMPONENT */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold tracking-wider mb-2 inline-block">
              Interactive Preview
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sample Verification Report
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Here is how candidates and employers review genuine vs. tampered credentials in CertiVerify AI.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
                  C
                </div>
                <div>
                  <span className="text-base font-bold block">Official Verification Audit</span>
                  <span className="text-xs font-mono text-blue-400">ID: CERT-AIT-2026-00001</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs rounded-full font-bold uppercase tracking-wider inline-flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>VERIFIED AUTHENTIC</span>
                </span>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] rounded-full font-semibold">
                  DEMO DATA
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left detail column */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Candidate Student Name:</span>
                    <span className="font-bold text-slate-900">Alexander Vance</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Roll / Registration Number:</span>
                    <span className="font-mono font-bold text-slate-900">AIT-2022-0001</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Awarding Institution:</span>
                    <span className="font-semibold text-slate-900">Apex Institute of Technology</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Degree / Program:</span>
                    <span className="font-semibold text-slate-900">Bachelor of Technology (Computer Science)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Graduation Year:</span>
                    <span className="font-bold text-slate-900">2026</span>
                  </div>
                </div>

                {/* Right security column */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Cryptographic Integrity Analysis
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Ed25519 Asymmetric Signature:</span>
                    <span className="text-emerald-700 font-bold font-mono">VALID & MATCHED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Revocation Status:</span>
                    <span className="text-emerald-700 font-bold font-mono">ACTIVE (NOT REVOKED)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Field Matching Score:</span>
                    <span className="text-emerald-700 font-bold font-mono">100% (5/5 MATCHED)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    Fingerprint Token:{' '}
                    <code className="text-blue-700 font-mono">
                      4b1f4a9b6c4e2a8f9c1b3d5e7f0a2c4e
                    </code>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-4">
                <span className="text-xs text-slate-500">
                  Ready to test with your own certificate or sample credentials?
                </span>
                <Link
                  href="/verify"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Launch Verification Hub →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ANALYTICS PREVIEW SECTION */}
        <section className="bg-slate-900 text-white py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs uppercase px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded-full font-bold tracking-wider mb-2 inline-block">
                  Live Network Telemetry
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight">Platform Trust Dashboard</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Global verification metrics across certified educational partners.
                </p>
              </div>

              <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-lg self-start md:self-auto">
                DEMO DATABASE METRICS ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Colleges & Universities
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white mt-2 block">
                  {statsLoading ? '...' : stats?.total_colleges || 3}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">Active institutional partners</span>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Enrolled Students
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-400 mt-2 block">
                  {statsLoading ? '...' : stats?.total_students || 50}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">Roster verified profiles</span>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Signed Credentials
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-2 block">
                  {statsLoading ? '...' : stats?.total_certificates || 50}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">Tamper-proof signed QR codes</span>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Verifications Executed
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-purple-400 mt-2 block">
                  {statsLoading ? '...' : stats?.total_verification_attempts || 142}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">Logged candidate validations</span>
              </div>
            </div>
          </div>
        </section>

        {/* PORTAL ENTRY CARDS */}
        <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-bold tracking-wider mb-2 inline-block">
              Tailored Portals
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Choose Your Dedicated Portal
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Select your organization type to access specialized credential management tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Institution Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold rounded-2xl flex items-center justify-center text-2xl mb-6">
                  🏛️
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Educational Institutions</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  For registrars, colleges, and university examination boards to enroll cohorts, digitally sign degrees, and distribute high-res QR codes.
                </p>
              </div>
              <Link
                href="/portal/institution"
                className="w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition"
              >
                Access Institution Portal →
              </Link>
            </div>

            {/* Recruiter Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-purple-100 text-purple-600 font-bold rounded-2xl flex items-center justify-center text-2xl mb-6">
                  💼
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Companies & Recruiters</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  For HR teams and background check agencies to scan credentials, upload candidate transcripts, and detect discrepancies with AI/OCR.
                </p>
              </div>
              <Link
                href="/portal/company"
                className="w-full text-center py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition"
              >
                Access Recruiter Portal →
              </Link>
            </div>

            {/* Super Admin Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-slate-100 text-slate-800 font-bold rounded-2xl flex items-center justify-center text-2xl mb-6">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Super Administrator</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  For platform administrators to oversee registered institutions, inspect system audit logs, configure security keys, and reset demo data.
                </p>
              </div>
              <Link
                href="/portal/admin"
                className="w-full text-center py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition"
              >
                Access Admin Console →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
