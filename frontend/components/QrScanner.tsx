import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { parseCertificateId } from '../utils/certificate';

const READER_ID = 'qr-reader-container';

function mapCameraError(err: any): string {
  const raw = String(err?.message || err || '').toLowerCase();
  if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
    return 'Camera requires a secure HTTPS connection.';
  }
  if (raw.includes('notallowed') || raw.includes('permission') || raw.includes('denied')) {
    return 'Camera permission denied. Allow camera access in your browser settings.';
  }
  if (raw.includes('notfound') || raw.includes('no camera') || raw.includes('requested device')) {
    return 'No camera was found on this device.';
  }
  if (raw.includes('in use') || raw.includes('notreadable') || raw.includes('abort') || raw.includes('trackstart')) {
    return 'Camera is already in use by another application.';
  }
  return err?.message || 'Unable to start the camera.';
}

interface QrScannerProps {
  onDecoded: (certificateId: string) => void;
  onError?: (message: string) => void;
}

export default function QrScanner({ onDecoded, onError }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const camerasRef = useRef<Array<{ id: string; label: string }>>([]);
  const cameraIndexRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [cameraCount, setCameraCount] = useState(0);

  const setErr = (msg: string) => {
    setError(msg);
    onError?.(msg);
  };

  const attachVideoAttrs = () => {
    const video = document.querySelector(`#${READER_ID} video`) as HTMLVideoElement | null;
    if (video) {
      video.setAttribute('playsinline', 'true');
      video.playsInline = true;
      video.muted = true;
    }
  };

  const stopScanner = async () => {
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
      await scanner.clear();
    } catch {
      /* ignore */
    }
    startedRef.current = false;
  };

  const startWithCamera = async (cameraId?: string) => {
    if (!scannerRef.current) return;
    await stopScanner();
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    const cameraConfig = cameraId
      ? cameraId
      : { facingMode: { ideal: 'environment' } };
    await scannerRef.current.start(
      cameraConfig as any,
      config,
      (decodedText: string) => {
        const id = parseCertificateId(decodedText);
        if (id) {
          stopScanner();
          onDecoded(id);
        }
      },
      () => {}
    );
    startedRef.current = true;
    attachVideoAttrs();
  };

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(READER_ID, { verbose: false });
    scannerRef.current = scanner;

    const boot = async () => {
      try {
        if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
          throw new Error('insecure');
        }
        const cameras = await Html5Qrcode.getCameras();
        if (cancelled) return;
        camerasRef.current = cameras || [];
        setCameraCount(camerasRef.current.length);
        const back = camerasRef.current.find((c) => /back|rear|environment/i.test(c.label));
        cameraIndexRef.current = back
          ? camerasRef.current.findIndex((c) => c.id === back.id)
          : 0;
        await startWithCamera(back?.id);
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) setErr(mapCameraError(err));
      }
    };

    boot();

    return () => {
      cancelled = true;
      stopScanner().finally(() => {
        scannerRef.current = null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchCamera = async () => {
    if (camerasRef.current.length < 2) return;
    cameraIndexRef.current = (cameraIndexRef.current + 1) % camerasRef.current.length;
    try {
      await startWithCamera(camerasRef.current[cameraIndexRef.current].id);
    } catch (err) {
      setErr(mapCameraError(err));
    }
  };

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    try {
      const temp = scannerRef.current || new Html5Qrcode(READER_ID);
      const decoded = await temp.scanFile(file, true);
      const id = parseCertificateId(decoded);
      if (!id) {
        setErr('No certificate ID was found in that photo.');
        return;
      }
      onDecoded(id);
    } catch (err) {
      setErr(mapCameraError(err) || 'Could not read a QR code from that photo.');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm text-left">
          {error}
        </div>
      )}
      <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-inner overflow-hidden max-w-md mx-auto">
        <div id={READER_ID} className="w-full min-h-[260px] rounded-xl overflow-hidden bg-slate-950" />
        {!ready && !error && (
          <p className="text-xs text-slate-400 text-center mt-3">Starting camera…</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {cameraCount > 1 && (
          <button
            type="button"
            onClick={switchCamera}
            className="min-h-[44px] px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
          >
            Switch camera
          </button>
        )}
        <label className="min-h-[44px] px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-sm cursor-pointer inline-flex items-center justify-center">
          Scan from a photo
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
