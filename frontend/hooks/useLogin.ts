import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import api, { withWakeRetry } from '../utils/api';
import { pathForRole, portalNameForRole } from '../utils/certificate';

export type LoginUser = {
  access_token: string;
  role: string;
  email: string;
  full_name: string;
};

function loginErrorMessage(err: any): string {
  const status = err?.response?.status;
  if (!err?.response || status === 502 || status === 503 || status === 504) {
    return 'Cannot reach the server, try again in a minute';
  }
  if (status === 401) return 'Incorrect email or password';
  if (status === 403) return 'Account is disabled';
  if (status === 422) return 'Please enter a valid email';
  if (status >= 500) return 'Server error, please try again';
  return err.response?.data?.detail || 'Login failed. Please try again.';
}

export function useLogin(options?: { expectedRoles?: string[] }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const persistAndRedirect = (user: LoginUser) => {
    localStorage.setItem('token', user.access_token);
    localStorage.setItem('user', JSON.stringify(user));
    router.push(pathForRole(user.role));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSlow(false);
    setRetrying(false);
    timerRef.current = setTimeout(() => setSlow(true), 4000);

    const trimmedEmail = email.trim();

    try {
      const res = await withWakeRetry(
        () => api.post('/api/auth/login', { email: trimmedEmail, password }),
        () => {
          setRetrying(true);
          setError(
            'The server is waking up (free hosting can take up to 50 seconds). Retrying...'
          );
        }
      );
      const user = res.data as LoginUser;
      const expected = options?.expectedRoles;
      if (expected && expected.length > 0 && !expected.includes(user.role)) {
        setError(`This account belongs to the ${portalNameForRole(user.role)} portal`);
        persistAndRedirect(user);
        return;
      }
      persistAndRedirect(user);
    } catch (err: any) {
      setError(loginErrorMessage(err));
    } finally {
      if (timerRef.current) clearTimeout(timerRef.current);
      setLoading(false);
      setSlow(false);
      setRetrying(false);
    }
  };

  const buttonLabel = (idle: string) => {
    if (retrying || (loading && slow)) return 'Connecting to server...';
    if (loading) return 'Signing In...';
    return idle;
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    slow,
    retrying,
    handleSubmit,
    buttonLabel,
  };
}
