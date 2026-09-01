import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Ticket,
  PackageCheck,
  UserCheck,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { C } from '../../constants/theme.js';
import { dashboardService } from '../../services/organizer/dashboardService.js';
import { formatCurrency } from '../../utils/formatters.js';

import { StatCard } from '../../components/organizer/StatCard.jsx';
import { SalesChart } from '../../components/organizer/charts/SalesChart.jsx';
import { RevenueChart } from '../../components/organizer/charts/RevenueChart.jsx';
import { TicketSalesChart } from '../../components/organizer/charts/TicketSalesChart.jsx';
import { AttendanceChart } from '../../components/organizer/charts/AttendanceChart.jsx';
import { EventPerformanceChart } from '../../components/organizer/charts/EventPerformanceChart.jsx';

import { UpcomingEvents } from '../../components/organizer/UpcomingEvents.jsx';
import { RecentBookings } from '../../components/organizer/RecentBookings.jsx';
import { RecentPayments } from '../../components/organizer/RecentPayments.jsx';
import { QuickActions } from '../../components/organizer/QuickActions.jsx';

import { getSocket } from '../../services/socket/socketClient.js';

export default function OrganizerDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [data, setData] = useState({
    kpis: {},
    charts: {},
    widgets: {},
    profile: null,
  });

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const summary = await dashboardService.getDashboardSummary();
      setData(summary);
    } catch (err) {
      setError(err.message || 'Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const socket = getSocket();
    const handleRealtimeUpdate = () => {
      fetchDashboardData(true);
    };

    socket.on('booking:confirmed', handleRealtimeUpdate);
    socket.on('seat:sold', handleRealtimeUpdate);

    return () => {
      socket.off('booking:confirmed', handleRealtimeUpdate);
      socket.off('seat:sold', handleRealtimeUpdate);
    };
  }, [fetchDashboardData]);

  const { kpis = {}, charts = {}, widgets = {}, profile } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      {/* 1. Dashboard Header & Date Filter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '26px',
                fontWeight: 700,
                color: C.text,
                margin: 0,
              }}
            >
              Organizer Dashboard
            </h1>

            {profile?.user?.status && (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: profile.user.status === 'ACTIVE' ? C.greenDim : C.goldDim,
                  color: profile.user.status === 'ACTIVE' ? C.green : C.gold,
                  border: `1px solid ${profile.user.status === 'ACTIVE' ? C.green : C.gold}`,
                }}
              >
                Status: {profile.user.status}
              </span>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
            Monitor your events, sales, bookings, and attendance in real time.
          </p>
        </div>

        {/* Date Filter & Refresh Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color={C.gold} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                color: C.text,
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'Space Grotesk, sans-serif',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="This Year">This Year</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'Custom Range' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                value={customRange.from}
                onChange={(e) => setCustomRange((p) => ({ ...p, from: e.target.value }))}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <span style={{ color: C.muted }}>to</span>
              <input
                type="date"
                value={customRange.to}
                onChange={(e) => setCustomRange((p) => ({ ...p, to: e.target.value }))}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </div>
          )}

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: C.goldDim,
              border: `1px solid ${C.borderGold}`,
              borderRadius: '12px',
              color: C.gold,
              fontWeight: 600,
              fontSize: '13px',
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Global Network Error State */}
      {error && (
        <div
          style={{
            padding: '20px',
            background: C.redDim,
            border: `1px solid ${C.red}`,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            color: C.text,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={22} color={C.red} />
            <div>
              <strong style={{ display: 'block', fontSize: '14px' }}>Dashboard Error</strong>
              <span style={{ fontSize: '13px', color: C.muted }}>{error}</span>
            </div>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            style={{
              padding: '8px 16px',
              background: C.red,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. 8 KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        <StatCard
          title="Today's Sales"
          value={formatCurrency(kpis.todaySales)}
          icon={TrendingUp}
          accentColor={C.blue}
          loading={loading}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(kpis.monthlyRevenue)}
          icon={DollarSign}
          accentColor={C.gold}
          loading={loading}
        />
        <StatCard
          title="Total Events"
          value={kpis.totalEvents}
          icon={Calendar}
          accentColor={C.purple}
          loading={loading}
        />
        <StatCard
          title="Upcoming Events"
          value={kpis.upcomingEventsCount}
          icon={Clock}
          accentColor={C.amber}
          loading={loading}
        />
        <StatCard
          title="Total Tickets Sold"
          value={kpis.totalTicketsSold}
          icon={Ticket}
          accentColor={C.green}
          loading={loading}
        />
        <StatCard
          title="Tickets Remaining"
          value={kpis.ticketsRemaining}
          icon={PackageCheck}
          accentColor={C.orange}
          loading={loading}
        />
        <StatCard
          title="Check-ins"
          value={kpis.checkInsCount}
          icon={UserCheck}
          accentColor={C.pink}
          loading={loading}
        />
        <StatCard
          title="Pending Payments"
          value={kpis.pendingPaymentsCount > 0 ? formatCurrency(kpis.pendingPaymentsAmount) : '0'}
          trendLabel={kpis.pendingPaymentsCount > 0 ? `${kpis.pendingPaymentsCount} pending` : 'No pending payments'}
          icon={CreditCard}
          accentColor={C.red}
          loading={loading}
        />
      </div>

      {/* 3. Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '24px',
        }}
        className="organizer-charts-grid"
      >
        <RevenueChart data={charts.revenueTrend} loading={loading} />
        <SalesChart data={charts.salesTrend} loading={loading} />
        <TicketSalesChart data={charts.ticketSalesTrend} loading={loading} />
        <AttendanceChart data={charts.attendanceBreakdown} loading={loading} />
      </div>

      <div style={{ width: '100%' }}>
        <EventPerformanceChart data={charts.eventPerformance} loading={loading} />
      </div>

      {/* 4. Dashboard Widgets & Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '24px',
        }}
        className="organizer-widgets-grid"
      >
        <UpcomingEvents events={widgets.upcomingEvents} loading={loading} />
        <QuickActions />
      </div>

      <div style={{ width: '100%' }}>
        <RecentBookings bookings={widgets.recentBookings} loading={loading} />
      </div>

      <div style={{ width: '100%' }}>
        <RecentPayments payments={widgets.recentPayments} loading={loading} />
      </div>
    </div>
  );
}
