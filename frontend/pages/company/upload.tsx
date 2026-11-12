import React, { useState } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function CompanyUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a certificate image or PDF to analyze.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/verification/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification error encountered.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs uppercase tracking-wider">VERIFIED AUTHENTIC</span>;
      case 'MISMATCH':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs uppercase tracking-wider">FIELD MISMATCH DETECTED</span>;
      case 'REVOKED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold text-xs uppercase tracking-wider">REVOKED CREDENTIAL</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-bold text-xs uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <DashboardLayout role="COMPANY">
      <Head>
        <title>OCR Verification - CertiVerify AI</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">AI / OCR Certificate Verification</h1>
          <p className="text-sm text-slate-500">Upload candidate degree certificate or transcript. OpenCV & OCR models will extract text and compare against official records.</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-8">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition cursor-pointer">
              <input
                type="file"
                accept="image/png, image/jpeg, application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-slate-400 mt-2">Accepted formats: JPG, PNG, PDF (Max 10MB)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Running OCR & Cryptographic Checks...' : 'Extract & Verify Document'}
            </button>
          </form>
        </div>

        {/* Verification Result Display */}
        {result && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Verification Report</span>
                <span className="text-lg font-bold text-slate-900">{result.certificate_id || 'ID Unidentified'}</span>
              </div>
              <div>{getStatusBadge(result.verification_status)}</div>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-700 mb-6 font-medium">{result.message}</p>

              {result.official_record && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg mb-6">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Institutional Student Name</span>
                    <span className="text-sm font-semibold text-slate-800">{result.official_record.student_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Roll / Reg Number</span>
                    <span className="text-sm font-semibold text-slate-800">{result.official_record.roll_number}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Awarding College</span>
                    <span className="text-sm font-semibold text-slate-800">{result.official_record.college_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Graduation Year</span>
                    <span className="text-sm font-semibold text-slate-800">{result.official_record.graduation_year}</span>
                  </div>
                </div>
              )}

              {/* Field by field matching results */}
              {result.mismatching_fields && Object.keys(result.mismatching_fields).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-2">Discrepancies Identified</h4>
                  <div className="space-y-2">
                    {Object.entries(result.mismatching_fields).map(([key, val]: any) => (
                      <div key={key} className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
                        <span className="font-bold text-red-800 uppercase">{key}:</span>
                        <div className="flex justify-between mt-1 text-slate-700">
                          <span>Institutional: <b className="text-slate-900">{val.official}</b></span>
                          <span>Scanned OCR: <b className="text-red-700">{val.extracted}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

