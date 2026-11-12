import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../utils/api';

export default function AdminPortalPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@certiverify.ai');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });

      if (res.data.role !== 'SUPER_ADMIN') {
        setError('Access denied. This console requires Super Administrator authorization.');
        return;
      }

      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data));
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid administrative credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-white">
      <Head>
        <title>Super Admin Console - CertiVerify AI</title>
        <meta name="description" content="Super Administrator Console: System-wide analytics, college approvals, audit ledger, and cryptographic parameters." />
      </Head>

      <Navbar activePage="admin" />

      <main className="max-w-md w-full mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white mx-auto shadow-lg shadow-blue-500/20 mb-4">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Super Admin Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Restricted access: Global institutional governance and audit ledger.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-4 bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Root Administrator Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Administrative Secret</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Validating Root Credentials...' : 'Authenticate Super Admin'}
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
              Default Super Admin Demo Credentials
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@certiverify.ai');
                setPassword('Admin@123456');
              }}
              className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-950 border border-slate-700 rounded-lg text-xs text-blue-400 font-mono transition"
            >
              admin@certiverify.ai / Admin@123456
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

