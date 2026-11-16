import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';

export default function VerifyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'scan' | 'upload' | 'id'>('scan');

  // ID search
  const [certIdInput, setCertIdInput] = useState('');
  const [idLoading, setIdLoading] = useState(false);
  const [idError, setIdError] = useState('');

  // Upload verify
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState('');

  // Camera QR scanner state
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const html5QrCodeRef = useRef<any>(null);

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
      stopCameraScanner();
    };
  }, []);

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = certIdInput.trim();
    if (!cleanId) {
      setIdError('Please enter a valid certificate ID');
      return;
    }
    setIdLoading(true);
    router.push(`/verify/${encodeURIComponent(cleanId)}`);
  };

  const startCameraScanner = async () => {
    setCameraError('');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          stopCameraScanner();
          let targetId = decodedText.trim();
          if (targetId.includes('/verify/')) {
            const parts = targetId.split('/verify/');
            targetId = parts[parts.length - 1];
          }
          router.push(`/verify/${encodeURIComponent(targetId)}`);
        },
        () => {}
      );
      setScannerStarted(true);
    } catch (err: any) {
      setCameraError(
        err?.message || 'Unable to access camera. Please allow camera permissions or access over HTTPS.'
      );
      setScannerStarted(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error(e);
      }
      html5QrCodeRef.current = null;
    }
    setScannerStarted(false);
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

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      // Public upload call - no login or token required
      const res = await api.post('/api/verification/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
    } catch (err: any) {
      setUploadError(
        err.response?.data?.detail ||
          'Document verification failed. Ensure the server is reachable and the image is clear.'
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>VERIFIED</span>
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="px-3.5 py-1.5 bg-amber-100 text-amber-800 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span>MISMATCH (TAMPERED)</span>
          </span>
        );
      case 'REVOKED':
        return (
          <span className="px-3.5 py-1.5 bg-red-100 text-red-800 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>REVOKED</span>
          </span>
        );
      case 'NOT_FOUND':
        return (
          <span className="px-3.5 py-1.5 bg-slate-200 text-slate-800 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
            <span>NOT FOUND (FAKE)</span>
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1.5 bg-slate-100 text-slate-800 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>Verify Certificate - CertiVerify AI</title>
        <meta
          name="description"
          content="Public Certificate Verification: Scan QR code, upload image, or enter certificate ID without logging in."
        />
      </Head>

      <Navbar activePage="verify" />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Public Verification (No Login Required)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verify a Certificate
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Scan a certificate QR code with your camera or upload an image to cross-check against the official institutional database.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex space-x-1">
            <button
              onClick={() => {
                setActiveTab('scan');
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === 'scan'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              📷 Scan QR Code
            </button>
            <button
              onClick={() => {
                stopCameraScanner();
                setActiveTab('upload');
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              📄 Upload Certificate Image
            </button>
            <button
              onClick={() => {
                stopCameraScanner();
                setActiveTab('id');
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === 'id'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              🔢 Enter ID
            </button>
          </div>
        </div>

        {/* TAB 1: SCAN QR CODE */}
        {activeTab === 'scan' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Scan Certificate QR Code</h3>
            <p className="text-xs text-slate-500 mb-6">
              Hold the certificate QR code up to your camera. The verification result will load automatically.
            </p>

            {cameraError && (
              <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs text-left">
                <span className="font-bold block mb-1">Camera Notice:</span>
                {cameraError}
              </div>
            )}

            <div className="bg-slate-900 rounded-2xl p-4 text-white mb-6 shadow-inner relative overflow-hidden max-w-md mx-auto">
              <div
                id="qr-reader-container"
                className="w-full min-h-[260px] flex items-center justify-center rounded-xl overflow-hidden bg-slate-950"
              >
                {!scannerStarted && (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center text-2xl">
                      📷
                    </div>
                    <p className="text-xs text-slate-400">
                      Camera viewfinder inactive. Click below to begin scanning.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-3">
              {!scannerStarted ? (
                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition text-sm"
                >
                  Start Camera Scanner
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition text-sm"
                >
                  Stop Camera Scanner
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD CERTIFICATE IMAGE */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Upload Certificate Image</h3>
            <p className="text-xs text-slate-500 mb-6">
              Upload a clear PNG, JPG, JPEG or WEBP image of the certificate. The system reads the QR code and compares printed details against the official database.
            </p>

            {uploadError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-xs text-red-700">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition cursor-pointer bg-slate-50/60">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    setUploadFile(e.target.files?.[0] || null);
                    setUploadError('');
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                <p className="text-xs text-slate-400 mt-3">
                  Accepted formats: PNG, JPG, JPEG, WEBP (Max 5 MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 text-sm"
              >
                {uploadLoading ? 'Reading QR & Cross-Checking Database...' : 'Upload & Verify Certificate'}
              </button>
            </form>

            {/* Verification Result Display */}
            {uploadResult && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Verification Result
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {uploadResult.certificate_id || 'Certificate ID Unknown'}
                    </span>
                  </div>
                  <div>{getStatusBadge(uploadResult.verification_status)}</div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-700 font-medium mb-4">{uploadResult.message}</p>

                  {/* NOT FOUND specific notice */}
                  {uploadResult.verification_status === 'NOT_FOUND' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-6 font-semibold">
                      The certificate ID from the QR code is not registered in the official database.
                    </div>
                  )}

                  {/* Official Record vs Extracted Details Side-by-Side */}
                  {uploadResult.official_record && (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Official Institutional Record vs Certificate Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block font-medium">Candidate Name</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {uploadResult.official_record.student_name}
                          </span>
                        </div>
                        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block font-medium">Roll / Reg Number</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {uploadResult.official_record.roll_number}
                          </span>
                        </div>
                        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block font-medium">Awarding Institution</span>
                          <span className="font-semibold text-slate-800">
                            {uploadResult.official_record.college_name}
                          </span>
                        </div>
                        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block font-medium">Graduation Year</span>
                          <span className="font-semibold text-slate-800">
                            {uploadResult.official_record.graduation_year}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Field Mismatches Highlighted Side-by-Side */}
                  {uploadResult.mismatching_fields &&
                    Object.keys(uploadResult.mismatching_fields).length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                          Differing Fields Identified (Tampered)
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(uploadResult.mismatching_fields).map(([key, val]: any) => (
                            <div
                              key={key}
                              className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs"
                            >
                              <span className="font-bold text-amber-900 uppercase block mb-1">
                                {key.replace('_', ' ')}
                              </span>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                  <span className="text-slate-500 block">Database Value:</span>
                                  <span className="font-bold text-slate-900">{val.official}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Certificate Value:</span>
                                  <span className="font-bold text-amber-800">{val.extracted}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Matching Fields */}
                  {uploadResult.matching_fields &&
                    Object.keys(uploadResult.matching_fields).length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                          Matching Fields Verified
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {Object.entries(uploadResult.matching_fields).map(([key, val]: any) => (
                            <div
                              key={key}
                              className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between"
                            >
                              <span className="capitalize text-emerald-900 font-medium">
                                {key.replace('_', ' ')}
                              </span>
                              <span className="text-emerald-700 font-bold font-mono">
                                {val.official}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ENTER CERTIFICATE ID */}
        {activeTab === 'id' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Search by Certificate ID</h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter the unique certificate code printed on the credential.
            </p>

            {idError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
                {idError}
              </div>
            )}

            <form onSubmit={handleIdSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="e.g. CERT-AIT-2024-00060"
                  value={certIdInput}
                  onChange={(e) => {
                    setCertIdInput(e.target.value);
                    setIdError('');
                  }}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-wide"
                />
              </div>

              <button
                type="submit"
                disabled={idLoading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition text-sm disabled:opacity-50"
              >
                {idLoading ? 'Querying Database...' : 'Check Certificate ID'}
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
