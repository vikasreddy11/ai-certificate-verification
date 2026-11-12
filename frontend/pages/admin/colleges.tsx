import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function SuperAdminCollegesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');

  // College admin form states
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await api.get('/api/colleges');
      setColleges(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/colleges', {
        college_name: name,
        college_code: code,
        official_email: email,
        address,
        contact_number: contact,
      });
      setShowModal(false);
      setName(''); setCode(''); setEmail(''); setAddress(''); setContact('');
      fetchColleges();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create college');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege) return;
    try {
      await api.post(`/api/colleges/${selectedCollege.id}/admins`, {
        full_name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'COLLEGE_ADMIN'
      });
      setShowAdminModal(false);
      setAdminName(''); setAdminEmail(''); setAdminPassword('');
      alert(`College Administrator created for ${selectedCollege.college_name}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to register college admin');
    }
  };

  const handleDeleteCollege = async (id: number) => {
    if (confirm('Are you sure you want to delete this college? This will delete all associated student and certificate records.')) {
      try {
        await api.delete(`/api/colleges/${id}`);
        fetchColleges();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete');
      }
    }
  };

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <Head>
        <title>Manage Colleges - CertiVerify AI</title>
      </Head>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registered Institutions</h1>
          <p className="text-sm text-slate-500">Manage partner universities, colleges, and delegate institution administrators.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          + Add New College
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading colleges...</div>
        ) : colleges.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No colleges registered yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Code</th>
                <th className="px-6 py-4 text-left">Institution Name</th>
                <th className="px-6 py-4 text-left">Official Email</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colleges.map((col) => (
                <tr key={col.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-bold text-blue-600">{col.college_code}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {col.college_name}
                    {col.is_demo && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-md font-medium">
                        DEMO
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{col.official_email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                      {col.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => { setSelectedCollege(col); setShowAdminModal(true); }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                    >
                      + Add Admin
                    </button>
                    <button
                      onClick={() => handleDeleteCollege(col.id)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal to Add College */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Register Educational Institution</h2>
            <form onSubmit={handleCreateCollege} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Institution Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Stanford Technical Institute"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">College Code (Unique)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. STI"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Official Email</label>
                  <input
                    required
                    type="email"
                    placeholder="registrar@sti.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Campus address, city, country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  Save Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to Register College Admin */}
      {showAdminModal && selectedCollege && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Assign College Administrator</h2>
            <p className="text-xs text-slate-500 mb-4">Institution: <b className="text-slate-800">{selectedCollege.college_name}</b></p>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Administrator Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dr. Arthur Pendelton"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Work Email</label>
                <input
                  required
                  type="email"
                  placeholder="admin@college.edu"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

