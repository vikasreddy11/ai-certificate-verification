import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

export default function CollegeStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [course, setCourse] = useState('B.Tech');
  const [graduationYear, setGraduationYear] = useState('2026');

  // Bulk file state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/students', {
        params: { search: search || undefined }
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/students', {
        student_name: studentName,
        roll_number: rollNumber,
        department,
        course,
        graduation_year: parseInt(graduationYear),
      });
      setShowAddModal(false);
      setStudentName('');
      setRollNumber('');
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to enroll student');
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }
    setBulkUploading(true);
    setBulkResult(null);

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.post('/api/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBulkResult(res.data);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Bulk upload error');
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <DashboardLayout role="COLLEGE_ADMIN">
      <Head>
        <title>Student Registry - CertiVerify AI</title>
      </Head>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-sm text-slate-500">Manage institutional student rosters, roll numbers, and bulk import records.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 transition"
          >
            Bulk CSV Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by student name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading student directory...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No student records found.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Roll Number</th>
                <th className="px-6 py-4 text-left">Student Name</th>
                <th className="px-6 py-4 text-left">Department</th>
                <th className="px-6 py-4 text-left">Course</th>
                <th className="px-6 py-4 text-left">Graduation Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{stu.roll_number}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {stu.student_name}
                    {stu.is_demo && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-md font-medium">
                        DEMO
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{stu.department}</td>
                  <td className="px-6 py-4 text-slate-600">{stu.course}</td>
                  <td className="px-6 py-4 text-slate-600">{stu.graduation_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal to Add Individual Student */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Enroll New Student</h2>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Student Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Maya Sterling"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Roll / Registration Number</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AIT-2022-1089"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono focus:outline-none focus:border-blue-600 uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <input
                    required
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Course</label>
                  <input
                    required
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Graduation Year</label>
                <input
                  required
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for CSV Bulk Upload */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Bulk CSV Student Import</h2>
            <p className="text-xs text-slate-500 mb-4">
              Upload a UTF-8 encoded CSV file containing columns: <code>student_name</code>, <code>roll_number</code>, <code>department</code>, <code>course</code>, <code>graduation_year</code>.
            </p>

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {bulkResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <p className="font-semibold">{bulkResult.message}</p>
                  {bulkResult.errors?.length > 0 && (
                    <ul className="mt-1 list-disc list-inside text-red-600">
                      {bulkResult.errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowBulkModal(false); setBulkResult(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={bulkUploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {bulkUploading ? 'Uploading & Parsing...' : 'Import CSV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

