import React from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>Terms of Service - CertiVerify AI</title>
      </Head>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
          <p>
            By accessing the CertiVerify AI platform, educational institutions and corporate verifiers agree to uphold ethical credential verification standards and prevent unauthorized document alteration.
          </p>
          <h2 className="text-lg font-bold text-slate-900 pt-2">Authoritative Source Policy</h2>
          <p>
            The official institutional database and signed digital signatures serve as the authoritative standard of truth. AI and OCR text extractions are investigative tools designed to detect discrepancies, but do not replace certified institutional registries.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

