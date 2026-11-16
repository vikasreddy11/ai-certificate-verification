import React from 'react';

export function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    VERIFIED: 'bg-emerald-100 text-emerald-800',
    MISMATCH: 'bg-amber-100 text-amber-800',
    REVOKED: 'bg-red-100 text-red-800',
    NOT_FOUND: 'bg-slate-200 text-slate-800',
    INVALID_SIGNATURE: 'bg-red-100 text-red-800',
  };
  const cls = map[status || ''] || 'bg-slate-100 text-slate-800';
  return (
    <span
      className={`px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center ${cls}`}
    >
      {status || 'UNKNOWN'}
    </span>
  );
}

export default function VerificationResult({ result }: { result: any }) {
  if (!result) return null;
  const official = result.official_record || {};
  const extracted = result.extracted_record || {};
  const mismatches = result.mismatching_fields || {};
  const matching = result.matching_fields || {};
  const compareKeys = ['student_name', 'roll_number', 'college_name', 'course', 'department', 'graduation_year'];

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Verification Result
          </span>
          <span className="text-lg font-bold text-slate-900 font-mono break-all">
            {result.certificate_id || 'Certificate ID Unknown'}
          </span>
        </div>
        <StatusBadge status={result.verification_status} />
      </div>

      <p className="text-sm text-slate-700 font-medium mt-4">{result.message}</p>

      {result.verification_status === 'NOT_FOUND' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mt-4 font-semibold">
          The certificate ID from the QR code is not registered in the official database.
        </div>
      )}

      {result.official_record && (
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 mt-6">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Official database record
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400">Candidate Name</dt>
              <dd className="font-bold text-slate-900">{official.student_name}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Roll / Reg Number</dt>
              <dd className="font-mono font-bold text-slate-900">{official.roll_number}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Awarding Institution</dt>
              <dd className="font-semibold text-slate-800">{official.college_name}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Graduation Year</dt>
              <dd className="font-semibold text-slate-800">{official.graduation_year}</dd>
            </div>
          </dl>
        </div>
      )}

      {(result.extracted_record || Object.keys(mismatches).length > 0) && (
        <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Database value vs certificate value
          </h4>
          <div className="space-y-2">
            {compareKeys
              .filter((key) => official[key] != null || extracted[key] != null || mismatches[key])
              .map((key) => {
                const off = mismatches[key]?.official ?? official[key];
                const ext = mismatches[key]?.extracted ?? extracted[key];
                const isMismatch = Boolean(mismatches[key]);
                return (
                  <div
                    key={key}
                    className={`p-3.5 rounded-xl text-sm border ${
                      isMismatch ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="font-bold uppercase text-xs block mb-2">{key.replace('_', ' ')}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block text-xs">Database value</span>
                        <span className="font-bold text-slate-900">{off ?? '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Certificate value</span>
                        <span className={isMismatch ? 'font-bold text-amber-800' : 'font-bold text-slate-900'}>
                          {ext ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {Object.keys(matching).length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            Matching fields
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(matching).map(([key, val]: any) => (
              <div
                key={key}
                className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2"
              >
                <span className="capitalize text-emerald-900 font-medium">{key.replace('_', ' ')}</span>
                <span className="text-emerald-700 font-bold font-mono text-right">{val.official}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
