import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import VerificationResult from '../../components/VerificationResult';
import { parseCertificateId } from '../../utils/certificate';
import { fetchVerification, verifyRequestError } from '../../utils/verifyApi';

export default function PublicVerifyPage() {
  const router = useRouter();
  const { certificate_id } = router.query;
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!certificate_id || typeof certificate_id !== 'string') return;
    const id = parseCertificateId(certificate_id);
    let cancelled = false;
    const timer = setTimeout(() => setSlow(true), 4000);

    const run = async () => {
      setLoading(true);
      setError('');
      if (!id) {
        setError('Invalid certificate ID format.');
        setLoading(false);
        return;
      }
      try {
        const data = await fetchVerification(id, () => {
          if (!cancelled) {
            setError('The server is waking up (free hosting can take up to 50 seconds). Retrying...');
          }
        });
        if (!cancelled) {
          setResult(data);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(verifyRequestError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [certificate_id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Head>
        <title>Certificate Verification - CertiVerify AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
              C
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold">CertiVerify AI</h2>
              <span className="text-xs text-blue-400">Cryptographic Credential Validator</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">
              {slow
                ? 'Connecting to server... Free hosting can take up to 50 seconds.'
                : 'Checking the official institutional registry...'}
            </div>
          ) : result ? (
            <VerificationResult result={result} />
          ) : (
            <div className="py-8 text-center text-red-600 font-medium">{error || 'Could not retrieve certificate records.'}</div>
          )}

          <div className="mt-8 text-center">
            <Link href="/verify" className="text-sm font-semibold text-blue-600 hover:underline">
              Verify another certificate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
