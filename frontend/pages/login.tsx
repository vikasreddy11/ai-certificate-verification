import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginForm from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

export default function LoginPage() {
  const login = useLogin();
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>Admin Sign In - CertiVerify AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar activePage="login" />

      <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
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
            <LoginForm
              email={login.email}
              password={login.password}
              setEmail={login.setEmail}
              setPassword={login.setPassword}
              onSubmit={login.handleSubmit}
              loading={login.loading}
              error={login.error}
              buttonText={login.buttonLabel('Sign In as Administrator')}
            />

            <div className="mt-6 text-center text-xs text-slate-500">
              Need to verify a certificate?{' '}
              <Link href="/verify" className="text-blue-600 font-semibold hover:underline">
                Public Verification (No login required)
              </Link>
            </div>

            {isDev && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                  Development Demo Quick Fill
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      login.setEmail('admin@certiverify.ai');
                      login.setPassword('Admin@123456');
                    }}
                    className="min-h-[44px] px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      login.setEmail('admin@ait.edu');
                      login.setPassword('College@123');
                    }}
                    className="min-h-[44px] px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
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
