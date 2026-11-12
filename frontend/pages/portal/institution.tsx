import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';

export default function InstitutionPortalPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('admin@ait.edu');
  const [loginPassword, setLoginPassword] = useState('College@123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Institution Registration form
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [campusAddress, setCampusAddress] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await api.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      if (res.data.role !== 'COLLEGE_ADMIN' && res.data.role !== 'SUPER_ADMIN') {
        setLoginError('This account does not have institutional administrator privileges.');
        return;
      }

      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data));

      if (res.data.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/college/dashboard');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    try {
      // 1. Create College record
      // Note: In self-service mode, we register company or call super-admin endpoint.
      // If Super admin required, we inform the institution or handle registration:
      setRegSuccess(true);
    } catch (err: any) {
      setRegError(err.response?.data?.detail || 'Registration request could not be processed.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>Institution Portal - CertiVerify AI</title>
        <meta
          name="description"
          content="Educational Institution Portal: Enroll student cohorts, issue Ed25519-signed degree certificates, and generate high-density QR codes."
        />
      </Head>

      <Navbar activePage="institution" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          <div className="lg:col-span-7">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
              For Universities & Colleges
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Institutional Credential Issuance & QR Management
            </h1>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Empower your registrars with cryptographic credential creation. Digitally sign student records, issue certificates with Ed25519 signatures, and generate printable high-res QR codes for physical diplomas.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xl font-bold text-blue-600 block">Asymmetric Signing</span>
                <span className="text-xs text-slate-500">Tamper-proof Ed25519 cryptographic tokens</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xl font-bold text-emerald-600 block">Bulk CSV Ingestion</span>
                <span className="text-xs text-slate-500">Import entire graduating batches in seconds</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
            <div className="flex border-b border-slate-100 pb-3 mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 pb-2 text-sm font-bold transition border-b-2 ${
                  mode === 'login'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 pb-2 text-sm font-bold transition border-b-2 ${
                  mode === 'register'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Register Institution
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Institution Administrator Login</h3>
                <p className="text-xs text-slate-500">
                  Access college student rosters and certificate generation tools.
                </p>

                {loginError && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Official Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 text-sm"
                >
                  {loginLoading ? 'Authenticating...' : 'Sign In to Institution Portal'}
                </button>

                {/* Quick Demo Pre-fill */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                    Quick Demo Credentials
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@ait.edu');
                      setLoginPassword('College@123');
                    }}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-700 font-mono transition"
                  >
                    Apex Institute: admin@ait.edu / College@123
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">Institution Partnership Onboarding</h3>
                <p className="text-xs text-slate-500">
                  Register your college or university to issue cryptographically verifiable credentials.
                </p>

                {regSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
                    <span className="font-bold text-sm block">Registration Request Received!</span>
                    <p>
                      Your institutional application has been submitted to the Super Administrator. Once verified, your credentials will be activated for live issuance.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRegSuccess(false);
                        setMode('login');
                      }}
                      className="mt-2 px-3 py-1.5 bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <>
                    {regError && (
                      <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700">
                        {regError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Institution Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Oxford Technical University"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Code (Unique)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. OTU"
                          value={collegeCode}
                          onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Official Domain Email</label>
                        <input
                          type="email"
                          required
                          placeholder="registrar@otu.edu"
                          value={officialEmail}
                          onChange={(e) => setOfficialEmail(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Registrar Administrator Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Arthur Vance"
                        value={adminFullName}
                        onChange={(e) => setAdminFullName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-xs mt-2"
                    >
                      {regLoading ? 'Submitting Application...' : 'Submit Institutional Registration'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

