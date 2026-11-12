import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import api from '../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@certiverify.ai');
  const [password, setPassword] = useState('Admin@123456');
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
        router.push('/company/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Sign In - CertiVerify AI</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          C
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Access the cryptographic certificate verification network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-3">
              Quick Demo Fill
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@certiverify.ai');
                  setPassword('Admin@123456');
                }}
                className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@ait.edu');
                  setPassword('College@123');
                }}
                className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
              >
                College Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('recruiter@google.com');
                  setPassword('Recruiter@123');
                }}
                className="px-2 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
              >
                Recruiter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

