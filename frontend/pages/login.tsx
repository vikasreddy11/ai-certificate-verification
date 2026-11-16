import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data));

      if (res.data.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (res.data.role === 'COLLEGE_ADMIN') {
        router.push('/college/dashboard');
      } else {
        router.push('/verify');
      }
    } catch (err: any) {
      if (!err.response) {
        // Network error, timeout or unreachable server
        setError(
          'Cannot reach the server. It may be waking up (can take up to 50 seconds). Please try again.'
        );
      } else if (err.response.status === 401) {
        setError('Incorrect email or password');
      } else if (err.response.status >= 500) {
        setError('Server error, try again.');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>Admin Sign In - CertiVerify AI</title>
      </Head>

      <Navbar activePage="login" />

      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
            C
          </div>
          <h2 className="mt-5 text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Sign In
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            For college administrators and super admins managing credentials
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
            {error && (
              <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700 leading-relaxed">
                {error}
              </div>
            )}

            {loading && (
              <div className="mb-5 bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Connecting to backend... If the server is spinning up, this may take up to 50 seconds.</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In as Administrator'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Need to verify a certificate?{' '}
              <Link href="/verify" className="text-blue-600 font-semibold hover:underline">
                Public Verification (No login required)
              </Link>
            </div>

            {/* Quick Demo Fill Buttons - shown only in development mode */}
            {isDev && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                  Development Demo Quick Fill
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@certiverify.ai');
                      setPassword('Admin@123456');
                    }}
                    className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@ait.edu');
                      setPassword('College@123');
                    }}
                    className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    College Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
