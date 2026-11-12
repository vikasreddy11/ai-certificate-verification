import React from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>Privacy Policy - CertiVerify AI</title>
      </Head>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
          <p>
            CertiVerify AI complies with international student data protection and privacy standards. We treat educational and identity records with strict zero-knowledge principles where feasible.
          </p>
          <h2 className="text-lg font-bold text-slate-900 pt-2">Data Minimization in QR Codes</h2>
          <p>
            To protect student privacy, our physical and digital QR codes <strong>never encode sensitive personal data</strong> directly in the matrix image. QR codes contain only cryptographic routing pointers and asymmetric verification tokens.
          </p>
          <h2 className="text-lg font-bold text-slate-900 pt-2">Verification Audit Logging</h2>
          <p>
            Every verification request initiated by recruiters or verification personnel is cryptographically stamped and recorded in institutional audit ledgers for compliance and fraud detection.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

