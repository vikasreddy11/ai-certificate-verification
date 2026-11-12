import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function CollegeCertificatesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [certType, setCertType] = useState('Degree Certificate');
  const [gradYear, setGradYear] = useState('2026');
  const [showModal, setShowModal] = useState(false);
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, certsRes] = await Promise.all([
        api.get('/api/students'),
        api.get('/api/certificates'),
      ]);
      setStudents(studentsRes.data);
      setCertificates(certsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Please select a student');
      return;
    }
    try {
      await api.post('/api/certificates', {
        student_id: parseInt(selectedStudentId),
        certificate_type: certType,
        graduation_year: parseInt(gradYear),
      });
      setShowModal(false);
      setSelectedStudentId('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to issue certificate');
    }
  };

  const handleRevoke = async (certificateId: string) => {
    if (confirm(`Are you sure you want to revoke ${certificateId}?`)) {
      try {
        await api.patch(`/api/certificates/${certificateId}/revoke`);
        loadData();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to revoke certificate');
      }
    }
  };

  return (
    <DashboardLayout role="COLLEGE_ADMIN">
      <Head>
        <title>Manage Certificates & QR - CertiVerify AI</title>
      </Head>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certificate Generation & QR Vault</h1>
          <p className="text-sm text-slate-500">Generate tamper-proof Ed25519-signed credentials and QR codes for your students.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          + Issue New Certificate
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading certificate records...</div>
        ) : certificates.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No certificates generated yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Certificate ID</th>
                <th className="px-6 py-4 text-left">Student Name</th>
                <th className="px-6 py-4 text-left">Graduation Year</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{cert.certificate_id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{cert.student_name}</td>
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
                      View QR
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

      {/* Modal to Issue Certificate */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Generate & Sign Certificate</h2>
            <form onSubmit={handleIssueCertificate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Enrolled Student</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.student_name} ({stu.roll_number})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Certificate Type</label>
                <input
                  type="text"
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                >
                  Generate & Sign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {qrModalUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Official Verification QR Code</h3>
            <p className="text-xs text-slate-500 mb-4">Contains cryptographic routing URL & tamper-evident signature</p>
            <div className="p-4 bg-slate-50 rounded-xl inline-block border border-slate-200 mb-4">
              <img src={qrModalUrl} alt="Certificate QR Code" className="w-56 h-56 mx-auto" />
            </div>
            <div className="space-y-2">
              <a
                href={qrModalUrl}
                download="certificate-qr.png"
                className="w-full block py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Download High-Res QR
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

