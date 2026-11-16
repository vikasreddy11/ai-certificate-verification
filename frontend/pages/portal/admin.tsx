import React from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoginForm from '../../components/LoginForm';
import { useLogin } from '../../hooks/useLogin';

export default function AdminPortalPage() {
  const login = useLogin({ expectedRoles: ['SUPER_ADMIN'] });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-white">
      <Head>
        <title>Super Admin Console - CertiVerify AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
          <LoginForm
            dark
            email={login.email}
            password={login.password}
            setEmail={login.setEmail}
            setPassword={login.setPassword}
            onSubmit={login.handleSubmit}
            loading={login.loading}
            error={login.error}
            emailLabel="Root Administrator Email"
            buttonText={login.buttonLabel('Authenticate Super Admin')}
          />

          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
              Default Super Admin Demo Credentials
            </span>
            <button
              type="button"
              onClick={() => {
                login.setEmail('admin@certiverify.ai');
                login.setPassword('Admin@123456');
              }}
              className="w-full min-h-[44px] text-left p-2.5 bg-slate-900 hover:bg-slate-950 border border-slate-700 rounded-lg text-xs text-blue-400 font-mono transition"
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
