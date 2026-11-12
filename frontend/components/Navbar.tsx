import React, { useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  activePage?: string;
}

export default function Navbar({ activePage = 'home' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
              C
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition block">
                CertiVerify AI
              </span>
              <span className="text-xs text-blue-600 font-semibold block -mt-1 tracking-wide">
                Institutional Verification
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                activePage === 'home'
                  ? 'text-blue-600 bg-blue-50/70'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              href="/#how-it-works"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
            >
              How It Works
            </Link>
            <Link
              href="/portal/institution"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                activePage === 'institution'
                  ? 'text-blue-600 bg-blue-50/70'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              For Institutions
            </Link>
            <Link
              href="/portal/company"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                activePage === 'company'
                  ? 'text-blue-600 bg-blue-50/70'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              For Companies
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/verify"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 transition flex items-center space-x-2"
            >
              <span>Verify Certificate</span>
              <span className="text-blue-200">→</span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            How It Works
          </Link>
          <Link
            href="/portal/institution"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            For Institutions
          </Link>
          <Link
            href="/portal/company"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            For Companies
          </Link>
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

