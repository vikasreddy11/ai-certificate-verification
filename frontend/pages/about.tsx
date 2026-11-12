import React from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>About - CertiVerify AI</title>
      </Head>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">About CertiVerify AI</h1>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
          <p>
            <strong>CertiVerify AI</strong> is an enterprise-grade digital credential authentication platform that acts as a secure cryptographic intermediary between higher education institutions and recruiting organizations.
          </p>
          <h2 className="text-xl font-bold text-slate-900 pt-2">The Problem We Solve</h2>
          <p>
            Credential fraud is a multi-billion dollar vulnerability. Fabricated degrees, altered GPA records, forged institutional stamps, and fake diploma mills undermine legitimate candidate achievements and compromise corporate hiring diligence. Traditional manual verification requires weeks of phone calls and registrar paperwork.
          </p>
          <h2 className="text-xl font-bold text-slate-900 pt-2">Our Cryptographic Approach</h2>
          <p>
            CertiVerify AI combines asymmetric <strong>Ed25519 digital signatures</strong> with high-density signed QR codes and state-of-the-art document computer vision (OpenCV & OCR). Rather than relying on easily manipulated static documents, recruiters verify credentials directly against authoritative institutional records in sub-second latency.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

