import React from 'react';

const inputClass =
  'mt-1 block w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2.5 text-base text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

interface LoginFormProps {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  buttonText: string;
  emailLabel?: string;
  dark?: boolean;
}

export default function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  loading,
  error,
  buttonText,
  emailLabel = 'Email Address',
  dark = false,
}: LoginFormProps) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {error && (
        <div
          className={
            dark
              ? 'bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-xl text-sm'
              : 'bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700 leading-relaxed'
          }
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          className={
            dark
              ? 'bg-blue-950/60 border border-blue-800 text-blue-200 p-3 rounded-xl text-xs'
              : 'bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-xl text-xs'
          }
        >
          Connecting to backend... If the server is spinning up, this may take up to 50 seconds.
        </div>
      )}

      <div>
        <label
          className={
            dark
              ? 'block text-xs font-semibold text-slate-300 mb-1'
              : 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1'
          }
        >
          {emailLabel}
        </label>
        <input
          type="email"
          required
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          spellCheck={false}
          inputMode="email"
          placeholder="admin@institution.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={
            dark
              ? 'w-full min-h-[44px] bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-blue-500'
              : inputClass
          }
        />
      </div>

      <div>
        <label
          className={
            dark
              ? 'block text-xs font-semibold text-slate-300 mb-1'
              : 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1'
          }
        >
          Password
        </label>
        <input
          type="password"
          required
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={
            dark
              ? 'w-full min-h-[44px] bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base text-white focus:outline-none focus:border-blue-500'
              : inputClass
          }
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[44px] flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition disabled:opacity-50"
      >
        {buttonText}
      </button>
    </form>
  );
}
