import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-md">
                C
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block">
                  CertiVerify AI
                </span>
                <span className="text-xs text-blue-400 font-medium block -mt-1">
                  Cryptographic Credential Trust Network
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering higher education institutions, recruiters, and background verification agencies with asymmetric Ed25519 digital signatures and AI-assisted OCR verification.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Platform Registry Status: Online & Signed</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/verify" className="hover:text-white transition">
                  Public Verification
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/portal/institution" className="hover:text-white transition">
                  University Roster
                </Link>
              </li>
              <li>
                <Link href="/portal/company" className="hover:text-white transition">
                  Recruiter OCR Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/portal/institution" className="hover:text-white transition">
                  Institution Portal
                </Link>
              </li>
              <li>
                <Link href="/portal/company" className="hover:text-white transition">
                  Company Portal
                </Link>
              </li>
              <li>
                <Link href="/portal/admin" className="hover:text-white transition">
                  Super Admin Console
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Unified Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Platform
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CertiVerify AI. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Compliant with Asymmetric Cryptography Standards (Ed25519) & Global Academic Verification Protocols.
          </p>
        </div>
      </div>
    </footer>
  );
}
