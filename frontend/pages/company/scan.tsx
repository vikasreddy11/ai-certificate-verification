import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';

export default function CompanyScanPage() {
  const router = useRouter();
  const [manualCertId, setManualCertId] = useState('');

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCertId.trim()) {
      router.push(`/verify/${encodeURIComponent(manualCertId.trim())}`);
    }
  };

  return (
    <DashboardLayout role="COMPANY">
      <Head>
        <title>Scan Certificate QR - CertiVerify AI</title>
      </Head>

      <div className="max-w-xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">QR Code Camera Scanner</h1>
          <p className="text-sm text-slate-500">Scan candidate credentials with your device camera or enter Certificate ID directly.</p>
        </div>

        {/* Camera Viewfinder Mock */}
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="w-56 h-56 mx-auto border-2 border-dashed border-blue-500 rounded-2xl flex flex-col items-center justify-center relative">
            <span className="w-4 h-4 border-t-2 border-l-2 border-blue-400 absolute top-2 left-2"></span>
            <span className="w-4 h-4 border-t-2 border-r-2 border-blue-400 absolute top-2 right-2"></span>
            <span className="w-4 h-4 border-b-2 border-l-2 border-blue-400 absolute bottom-2 left-2"></span>
            <span className="w-4 h-4 border-b-2 border-r-2 border-blue-400 absolute bottom-2 right-2"></span>

            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
              📷
            </div>
            <p className="text-xs text-slate-400 max-w-[140px]">Align physical QR code within the frame</p>
          </div>
          <p className="text-xs text-slate-400 mt-4">Camera video stream active (TLS / HTTPS required for webcam hardware)</p>
        </div>

        {/* Fallback Direct Certificate ID Input */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Direct ID Verification</h3>
          <p className="text-xs text-slate-500 mb-4">You can test immediately with a synthetic demo certificate ID:</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setManualCertId('CERT-AIT-2026-00001')}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono"
            >
              CERT-AIT-2026-00001 (Valid)
            </button>
            <button
              onClick={() => setManualCertId('CERT-BSU-2025-00036')}
              className="px-2.5 py-1 text-xs bg-red-50 hover:bg-red-100 rounded text-red-700 font-mono"
            >
              CERT-BSU-2025-00036 (Revoked)
            </button>
          </div>

          <form onSubmit={handleScanSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="e.g. CERT-AIT-2026-00001"
                value={manualCertId}
                onChange={(e) => setManualCertId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:border-blue-600 uppercase"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
            >
              Verify Certificate Record
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

