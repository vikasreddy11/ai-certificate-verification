import React, { useState } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
  role?: 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'COMPANY';
}

export default function DashboardLayout({ children, role }: LayoutProps) {
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="p-4 space-y-1">
      {role === 'SUPER_ADMIN' && (
        <>
          <Link href="/admin/dashboard" className="flex items-center min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
            Overview & Analytics
          </Link>
          <Link href="/admin/colleges" className="flex items-center min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
            Colleges & Admins
          </Link>
          <Link href="/admin/certificates" className="flex items-center min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
            Certificates Registry
          </Link>
          <Link href="/admin/logs" className="flex items-center min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
            Audit Logs
          </Link>
        </>
      )}

      {role === 'COLLEGE_ADMIN' && (
        <>
          <Link href="/college/dashboard" className="flex items-center min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
            Institution Overview
          </Link>
          <Link href="/college/students" className="flex items-center min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
            Student Management
          </Link>
          <Link href="/college/certificates" className="flex items-center min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
            Issue Certificates & QR
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex md:h-screen overflow-x-hidden">
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static z-40 inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col justify-between transform transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              C
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block">CertiVerify AI</span>
              <span className="text-xs text-blue-400 font-medium">Admin Portal</span>
            </div>
          </div>
          {nav}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="w-full min-h-[44px] py-2 px-3 text-sm text-red-400 hover:bg-slate-800 rounded-lg flex items-center justify-center font-medium"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="md:hidden min-h-[44px] min-w-[44px] rounded-lg border border-slate-200 text-slate-700"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open navigation"
            >
              ☰
            </button>
            <span className="text-xs uppercase px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold tracking-wider">
              DEMO DATA ACTIVE
            </span>
          </div>
          <Link href="/" className="text-xs text-blue-600 font-medium hover:underline">
            Public Portal
          </Link>
        </header>

        <div className="p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
