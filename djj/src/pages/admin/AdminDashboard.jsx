import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building, Calendar, Ticket, ShieldAlert,
  CheckCircle2, RefreshCw, Filter
} from 'lucide-react';
import { C } from '../../constants/theme.js';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { RevenueChart } from '../../components/admin/charts/RevenueChart.jsx';
import { BookingChart } from '../../components/admin/charts/BookingChart.jsx';
import { UsersChart } from '../../components/admin/charts/UsersChart.jsx';
import { EventsChart } from '../../components/admin/charts/EventsChart.jsx';
import { PaymentStatusChart } from '../../components/admin/charts/PaymentStatusChart.jsx';
import { EventStatusChart } from '../../components/admin/charts/EventStatusChart.jsx';
import { RecentActivity } from '../../components/admin/RecentActivity.jsx';
import { PendingApprovals } from '../../components/admin/PendingApprovals.jsx';
import { QuickActions } from '../../components/admin/QuickActions.jsx';
import { Button } from '../../components/common/Button.jsx';
import { adminService } from '../../services/admin/adminService.js';
import { getSocket } from '../../services/socket/socketClient.js';

const EMPTY_METRICS = {
  totalUsers: 0,
  totalOrganizers: 0,
  totalCustomers: 0,
  totalEvents: 0,
  publishedEvents: 0,
  totalBookings: 0,
  pendingApprovals: 0,
};

function unwrapMetrics(res) {
  const d = res?.data || {};
  const nested = d.metrics && typeof d.metrics === 'object' ? d.metrics : {};
  const src = { ...nested, ...d };
  return {
    totalUsers: Number(src.totalUsers) || 0,
    totalOrganizers: Number(src.totalOrganizers) || 0,
    totalCustomers: Number(src.totalCustomers) || 0,
    totalEvents: Number(src.totalEvents) || 0,
    publishedEvents: Number(src.publishedEvents ?? src.activeEvents) || 0,
    totalBookings: Number(src.totalBookings) || 0,
    pendingApprovals: Number(src.pendingApprovals) || 0,
    pendingEvents: Array.isArray(src.pendingEvents) ? src.pendingEvents : [],
  };
}

function unwrapList(res) {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.events)) return d.events;
  if (Array.isArray(res)) return res;
  return [];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [pendingEvents, setPendingEvents] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboardMetrics({ range: dateRange });
      const mapped = unwrapMetrics(res);
      setMetrics(mapped);

      let pending = mapped.pendingEvents || [];
      if (!pending.length) {
        const eventsRes = await adminService.getEvents({ status: 'PendingApproval' });
        pending = unwrapList(eventsRes).filter((e) => e.status === 'PendingApproval');
      }
      setPendingEvents(pending);
      if (!mapped.pendingApprovals && pending.length) {
        setMetrics((prev) => ({ ...prev, pendingApprovals: pending.length }));
      }
    } catch {
      setMetrics(EMPTY_METRICS);
      setPendingEvents([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();

    const socket = getSocket();
    const handleRealtime = () => {
      fetchDashboardData();
    };

    socket.on('booking:confirmed', handleRealtime);
    socket.on('seat:sold', handleRealtime);
    socket.on('event:availability_updated', handleRealtime);

    return () => {
      socket.off('booking:confirmed', handleRealtime);
      socket.off('seat:sold', handleRealtime);
      socket.off('event:availability_updated', handleRealtime);
    };
  }, [fetchDashboardData]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.text, fontSize: '28px', margin: '0 0 6px' }}>
            Platform Admin Dashboard
          </h1>
          <p style={{ color: C.muted, margin: 0, fontSize: '14px' }}>
            Central overview of users, organizers, events, bookings, and pending event approvals
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', background: C.panel, padding: '6px 14px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <Filter size={14} color={C.gold} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: C.text,
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
              }}
            >
              <option value="Today" style={{ background: C.bgCard }}>Today</option>
              <option value="Yesterday" style={{ background: C.bgCard }}>Yesterday</option>
              <option value="Last 7 Days" style={{ background: C.bgCard }}>Last 7 Days</option>
              <option value="Last 30 Days" style={{ background: C.bgCard }}>Last 30 Days</option>
              <option value="Last 90 Days" style={{ background: C.bgCard }}>Last 90 Days</option>
              <option value="This Year" style={{ background: C.bgCard }}>This Year</option>
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={fetchDashboardData} loading={loading}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard title="Total Platform Users" value={metrics.totalUsers} icon={Users} loading={loading} accentColor={C.gold} />
        <StatCard title="Total Organizers" value={metrics.totalOrganizers} icon={Building} loading={loading} accentColor={C.blue} onClick={() => navigate('/admin/organizers')} />
        <StatCard title="Total Customers" value={metrics.totalCustomers} icon={Users} loading={loading} accentColor={C.green} onClick={() => navigate('/admin/customers')} />
        <StatCard title="Total Events" value={metrics.totalEvents} icon={Calendar} loading={loading} accentColor={C.purple} onClick={() => navigate('/admin/events')} />
        <StatCard title="Published Events" value={metrics.publishedEvents} icon={CheckCircle2} loading={loading} accentColor={C.green} onClick={() => navigate('/admin/events?status=Published')} />
        <StatCard title="Total Ticket Bookings" value={metrics.totalBookings} icon={Ticket} loading={loading} accentColor={C.blue} />
        <StatCard
          title="Pending Approvals"
          value={metrics.pendingApprovals}
          icon={ShieldAlert}
          loading={loading}
          accentColor={C.amber}
          onClick={() => navigate('/admin/events?status=PendingApproval')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <RevenueChart loading={loading} />
        <BookingChart loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <UsersChart loading={loading} />
        <EventsChart loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <PaymentStatusChart loading={loading} />
        <EventStatusChart loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <PendingApprovals events={pendingEvents} onRefresh={fetchDashboardData} />
        <RecentActivity />
      </div>

      <QuickActions />
    </div>
  );
}
