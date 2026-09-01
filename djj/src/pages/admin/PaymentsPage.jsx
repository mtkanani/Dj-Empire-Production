import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { adminService } from '../../services/admin/adminService.js';
import { formatCurrency } from '../../utils/formatters.js';

const statusStyle = (status) => {
  const s = String(status || '').toUpperCase();
  if (['PAID', 'CAPTURED', 'SUCCESS'].includes(s)) {
    return { background: C.greenDim, color: C.green, border: `1px solid ${C.green}` };
  }
  if (['FAILED', 'CANCELLED', 'CHARGEBACK'].includes(s)) {
    return { background: C.redDim, color: C.red, border: `1px solid ${C.red}` };
  }
  if (['REFUNDED', 'PARTIALLYREFUNDED'].includes(s)) {
    return { background: C.amberDim || 'rgba(245,158,11,0.15)', color: C.amber || '#F59E0B', border: `1px solid ${C.amber || '#F59E0B'}` };
  }
  return { background: C.blueDim || 'rgba(59,130,246,0.15)', color: C.blue || '#3B82F6', border: `1px solid ${C.blue || '#3B82F6'}` };
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
};

const customerName = (user) => {
  if (!user) return '—';
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || user.email || '—';
};

const organizerLabel = (event) => {
  const org = event?.organizer;
  if (!org) return '—';
  return (
    org.organizerProfile?.companyName ||
    `${org.firstName || ''} ${org.lastName || ''}`.trim() ||
    org.email ||
    '—'
  );
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPayments = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getPayments({ page, limit: 50 });
      const body = res?.data !== undefined ? res : { data: res };
      const list = Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : [];
      setPayments(list);
      setMeta(body.meta || { page, limit: 50, total: list.length, totalPages: 1 });
    } catch (err) {
      setError(err?.message || 'Unable to load platform payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments(1);
  }, [loadPayments]);

  const columns = [
    {
      header: 'Payment ID',
      render: (row) => (
        <strong style={{ color: C.gold, fontFamily: 'monospace', fontSize: '12px' }}>
          {row.paymentNumber || row.id}
        </strong>
      ),
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <div style={{ color: C.text, fontSize: '13px' }}>{customerName(row.user)}</div>
          <div style={{ color: C.muted, fontSize: '11px' }}>{row.user?.email || ''}</div>
        </div>
      ),
    },
    {
      header: 'Event',
      render: (row) => (
        <span style={{ color: C.text, fontSize: '13px' }}>{row.event?.title || '—'}</span>
      ),
    },
    {
      header: 'Organizer',
      render: (row) => (
        <span style={{ color: C.muted, fontSize: '12px' }}>{organizerLabel(row.event)}</span>
      ),
    },
    {
      header: 'Amount',
      render: (row) => (
        <span style={{ color: C.gold, fontWeight: 700 }}>
          {formatCurrency(row.paidAmount || row.totalAmount || 0, row.currency || 'INR')}
        </span>
      ),
    },
    {
      header: 'Gateway',
      render: (row) => (
        <span style={{ color: C.muted, fontSize: '12px' }}>
          {row.gateway || '—'}
          {row.paymentMethod ? ` · ${row.paymentMethod}` : ''}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            ...statusStyle(row.paymentStatus),
          }}
        >
          {row.paymentStatus || '—'}
        </span>
      ),
    },
    {
      header: 'Date',
      render: (row) => (
        <span style={{ color: C.muted, fontSize: '12px' }}>
          {formatDate(row.paymentDate || row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: C.gold,
              fontSize: '26px',
              margin: '0 0 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CreditCard size={24} /> Payment Transactions
          </h1>
          <p style={{ color: C.muted, margin: 0, fontSize: '14px' }}>
            All payments across every organizer and event on the platform
            {meta.total != null ? ` · ${meta.total} total` : ''}
          </p>
        </div>

        <button
          onClick={() => loadPayments(meta.page || 1)}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            color: C.text,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '16px',
            padding: '14px 18px',
            background: C.redDim,
            border: `1px solid ${C.red}`,
            borderRadius: '12px',
            color: C.red,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        emptyText="No payments recorded yet across the platform"
      />

      {meta.totalPages > 1 && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <button
            disabled={loading || meta.page <= 1}
            onClick={() => loadPayments(meta.page - 1)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: `1px solid ${C.border}`,
              background: C.bgCard,
              color: C.text,
              cursor: meta.page <= 1 ? 'not-allowed' : 'pointer',
              opacity: meta.page <= 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <span style={{ color: C.muted, fontSize: '13px' }}>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            disabled={loading || meta.page >= meta.totalPages}
            onClick={() => loadPayments(meta.page + 1)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: `1px solid ${C.border}`,
              background: C.bgCard,
              color: C.text,
              cursor: meta.page >= meta.totalPages ? 'not-allowed' : 'pointer',
              opacity: meta.page >= meta.totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
