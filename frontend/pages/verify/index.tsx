import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import VerificationResult from '../../components/VerificationResult';
import api, { withWakeRetry } from '../../utils/api';
import { downscaleImage } from '../../utils/image';
import { fetchVerification, validateCertificateId, verifyRequestError } from '../../utils/verifyApi';

const QrScanner = dynamic(() => import('../../components/QrScanner'), { ssr: false });

export default function VerifyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'scan' | 'upload' | 'id'>('scan');
  const [scannerOn, setScannerOn] = useState(false);

  const [certIdInput, setCertIdInput] = useState('');
  const [idLoading, setIdLoading] = useState(false);
  const [idSlow, setIdSlow] = useState(false);
  const [idError, setIdError] = useState('');
  const [idResult, setIdResult] = useState<any>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSlow, setUploadSlow] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState('');
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (router.query.tab === 'upload') setActiveTab('upload');
    if (router.query.tab === 'id') setActiveTab('id');
    if (router.query.tab === 'scan' || router.query.tab === 'qr') setActiveTab('scan');
    if (router.query.id && typeof router.query.id === 'string') {
      setCertIdInput(router.query.id);
      setActiveTab('id');
    }
  }, [router.query]);

  useEffect(() => {
    return () => {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const markSlow = (setter: (v: boolean) => void) => {
    if (slowTimer.current) clearTimeout(slowTimer.current);
    setter(false);
    slowTimer.current = setTimeout(() => setter(true), 4000);
  };

  const handleDecodedId = async (id: string) => {
    setScannerOn(false);
    setActiveTab('id');
    setCertIdInput(id);
    setIdError('');
    setIdResult(null);
    setIdLoading(true);
    markSlow(setIdSlow);
    try {
      const data = await fetchVerification(id, () =>
        setIdError('The server is waking up (free hosting can take up to 50 seconds). Retrying...')
      );
      setIdResult(data);
      setIdError('');
    } catch (err) {
      setIdError(verifyRequestError(err));
    } finally {
      setIdLoading(false);
      setIdSlow(false);
    }
  };

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = validateCertificateId(certIdInput);
    if (!parsed.ok) {
      setIdError('error' in parsed ? parsed.error : 'Invalid certificate ID.');
      setIdResult(null);
      return;
    }
    const validId = parsed.id;
    setCertIdInput(validId);
    setIdError('');
    setIdResult(null);
    setIdLoading(true);
    markSlow(setIdSlow);
    try {
      const data = await fetchVerification(validId, () =>
        setIdError('The server is waking up (free hosting can take up to 50 seconds). Retrying...')
      );
      setIdResult(data);
      setIdError('');
    } catch (err) {
      setIdError(verifyRequestError(err));
    } finally {
      setIdLoading(false);
      setIdSlow(false);
    }
  };

  const pickFile = (file?: File | null) => {
    setUploadFile(file || null);
    setUploadError('');
    setUploadResult(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a certificate image (PNG, JPG, JPEG, WEBP).');
      return;
    }
    setUploadError('');
    setUploadLoading(true);
    setUploadResult(null);
    markSlow(setUploadSlow);

    try {
      const prepared = await downscaleImage(uploadFile);
      const formData = new FormData();
      formData.append('file', prepared);
      const res = await withWakeRetry(
        () =>
          api.post('/api/verification/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }),
        () =>
          setUploadError(
            'The server is waking up (free hosting can take up to 50 seconds). Retrying...'
          )
      );
      setUploadResult(res.data);
      setUploadError('');
    } catch (err: any) {
      setUploadError(verifyRequestError(err));
    } finally {
      setUploadLoading(false);
      setUploadSlow(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 overflow-x-hidden">
      <Head>
        <title>Verify Certificate - CertiVerify AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Public Certificate Verification: Scan QR code, upload image, or enter certificate ID without logging in."
        />
      </Head>

      <Navbar activePage="verify" />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Public Verification (No Login Required)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verify a Certificate
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Scan a QR code, type a certificate ID, or upload a photo. Anyone can verify without an account.
          </p>
        </div>

        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex min-w-0">
            {([
              ['scan', 'Scan QR'],
              ['upload', 'Upload image'],
              ['id', 'Enter ID'],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab !== 'scan') setScannerOn(false);
                  setActiveTab(tab);
                }}
                className={`min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'scan' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Scan Certificate QR Code</h3>
            <p className="text-xs text-slate-500 mb-6">
              Tap Start camera so the browser can ask for permission, then point at the QR code.
            </p>
            {!scannerOn ? (
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-2xl p-8 text-slate-400 text-sm">
                  Camera is off until you tap Start camera.
                </div>
                <button
                  type="button"
                  onClick={() => setScannerOn(true)}
                  className="min-h-[44px] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-sm"
                >
                  Start camera
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <QrScanner onDecoded={handleDecodedId} />
                <button
                  type="button"
                  onClick={() => setScannerOn(false)}
                  className="min-h-[44px] px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm"
                >
                  Stop camera
                </button>
              </div>
            )}
            {(idLoading || idResult || idError) && activeTab === 'scan' && (
              <div className="mt-6 text-left">
                {idLoading && (
                  <p className="text-sm text-blue-700">
                    {idSlow
                      ? 'Connecting to server... The server may take up to 50 seconds to wake up.'
                      : 'Checking certificate…'}
                  </p>
                )}
                {idError && <p className="text-sm text-red-700">{idError}</p>}
                {idResult && <VerificationResult result={idResult} />}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Upload Certificate Image</h3>
            <p className="text-xs text-slate-500 mb-6">
              Use a gallery photo or take a picture. Large phone photos are resized before upload.
            </p>

            {uploadError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/60 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:min-h-[44px] file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white"
                />
                <label className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold cursor-pointer">
                  Take photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                </label>
                <p className="text-xs text-slate-400">PNG, JPG, JPEG, WEBP. Photos are scaled to 1600px.</p>
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="max-h-56 mx-auto rounded-lg border border-slate-200" />
                )}
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full min-h-[44px] py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm disabled:opacity-50"
              >
                {uploadLoading
                  ? uploadSlow
                    ? 'Connecting to server...'
                    : 'Reading QR & Cross-Checking Database...'
                  : 'Upload & Verify Certificate'}
              </button>
              {uploadLoading && (
                <p className="text-xs text-slate-500 text-center">
                  The server may take up to 50 seconds to wake up.
                </p>
              )}
            </form>

            {uploadResult && <VerificationResult result={uploadResult} />}
          </div>
        )}

        {activeTab === 'id' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Search by Certificate ID</h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter the unique certificate code printed on the credential.
            </p>

            {idError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700">
                {idError}
              </div>
            )}

            <form onSubmit={handleIdSubmit} className="space-y-4">
              <input
                type="text"
                required
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="e.g. CERT-AIT-2024-00001"
                value={certIdInput}
                onChange={(e) => {
                  setCertIdInput(e.target.value);
                  setIdError('');
                }}
                className="w-full min-h-[44px] border border-slate-300 rounded-xl px-4 py-3 text-base font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-wide"
              />
              <button
                type="submit"
                disabled={idLoading}
                className="w-full min-h-[44px] py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm disabled:opacity-50"
              >
                {idLoading
                  ? idSlow
                    ? 'Connecting to server...'
                    : 'Querying Database...'
                  : 'Check Certificate ID'}
              </button>
            </form>

            {idResult && <VerificationResult result={idResult} />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
