export const CERT_ID_FULL = /^CERT-[A-Z0-9]+-\d{4}-\d{4,6}$/;
export const CERT_ID_IN_TEXT = /CERT-[A-Z0-9]+-\d{4}-\d{4,6}/i;

export function normalizeCertificateId(raw: string): string {
  return (raw || '').trim().toUpperCase();
}

export function parseCertificateId(raw: string): string | null {
  const text = (raw || '').trim();
  const match = text.match(CERT_ID_IN_TEXT);
  if (match) return match[0].toUpperCase();
  const normalized = normalizeCertificateId(text);
  return CERT_ID_FULL.test(normalized) ? normalized : null;
}

export function portalNameForRole(role?: string): string {
  if (role === 'SUPER_ADMIN') return 'super admin';
  if (role === 'COLLEGE_ADMIN') return 'institution';
  if (role === 'COMPANY') return 'public verification';
  return 'another';
}

export function pathForRole(role?: string): string {
  if (role === 'SUPER_ADMIN') return '/admin/dashboard';
  if (role === 'COLLEGE_ADMIN') return '/college/dashboard';
  return '/verify';
}
