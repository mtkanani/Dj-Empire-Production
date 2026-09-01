import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export const QRCodeDisplay = ({ value = '', size = 180, bg = '#FFFFFF', fg = '#000000' }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    const payload = value || 'EVENTPASS-TICKET';

    QRCode.toDataURL(payload, {
      width: size,
      margin: 1,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [value, size, bg, fg]);

  if (!dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: bg,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: '11px',
        }}
      >
        Generating QR...
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Ticket QR code"
      width={size}
      height={size}
      style={{ background: bg, borderRadius: '8px', padding: '6px', boxSizing: 'border-box' }}
    />
  );
};
