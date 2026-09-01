import React, { useState, useEffect, useRef, useId } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CameraOff, Scan } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const QRScanner = ({ onScan, isScanning = true }) => {
  const scannerRef = useRef(null);
  const lastScanRef = useRef('');
  const onScanRef = useRef(onScan);
  const isScanningRef = useRef(isScanning);
  const uid = useId().replace(/:/g, '');
  const readerIdRef = useRef(`qr-reader-${uid}`);
  const [cameraActive, setCameraActive] = useState(false);
  const [mockTokenInput, setMockTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  onScanRef.current = onScan;
  isScanningRef.current = isScanning;

  useEffect(() => {
    let cancelled = false;
    let started = false;
    const readerId = readerIdRef.current;
    const html5Qr = new Html5Qrcode(readerId, { verbose: false });
    scannerRef.current = html5Qr;

    const safeStop = async () => {
      try {
        if (started || html5Qr.isScanning) {
          await html5Qr.stop();
        }
      } catch {
        // Ignore "Cannot stop, scanner is not running or paused."
      }
      try {
        html5Qr.clear();
      } catch {
        // Element may already be gone during Strict Mode remount
      }
    };

    const startScanner = async () => {
      try {
        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 8, qrbox: { width: 200, height: 200 } },
          (decodedText) => {
            if (!isScanningRef.current || !decodedText || decodedText === lastScanRef.current) return;
            lastScanRef.current = decodedText;
            if (onScanRef.current) onScanRef.current(decodedText);
          }
        );
        started = true;
        if (cancelled) {
          await safeStop();
          return;
        }
        setCameraActive(true);
        setErrorMsg(null);
      } catch {
        if (!cancelled) {
          setCameraActive(false);
          setErrorMsg('Camera permission denied or unavailable. Paste the QR payload or passcode below.');
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      lastScanRef.current = '';
      void safeStop();
    };
  }, []);

  useEffect(() => {
    if (isScanning) {
      lastScanRef.current = '';
    }
  }, [isScanning]);

  const handleSimulateScanSubmit = (e) => {
    e.preventDefault();
    if (mockTokenInput.trim() && onScan) {
      onScan(mockTokenInput.trim());
    }
  };

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.borderGold}`,
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          minHeight: '260px',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          background: '#000000',
          border: `2px solid ${isScanning ? C.gold : C.border}`,
        }}
      >
        <style>
          {`
            #${readerIdRef.current} video {
              width: 100% !important;
              height: 260px !important;
              object-fit: cover;
            }
            #${readerIdRef.current} img { display: none; }
          `}
        </style>
        <div id={readerIdRef.current} style={{ width: '100%', minHeight: '260px' }} />

        {!cameraActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              color: C.muted,
              fontSize: '12px',
              textAlign: 'center',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <CameraOff size={32} />
            <div>{errorMsg || 'Camera Preview Inactive'}</div>
          </div>
        )}

        {cameraActive && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0,0,0,0.55)',
              padding: '4px 10px',
              borderRadius: '999px',
              color: C.gold,
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <Scan size={12} /> {isScanning ? 'Scanning' : 'Paused'}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSimulateScanSubmit}
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          type="text"
          placeholder="Paste QR payload or TCK passcode..."
          value={mockTokenInput}
          onChange={(e) => setMockTokenInput(e.target.value)}
          style={{
            flexGrow: 1,
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!isScanning || !mockTokenInput.trim()}
          style={{
            padding: '10px 16px',
            background: C.gold,
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '13px',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: !isScanning || !mockTokenInput.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          Scan
        </button>
      </form>
    </div>
  );
};
