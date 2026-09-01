import React from 'react';
import { formatDate } from '../../utils/formatters.js';
import { C } from '../../constants/theme.js';

export const RecentCheckInsTable = ({ logs = [], loading = false }) => {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', color: C.text, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
        Scan Audit History Feed
      </h3>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: C.muted }}>Loading scan audit logs...</div>
      ) : logs.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: C.muted, fontSize: '13px' }}>No scan history logs found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: 'uppercase', fontSize: '11px' }}>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Booking Ref</th>
                <th style={{ padding: '10px 12px' }}>Customer Name</th>
                <th style={{ padding: '10px 12px' }}>Gate</th>
                <th style={{ padding: '10px 12px' }}>Scanned By</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const customer = log.booking?.customer || log.scannedByUser || {};
                const customerName = customer.firstName ? `${customer.firstName} ${customer.lastName}` : 'Guest';
                const isSuccess = log.scanResult === 'SUCCESS';

                return (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px', color: C.muted }}>
                      {formatDate(log.scannedAt || log.createdAt)}
                    </td>
                    <td style={{ padding: '12px', color: C.gold, fontFamily: 'Space Grotesk, monospace', fontWeight: 700 }}>
                      #{log.booking?.bookingNumber || log.bookingId || 'BK-REF'}
                    </td>
                    <td style={{ padding: '12px', color: C.text, fontWeight: 600 }}>
                      {customerName}
                    </td>
                    <td style={{ padding: '12px', color: C.text }}>
                      {log.gate?.name || 'Main Entrance'}
                    </td>
                    <td style={{ padding: '12px', color: C.muted }}>
                      {log.scannedByUser?.firstName ? `${log.scannedByUser.firstName} ${log.scannedByUser.lastName}` : 'Scanner Staff'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', background: isSuccess ? C.greenDim : C.redDim, color: isSuccess ? C.green : C.red, fontWeight: 700, fontSize: '11px' }}>
                        {log.scanResult || 'SUCCESS'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
