import api, { withWakeRetry } from './api';
import { CERT_ID_FULL, normalizeCertificateId } from './certificate';

export function validateCertificateId(raw: string): { ok: true; id: string } | { ok: false; error: string } {
  const id = normalizeCertificateId(raw);
  if (!id) return { ok: false, error: 'Please enter a certificate ID.' };
  if (!CERT_ID_FULL.test(id)) {
    return {
      ok: false,
      error: 'Invalid format. Use CERT-CODE-YEAR-NNNN (example: CERT-AIT-2024-00001).',
    };
  }
  return { ok: true, id };
}

export function verifyRequestError(err: any): string {
  const status = err?.response?.status;
  if (!err?.response || status === 502 || status === 503 || status === 504) {
    return 'Cannot reach the server, try again in a minute';
  }
  if (status >= 500) return 'Server error, please try again';
  return err.response?.data?.detail || 'Verification failed. Please try again.';
}

export async function fetchVerification(
  certificateId: string,
  onRetry?: () => void
) {
  const res = await withWakeRetry(
    () => api.get(`/api/verification/verify/${encodeURIComponent(certificateId)}`),
    () => onRetry?.()
  );
  return res.data;
}
