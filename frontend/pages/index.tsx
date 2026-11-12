import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Head>
        <title>CertiVerify AI - Enterprise Fake Certificate Detection & Verification Platform</title>
        <meta name="description" content="AI-based and cryptographic certificate verification platform bridging institutions and recruiters." />
      </Head>

      {/* Navigation */}
      <nav className="border-b border-slate-100 px-8 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-md">
            C
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CertiVerify AI</span>
            <span className="text-xs text-blue-600 font-semibold block -mt-1">Tamper-Proof Verification</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition">
            Sign In
          </Link>
          <Link href="/company/upload" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition">
            Verify a Certificate
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Ed25519 Cryptographic Signatures + PaddleOCR Engine</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Eliminate Academic Credential Fraud with <span className="text-blue-600">AI & Cryptography</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          The unified verification bridge connecting universities and hiring companies. Scan signed QR codes or upload documents to cross-examine physical credentials against authoritative institutional registries in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/company/upload"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition"
          >
            Run OCR Document Analysis
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition"
          >
            Access Institution Portal
          </Link>
        </div>
      </header>

      {/* 3-Step Verification Flow */}
      <section className="bg-slate-50 py-20 border-t border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">How CertiVerify AI Works</h2>
            <p className="text-sm text-slate-500 mt-2">End-to-end cryptographic trust architecture from issuance to recruiter validation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center justify-center text-lg mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Institutional Ingestion</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Universities upload student records and issue certificates signed with an asymmetric Ed25519 private key. Each certificate gets an authoritative unique identifier.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center justify-center text-lg mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tamper-Proof QR Generation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The platform generates high-density QR codes embedded with cryptographic route tokens to be printed directly onto degree certificates and official transcripts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center justify-center text-lg mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI & OCR Discrepancy Match</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Recruiters scan the QR code or upload scanned certificates. OpenCV pre-processing and OCR parse candidate details and compare field-by-field against official database records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10 text-center text-xs text-slate-400">
        <p>© 2026 CertiVerify AI. Developed for Enterprise Academic Credential Security.</p>
      </footer>
    </div>
  );
}
