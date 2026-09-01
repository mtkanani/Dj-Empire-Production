import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Tag, RefreshCw, CheckCircle, XCircle, Filter } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { adminService } from '../../services/admin/adminService.js';
import { useToast } from '../../hooks/useToast.js';
import { EVENT_STATUS_LABELS, getEventStatusBadgeProps } from '../../utils/eventStateUtils.js';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PendingApproval', label: 'Pending Approval' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Published', label: 'Published' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Unpublished', label: 'Unpublished' },
  { value: 'Cancelled', label: 'Cancelled' },
];

function unwrapEvents(res) {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.events)) return d.events;
  if (Array.isArray(res)) return res;
  return [];
}

export default function EventsPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getEvents();
      setEvents(unwrapEvents(res));
    } catch (err) {
      showToast(err?.message || 'Failed to load platform events', 'error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const fromUrl = searchParams.get('status') || 'ALL';
    if (fromUrl !== statusFilter) setStatusFilter(fromUrl);
  }, [searchParams, statusFilter]);

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'ALL') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', value);
    }
    setSearchParams(nextParams);
  };

  const handleApproveEvent = async (eventId, title) => {
    setActionLoading(eventId);
    try {
      await adminService.approveEvent(eventId);
      showToast(`Event "${title}" approved. Organizer can now publish it.`, 'success');
      fetchEvents();
    } catch (err) {
      showToast(err?.message || 'Failed to approve event', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEvent = async (eventId, title) => {
    const reason = window.prompt(`Reason for rejecting "${title}"?`);
    if (!reason?.trim()) return;
    setActionLoading(eventId);
    try {
      await adminService.rejectEvent(eventId, reason.trim());
      showToast(`Event "${title}" rejected.`, 'warning');
      fetchEvents();
    } catch (err) {
      showToast(err?.message || 'Failed to reject event', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = events.filter((e) => {
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.venue?.name?.toLowerCase().includes(q) ||
      e.city?.name?.toLowerCase().includes(q) ||
      e.category?.name?.toLowerCase().includes(q) ||
      e.organizer?.organizerProfile?.companyName?.toLowerCase().includes(q) ||
      e.organizer?.email?.toLowerCase().includes(q)
    );
  });

  const counts = {
    total: events.length,
    pending: events.filter((e) => e.status === 'PendingApproval').length,
    approved: events.filter((e) => e.status === 'Approved').length,
    published: events.filter((e) => e.status === 'Published').length,
  };

  const getStatusBadge = (status) => {
    const { label, bg, color, border } = getEventStatusBadgeProps(status);
    return (
      <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: bg, color, border: `1px solid ${border}` }}>
        {label || EVENT_STATUS_LABELS[status] || status}
      </span>
    );
  };

  const columns = [
    {
      header: 'Event Title',
      render: (row) => (
        <div>
          <strong style={{ color: C.text, display: 'block', fontSize: '14px' }}>{row.title}</strong>
          <span style={{ color: C.muted, fontSize: '12px' }}>
            by {row.organizer?.organizerProfile?.companyName || `${row.organizer?.firstName || ''} ${row.organizer?.lastName || ''}`.trim() || row.organizer?.email || 'Organizer'}
          </span>
        </div>
      ),
    },
    {
      header: 'Category & City',
      render: (row) => (
        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ color: C.gold, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} /> {row.category?.name || 'Uncategorized'}
          </span>
          <span style={{ color: C.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> {row.city?.name || 'Multiple Cities'}
          </span>
        </div>
      ),
    },
    {
      header: 'Venue',
      render: (row) => (
        <span style={{ color: C.text, fontSize: '13px' }}>
          {row.venue?.name || 'TBA'}
        </span>
      ),
    },
    {
      header: 'Ticket Tiers',
      render: (row) => (
        <span style={{ color: C.text, fontSize: '12px' }}>
          {row.ticketTypes?.length || 0} Tier(s)
        </span>
      ),
    },
    {
      header: 'Bookings',
      render: (row) => (
        <span style={{ color: C.gold, fontWeight: 700, fontSize: '13px' }}>
          {row._count?.bookings || 0} Orders
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      render: (row) => {
        const isPending = row.status === 'PendingApproval';
        const isProcessing = actionLoading === row.id;

        if (isPending) {
          return (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleApproveEvent(row.id, row.title)}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: C.greenDim,
                  color: C.green,
                  border: `1px solid ${C.green}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                <CheckCircle size={14} />
                {isProcessing ? 'Approving...' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={() => handleRejectEvent(row.id, row.title)}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: C.redDim,
                  color: C.red,
                  border: `1px solid ${C.red}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                <XCircle size={14} />
                Reject
              </button>
            </div>
          );
        }

        if (row.status === 'Approved') {
          return <span style={{ color: C.blue, fontSize: '12px', fontWeight: 600 }}>Approved — awaiting publish</span>;
        }
        if (row.status === 'Published') {
          return <span style={{ color: C.green, fontSize: '12px', fontWeight: 600 }}>Live</span>;
        }
        return <span style={{ color: C.muted, fontSize: '12px' }}>{EVENT_STATUS_LABELS[row.status] || row.status}</span>;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '26px', margin: '0 0 4px' }}>
            Platform Events Management & Approvals
          </h1>
          <p style={{ color: C.muted, margin: 0, fontSize: '14px' }}>
            Review organizer event submissions. Approve pending events so organizers can publish them.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchEvents}
          style={{ padding: '8px 14px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {[
          { label: 'Total', value: counts.total, color: C.blue, bg: C.blueDim, border: C.borderBlue, status: 'ALL' },
          { label: 'Pending', value: counts.pending, color: C.amber, bg: C.amberDim, border: C.amber, status: 'PendingApproval' },
          { label: 'Approved', value: counts.approved, color: C.blue, bg: C.blueDim, border: C.borderBlue, status: 'Approved' },
          { label: 'Published', value: counts.published, color: C.green, bg: C.greenDim, border: C.green, status: 'Published' },
        ].map(({ label, value, color, bg, border, status }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleStatusChange(status)}
            style={{
              background: bg,
              border: `1px solid ${statusFilter === status ? color : border}`,
              borderRadius: '10px',
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <span style={{ color, fontSize: '18px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{value}</span>
            <span style={{ color: C.muted, fontSize: '12px' }}>{label}</span>
          </button>
        ))}
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '220px' }}>
          <Search size={16} color={C.muted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search events by title, venue, city, or organizer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 40px', background: C.panel, border: `1px solid ${C.border}`, borderRadius: '12px', color: C.text, fontSize: '13px', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color={C.muted} />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
              color: C.text,
              fontSize: '13px',
              padding: '10px 14px',
              outline: 'none',
              minWidth: '180px',
              cursor: 'pointer',
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: C.bgCard }}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyText={statusFilter === 'PendingApproval' ? 'No events awaiting approval' : 'No events found on the platform'}
      />
    </div>
  );
}
