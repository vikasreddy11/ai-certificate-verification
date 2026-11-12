import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  useEffect(() => {
    loadColleges();
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [selectedCollegeId, statusFilter]);

  const loadColleges = async () => {
    try {
      const res = await api.get('/api/colleges');
      setColleges(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCollegeId) params.college_id = selectedCollegeId;
      if (statusFilter) params.status_filter = statusFilter;
      const res = await api.get('/api/certificates', { params });
      setCertificates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (certificateId: string) => {
    if (confirm(`Revoke certificate ${certificateId}? This will invalidate recruiter verification checks.`)) {
      try {
        await api.patch(`/api/certificates/${certificateId}/revoke`);
        fetchCertificates();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to revoke certificate');
      }
    }
  };

  const filteredCerts = certificates.filter(
    (c) =>
      c.certificate_id.toLowerCase().includes(search.toLowerCase()) ||
      (c.student_name && c.student_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.college_name && c.college_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <Head>
        <title>Global Certificate Registry - CertiVerify AI</title>
      </Head>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global Certificate Vault</h1>
          <p className="text-sm text-slate-500">Cross-institutional registry of all issued, active, and revoked cryptographic credentials.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by ID, student, or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="w-48">
          <select
            value={selectedCollegeId}
            onChange={(e) => setSelectedCollegeId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
          >
            <option value="">All Institutions</option>
            {colleges.map((col) => (
              <option key={col.id} value={col.id}>
                {col.college_name} ({col.college_code})
              </option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Querying registry...</div>
        ) : filteredCerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No matching certificates found.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Certificate ID</th>
                <th className="px-6 py-4 text-left">Student Name</th>
                <th className="px-6 py-4 text-left">Awarding Institution</th>
                <th className="px-6 py-4 text-left">Year</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">
                    {cert.certificate_id}
                    {cert.is_demo && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded font-sans font-semibold">
                        DEMO
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{cert.student_name}</td>
                  <td className="px-6 py-4 text-slate-600">{cert.college_name}</td>
                  <td className="px-6 py-4 text-slate-600">{cert.graduation_year}</td>
                  <td className="px-6 py-4">
                    {cert.status === 'ACTIVE' ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                        REVOKED
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setQrModalUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/certificates/${cert.certificate_id}/qr`)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium"
                    >
                      QR Code
                    </button>
                    {cert.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleRevoke(cert.certificate_id)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* QR Code Modal */}
      {qrModalUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">High-Resolution Verification QR</h3>
            <p className="text-xs text-slate-500 mb-4">Embedded with Ed25519 signature payload</p>
            <div className="p-4 bg-slate-50 rounded-xl inline-block border border-slate-200 mb-4">
              <img src={qrModalUrl} alt="Certificate QR Code" className="w-56 h-56 mx-auto" />
            </div>
            <div className="space-y-2">
              <a
                href={qrModalUrl}
                download="certificate-qr.png"
                className="w-full block py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Download QR Code Image
              </a>
              <button
                type="button"
                onClick={() => setQrModalUrl(null)}
                className="w-full py-2 px-4 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

