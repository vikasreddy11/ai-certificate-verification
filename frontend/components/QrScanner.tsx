import React, { useCallback, useEffect, useRef, useState } from 'react';
import { parseCertificateId } from '../utils/certificate';

const READER_ID = 'qr-reader-container';

function mapCameraError(err: any): string {
  const raw = String(err?.message || err || '').toLowerCase();
  if (
    typeof window !== 'undefined' &&
    !window.isSecureContext &&
    window.location.hostname !== 'localhost'
  ) {
    return 'Camera requires a secure HTTPS connection.';
  }
  if (raw.includes('notallowed') || raw.includes('permission') || raw.includes('denied')) {
    return "Camera permission denied. Allow camera access in your browser's site settings and try again.";
  }
  if (raw.includes('notfound') || raw.includes('no camera') || raw.includes('requested device')) {
    return 'No camera found on this device.';
  }
  if (
    raw.includes('in use') ||
    raw.includes('notreadable') ||
    raw.includes('abort') ||
    raw.includes('trackstart')
  ) {
    return 'The camera is in use by another app.';
  }
  return err?.message || 'Unable to start the camera.';
}

interface QrScannerProps {
  onDecoded: (certificateId: string) => void;
  onError?: (message: string) => void;
}

export default function QrScanner({ onDecoded, onError }: QrScannerProps) {
  const scannerRef = useRef<any>(null);
  const startedRef = useRef(false);
  const mountedRef = useRef(true);
  const camerasRef = useRef<Array<{ id: string; label: string }>>([]);
  const cameraIndexRef = useRef(0);
  const decodedRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error' | 'decoded'>('loading');
  const [error, setError] = useState('');
  const [cameraCount, setCameraCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const setErr = useCallback(
    (msg: string) => {
      setError(msg);
      setStatus('error');
      onError?.(msg);
    },
    [onError]
  );

  const attachVideoAttrs = () => {
    try {
      const video = document.querySelector(`#${READER_ID} video`) as HTMLVideoElement | null;
      if (video) {
        video.setAttribute('playsinline', 'true');
        video.playsInline = true;
        video.muted = true;
        video.style.objectFit = 'cover';
        video.style.width = '100%';
        video.style.height = '100%';
      }
    } catch {
      /* noop */
    }
  };

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (startedRef.current) {
        await scanner.stop();
      }
    } catch {
      /* already stopped */
    }
    try {
      scanner.clear();
    } catch {
      /* ignore */
    }
    startedRef.current = false;
  }, []);

  const getResponsiveQrBox = () => {
    const container = containerRef.current;
    if (!container) return { width: 200, height: 200 };
    const w = container.clientWidth;
    const size = Math.min(Math.floor(w * 0.65), 280);
    return { width: Math.max(size, 150), height: Math.max(size, 150) };
  };

  const startWithCamera = useCallback(
    async (cameraId?: string) => {
      if (!scannerRef.current || !mountedRef.current) return;
      // Stop any existing scan first
      try {
        if (startedRef.current) {
          await scannerRef.current.stop();
          startedRef.current = false;
        }
      } catch {
        /* ignore */
      }

      const qrbox = getResponsiveQrBox();
      const config = { fps: 10, qrbox, aspectRatio: 1 };
      const cameraConfig = cameraId
        ? cameraId
        : { facingMode: { ideal: 'environment' } };

      await scannerRef.current.start(
        cameraConfig as any,
        config,
        (decodedText: string) => {
          if (decodedRef.current) return; // prevent double-fire
          const id = parseCertificateId(decodedText);
          if (id) {
            decodedRef.current = true;
            setStatus('decoded');
            stopScanner();
            onDecoded(id);
          }
          // If not a valid cert ID, keep scanning (don't show error while actively scanning)
        },
        () => {} // ignore scan failures (happens every frame without a QR code)
      );
      startedRef.current = true;
      attachVideoAttrs();

      // Re-attach after a short delay (some browsers render video async)
      setTimeout(attachVideoAttrs, 300);
    },
    [onDecoded, stopScanner]
  );

  useEffect(() => {
    mountedRef.current = true;
    decodedRef.current = false;
    let cancelled = false;
    let scanner: any = null;

    const boot = async () => {
      try {
        // Dynamic import to ensure this never runs server-side
        const { Html5Qrcode } = await import('html5-qrcode');

        if (cancelled) return;

        // Ensure the container element is in the DOM
        const el = document.getElementById(READER_ID);
        if (!el) {
          throw new Error('Scanner container not found in DOM');
        }

        scanner = new Html5Qrcode(READER_ID, { verbose: false });
        scannerRef.current = scanner;

        // Check secure context
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
          throw new Error('insecure');
        }

        const cameras = await Html5Qrcode.getCameras();
        if (cancelled) return;
        camerasRef.current = cameras || [];
        setCameraCount(camerasRef.current.length);

        if (camerasRef.current.length === 0) {
          throw new Error('No camera found on this device.');
        }

        // Try to pick the rear camera
        const back = camerasRef.current.find((c) =>
          /back|rear|environment/i.test(c.label)
        );
        cameraIndexRef.current = back
          ? camerasRef.current.findIndex((c) => c.id === back.id)
          : 0;

        await startWithCamera(back?.id);
        if (!cancelled && mountedRef.current) {
          setStatus('scanning');
        }
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          setErr(mapCameraError(err));
        }
      }
    };

    // Small delay to ensure DOM is painted
    const timer = setTimeout(boot, 100);

    return () => {
      cancelled = true;
      mountedRef.current = false;
      clearTimeout(timer);
      // Clean up the scanner
      const s = scannerRef.current;
      if (s) {
        (async () => {
          try {
            if (startedRef.current) await s.stop();
          } catch { /* ok */ }
          try {
            s.clear();
          } catch { /* ok */ }
          startedRef.current = false;
          scannerRef.current = null;
        })();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchCamera = async () => {
    if (camerasRef.current.length < 2) return;
    cameraIndexRef.current = (cameraIndexRef.current + 1) % camerasRef.current.length;
    setStatus('loading');
    try {
      await startWithCamera(camerasRef.current[cameraIndexRef.current].id);
      setStatus('scanning');
    } catch (err) {
      setErr(mapCameraError(err));
    }
  };

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      // Use a temporary hidden element for scanFile to avoid interfering with the main scanner
      let tempDiv = document.getElementById('qr-scanfile-temp');
      if (!tempDiv) {
        tempDiv = document.createElement('div');
        tempDiv.id = 'qr-scanfile-temp';
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
      }
      const tempScanner = new Html5Qrcode('qr-scanfile-temp', { verbose: false });
      const decoded = await tempScanner.scanFile(file, true);
      try { tempScanner.clear(); } catch { /* ok */ }
      const id = parseCertificateId(decoded);
      if (!id) {
        setErr('This QR code is not a CertiVerify certificate.');
        return;
      }
      decodedRef.current = true;
      setStatus('decoded');
      stopScanner();
      onDecoded(id);
    } catch {
      setErr('Could not read a QR code from that photo. Try a clearer image.');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm text-left">
          <span className="font-bold block mb-1">Camera Notice</span>
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        className="bg-slate-900 rounded-2xl p-3 sm:p-4 text-white shadow-inner overflow-hidden max-w-[480px] mx-auto"
      >
        <div
          id={READER_ID}
          className="w-full rounded-xl overflow-hidden bg-slate-950"
          style={{ minHeight: '280px', aspectRatio: '1 / 1', maxHeight: '400px' }}
        />
        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Starting camera…</p>
          </div>
        )}
        {status === 'scanning' && (
          <p className="text-xs text-slate-400 text-center mt-3">
            Point the camera at the QR code on the certificate
          </p>
        )}
        {status === 'decoded' && (
          <p className="text-xs text-emerald-400 text-center mt-3 font-semibold">
            ✓ QR code detected! Loading result…
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {cameraCount > 1 && (
          <button
            type="button"
            onClick={switchCamera}
            className="min-h-[44px] px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
          >
            🔄 Switch camera
          </button>
        )}
        <label className="min-h-[44px] px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-sm cursor-pointer inline-flex items-center justify-center">
          📷 Scan from a photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handlePhoto(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}
