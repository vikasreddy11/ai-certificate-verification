import React, { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>Contact & Support - CertiVerify AI</title>
      </Head>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Get in Touch</h1>
        <p className="text-slate-600 mb-8 text-sm sm:text-base">
          Have questions about university onboarding, API integration, or enterprise verification? Our engineering team is ready to assist.
        </p>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <span className="text-2xl">✓</span>
              <h3 className="text-lg font-bold text-emerald-800">Inquiry Sent Successfully</h3>
              <p className="text-xs text-emerald-700">Thank you for reaching out. A platform representative will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Your Full Name</label>
                  <input required type="text" placeholder="Dr. Arthur Vance" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Work Email</label>
                  <input required type="email" placeholder="vance@university.edu" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Organization / Institution</label>
                <input required type="text" placeholder="e.g. Apex Institute of Technology" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
                <textarea required rows={4} placeholder="Describe your verification inquiry or institutional partnership request..." className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition text-sm">
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
