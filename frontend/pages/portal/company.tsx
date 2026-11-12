import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';

export default function CompanyPortalPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login
  const [loginEmail, setLoginEmail] = useState('recruiter@google.com');
  const [loginPassword, setLoginPassword] = useState('Recruiter@123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register
  const [regFullName, setRegFullName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
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

      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data));

      if (res.data.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (res.data.role === 'COLLEGE_ADMIN') {
        router.push('/college/dashboard');
      } else {
        router.push('/company/dashboard');
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
      await api.post('/api/auth/register-company', {
        full_name: regFullName,
        company_name: regCompany,
        email: regEmail,
        password: regPassword,
        role: 'COMPANY',
      });
      setRegSuccess(true);
    } catch (err: any) {
      setRegError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>Recruiter & Company Portal - CertiVerify AI</title>
        <meta
          name="description"
          content="Enterprise Verification Portal: Scan QR codes, upload candidate degree documents, run AI/OCR discrepancy matching, and download verification reports."
        />
      </Head>

      <Navbar activePage="company" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          <div className="lg:col-span-7">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
              For Hiring Teams & Background Verifiers
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI-Powered Candidate Credential Verification
            </h1>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Accelerate hiring diligence with instant authenticity checks. Upload degree transcripts, scan QR tokens directly via camera, and verify candidates against official university registries in seconds.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xl font-bold text-purple-600 block">AI & OCR Analysis</span>
                <span className="text-xs text-slate-500">OpenCV image filtering & PaddleOCR text parsing</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xl font-bold text-emerald-600 block">Audit Proofs</span>
                <span className="text-xs text-slate-500">Immutable verification logs & downloadable PDF reports</span>
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
                    ? 'border-purple-600 text-purple-600'
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
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Register Recruiter
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Company & Recruiter Sign In</h3>
                <p className="text-xs text-slate-500">
                  Access your organization’s verification dashboard, camera scanner, and OCR studio.
                </p>

                {loginError && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-500/20 transition disabled:opacity-50 text-sm"
                >
                  {loginLoading ? 'Authenticating...' : 'Sign In to Verification Portal'}
                </button>

                {/* Quick Demo Pre-fill */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                    Quick Demo Credentials
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('recruiter@google.com');
                      setLoginPassword('Recruiter@123');
                    }}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-700 font-mono transition"
                  >
                    Google Recruiter: recruiter@google.com / Recruiter@123
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">Create Recruiter Account</h3>
                <p className="text-xs text-slate-500">
                  Free instant registration for talent acquisition teams and verification agencies.
                </p>

                {regSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
                    <span className="font-bold text-sm block">Account Created Successfully!</span>
                    <p>You can now sign in using your corporate credentials to access the verification platform.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setRegSuccess(false);
                        setMode('login');
                      }}
                      className="mt-2 px-3 py-1.5 bg-emerald-700 text-white font-bold rounded-lg text-xs"
                    >
                      Proceed to Sign In
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
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Recruiter Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Company / Organization Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Microsoft Corporation"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Corporate Work Email</label>
                      <input
                        type="email"
                        required
                        placeholder="s.jenkins@microsoft.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition text-xs mt-2"
                    >
                      {regLoading ? 'Registering Account...' : 'Create Recruiter Account'}
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
