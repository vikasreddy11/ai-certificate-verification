import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
  role?: 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'COMPANY';
}

export default function DashboardLayout({ children, role }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              C
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block">CertiVerify AI</span>
              <span className="text-xs text-blue-400 font-medium">Enterprise Portal</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {role === 'SUPER_ADMIN' && (
              <>
                <Link href="/admin/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Overview & Analytics
                </Link>
                <Link href="/admin/colleges" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Colleges & Admins
                </Link>
                <Link href="/admin/certificates" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Certificates Registry
                </Link>
                <Link href="/admin/logs" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Audit Logs
                </Link>
              </>
            )}

            {role === 'COLLEGE_ADMIN' && (
              <>
                <Link href="/college/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Institution Overview
                </Link>
                <Link href="/college/students" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Student Management
                </Link>
                <Link href="/college/certificates" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Issue Certificates & QR
                </Link>
              </>
            )}

            {role === 'COMPANY' && (
              <>
                <Link href="/company/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Verification Portal
                </Link>
                <Link href="/company/scan" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  QR Camera Scanner
                </Link>
                <Link href="/company/upload" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  OCR File Verification
                </Link>
                <Link href="/company/history" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Verification Logs
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="w-full py-2 px-3 text-sm text-red-400 hover:bg-slate-800 rounded-lg flex items-center justify-center font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-xs uppercase px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold tracking-wider">
              DEMO DATA ACTIVE
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xs text-blue-600 font-medium hover:underline">
              Public Portal
            </Link>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

