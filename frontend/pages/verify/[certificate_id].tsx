import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import api from '../../utils/api';

export default function PublicVerifyPage() {
  const router = useRouter();
  const { certificate_id } = router.query;
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (certificate_id) {
      verifyCertificate();
    }
  }, [certificate_id]);

  const verifyCertificate = async () => {
    try {
      const res = await api.get(`/api/verification/verify/${certificate_id}`);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Head>
        <title>Certificate Verification - CertiVerify AI</title>
      </Head>

      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
              C
            </div>
            <div>
              <h2 className="text-lg font-bold">CertiVerify AI</h2>
              <span className="text-xs text-blue-400">Cryptographic Credential Validator</span>
            </div>
          </div>
          {result?.is_demo && (
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs rounded-full font-semibold">
              SYNTHETIC DEMO
            </span>
          )}
        </div>

        <div className="p-8">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">
              Consulting authoritative blockchain & institutional registry...
            </div>
          ) : result ? (
            <div>
              <div className="text-center mb-8">
                {result.verification_status === 'VERIFIED' ? (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold mb-3 shadow-inner">
                    ✓
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-2xl font-bold mb-3 shadow-inner">
                    ✕
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900">{result.verification_status}</h3>
                <p className="text-sm text-slate-500 mt-1">{result.message}</p>
              </div>

              {result.official_record && (
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-5 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-semibold text-slate-800">{result.official_record.student_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">Roll Number:</span>
                    <span className="font-semibold text-slate-800">{result.official_record.roll_number}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">Institution:</span>
                    <span className="font-semibold text-slate-800">{result.official_record.college_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Graduation Year:</span>
                    <span className="font-semibold text-slate-800">{result.official_record.graduation_year}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-red-500 font-medium">
              Could not retrieve certificate records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

