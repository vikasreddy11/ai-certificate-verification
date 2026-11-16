import React from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoginForm from '../../components/LoginForm';
import { useLogin } from '../../hooks/useLogin';

export default function InstitutionPortalPage() {
  const login = useLogin({ expectedRoles: ['COLLEGE_ADMIN', 'SUPER_ADMIN'] });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <Head>
        <title>Institution Portal - CertiVerify AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar activePage="institution" />

      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="text-center mb-8">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
            For Universities & Colleges
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Institution Administrator Login
          </h1>
          <p className="mt-3 text-slate-600 text-sm">
            Add students, issue or revoke certificates, and view analytics.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
          <LoginForm
            email={login.email}
            password={login.password}
            setEmail={login.setEmail}
            setPassword={login.setPassword}
            onSubmit={login.handleSubmit}
            loading={login.loading}
            error={login.error}
            emailLabel="Official Institutional Email"
            buttonText={login.buttonLabel('Sign In to Institution Portal')}
          />

          <div className="pt-4 mt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
              Quick Demo Credentials
            </span>
            <button
              type="button"
              onClick={() => {
                login.setEmail('admin@ait.edu');
                login.setPassword('College@123');
              }}
              className="w-full min-h-[44px] text-left p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-700 font-mono transition"
            >
              Apex Institute: admin@ait.edu / College@123
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
