import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { DataTable } from '../../components/admin/DataTable.jsx';

export default function AuditLogsPage() {
  const dummyLogs = [
    { timestamp: '2026-08-09 14:00', admin: 'Super Admin', action: 'TAX_SETTINGS_UPDATED', module: 'Tax Settings', details: 'Updated GST rate to 18% and platform fee to ₹20' },
    { timestamp: '2026-08-09 12:15', admin: 'Super Admin', action: 'ORGANIZER_APPROVED', module: 'Organizers', details: 'Approved Apex Events LLC application' },
  ];

  const columns = [
    { header: 'Timestamp', render: (row) => <span style={{ color: C.gold }}>{row.timestamp}</span> },
    { header: 'Admin / Actor', accessorKey: 'admin', render: (row) => <strong style={{ color: C.text }}>{row.admin}</strong> },
    { header: 'Action', accessorKey: 'action', render: (row) => <span style={{ color: C.blue }}>{row.action}</span> },
    { header: 'Module', accessorKey: 'module' },
    { header: 'Details', accessorKey: 'details', render: (row) => <span style={{ color: C.muted }}>{row.details}</span> },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '26px', margin: '0 0 4px' }}>
          Platform Security Audit Trail
        </h1>
        <p style={{ color: C.muted, margin: 0, fontSize: '14px' }}>Immutable activity log of administrative actions and security modifications</p>
      </div>

      <DataTable columns={columns} data={dummyLogs} loading={false} />
    </div>
  );
}
