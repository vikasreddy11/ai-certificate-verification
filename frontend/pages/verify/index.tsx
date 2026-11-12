import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';

export default function VerifyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'id' | 'qr' | 'upload'>('id');

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
    // If URL contains ?tab=qr or ?id=
    if (router.query.tab === 'qr') setActiveTab('qr');
    if (router.query.tab === 'upload') setActiveTab('upload');
    if (router.query.id && typeof router.query.id === 'string') {
      setCertIdInput(router.query.id);
    }
  }, [router.query]);

  // Clean up scanner on unmount or tab change
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
          // Check if decoded text is a full verify URL or direct ID
          stopCameraScanner();
          let targetId = decodedText.trim();
          if (targetId.includes('/verify/')) {
            const parts = targetId.split('/verify/');
            targetId = parts[parts.length - 1];
          }
          router.push(`/verify/${encodeURIComponent(targetId)}`);
        },
        (errorMessage: string) => {
          // ignore transient frame decode errors
        }
      );
      setScannerStarted(true);
    } catch (err: any) {
      setCameraError(
        err?.message || 'Unable to access camera. Please verify device permissions or HTTPS connection.'
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
      setUploadError('Please select a certificate image (PNG, JPG) or PDF file.');
      return;
    }
    setUploadError('');
    setUploadLoading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const res = await api.post('/api/verification/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Document verification analysis failed.');
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
            <span>VERIFIED AUTHENTIC</span>
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="px-3.5 py-1.5 bg-amber-100 text-amber-800 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span>FIELD MISMATCH DETECTED</span>
          </span>
        );
      case 'REVOKED':
        return (
          <span className="px-3.5 py-1.5 bg-red-100 text-red-800 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>REVOKED CREDENTIAL</span>
          </span>
        );
      case 'INVALID_SIGNATURE':
        return (
          <span className="px-3.5 py-1.5 bg-rose-100 text-rose-800 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>TAMPERED SIGNATURE</span>
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
          content="Scan QR code, enter unique Certificate ID, or upload document scan for instant cryptographic cross-verification."
        />
      </Head>

      <Navbar activePage="verify" />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Live Authoritative Verification Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Universal Credential Verification
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Cross-examine academic certificates against official university databases using asymmetric signatures, live QR scanning, or OCR document extraction.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex space-x-1">
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
              Enter Certificate ID
            </button>
            <button
              onClick={() => {
                setActiveTab('qr');
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === 'qr'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Scan QR Code
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
              Upload Document (AI/OCR)
            </button>
          </div>
        </div>

        {/* TAB 1: ENTER CERTIFICATE ID */}
        {activeTab === 'id' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Search by Certificate Identifier</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the global unique certificate code printed on the credential (e.g. CERT-AIT-2026-00001).
              </p>
            </div>

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
                  placeholder="e.g. CERT-AIT-2026-00001"
                  value={certIdInput}
                  onChange={(e) => {
                    setCertIdInput(e.target.value);
                    setIdError('');
                  }}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent tracking-wide"
                />
              </div>

              <button
                type="submit"
                disabled={idLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {idLoading ? 'Consulting Institutional Registry...' : 'Verify Authenticity'}
              </button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Sample Test Identifiers (Live Demo Database)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCertIdInput('CERT-AIT-2024-00001')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono rounded-lg transition"
                >
                  CERT-AIT-2024-00001 (Valid)
                </button>
                <button
                  type="button"
                  onClick={() => setCertIdInput('CERT-BSU-2025-00036')}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-mono rounded-lg transition"
                >
                  CERT-BSU-2025-00036 (Revoked)
                </button>
                <button
                  type="button"
                  onClick={() => setCertIdInput('CERT-CNC-2026-00045')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-mono rounded-lg transition"
                >
                  CERT-CNC-2026-00045 (Valid)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCAN QR CODE */}
        {activeTab === 'qr' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Device Camera QR Scanner</h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan the high-density signed QR code printed on the official certificate document.
              </p>
            </div>

            {cameraError && (
              <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs text-left">
                <span className="font-bold block mb-1">Notice:</span>
                {cameraError}
              </div>
            )}

            <div className="bg-slate-900 rounded-2xl p-6 text-white mb-6 shadow-inner relative overflow-hidden max-w-md mx-auto">
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
                      Camera viewfinder inactive. Click below to initialize device camera.
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
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center space-x-2"
                >
                  <span>Start Camera Scanner</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Stop Camera Scanner
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-6">
              QR scans automatically navigate to the public cryptographic report upon detection.
            </p>
          </div>
        )}

        {/* TAB 3: UPLOAD DOCUMENT (AI/OCR) */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">AI / OCR Certificate Document Analysis</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload a scanned degree certificate or transcript (JPG, PNG, PDF). Our OpenCV & OCR pipeline extracts student credentials and compares every field with the official registry.
              </p>
            </div>

            {uploadError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition cursor-pointer bg-slate-50/60">
                <input
                  type="file"
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={(e) => {
                    setUploadFile(e.target.files?.[0] || null);
                    setUploadError('');
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                <p className="text-xs text-slate-400 mt-3">
                  Supported formats: JPG, JPEG, PNG, PDF (Up to 10MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {uploadLoading
                  ? 'Executing OpenCV Pre-processing & OCR Field Matching...'
                  : 'Analyze & Verify Document'}
              </button>
            </form>

            {/* Verification Result Card */}
            {uploadResult && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Verification Result
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {uploadResult.certificate_id || 'ID Not Detected'}
                    </span>
                  </div>
                  <div>{getStatusBadge(uploadResult.verification_status)}</div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-slate-700 font-medium mb-4">{uploadResult.message}</p>

                  {/* Official Record Table */}
                  {uploadResult.official_record && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Candidate Name:</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {uploadResult.official_record.student_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Roll / Reg Number:</span>
                        <span className="font-bold text-slate-800 text-sm font-mono">
                          {uploadResult.official_record.roll_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Awarding Institution:</span>
                        <span className="font-semibold text-slate-800">
                          {uploadResult.official_record.college_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Graduation Year:</span>
                        <span className="font-semibold text-slate-800">
                          {uploadResult.official_record.graduation_year}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Field Mismatches list */}
                  {uploadResult.mismatching_fields &&
                    Object.keys(uploadResult.mismatching_fields).length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">
                          Discrepancies Identified
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(uploadResult.mismatching_fields).map(([key, val]: any) => (
                            <div
                              key={key}
                              className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs"
                            >
                              <span className="font-bold text-red-800 uppercase block mb-1">
                                {key.replace('_', ' ')}:
                              </span>
                              <div className="flex justify-between text-slate-700">
                                <span>
                                  Institutional Record: <b className="text-slate-900">{val.official}</b>
                                </span>
                                <span>
                                  Scanned OCR Document:{' '}
                                  <b className="text-red-700 font-bold">{val.extracted}</b>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Matching fields */}
                  {uploadResult.matching_fields &&
                    Object.keys(uploadResult.matching_fields).length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                          Matching Fields Verified
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(uploadResult.matching_fields).map(([key, val]: any) => (
                            <div
                              key={key}
                              className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg flex items-center justify-between"
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
      </main>

      <Footer />
    </div>
  );
}
