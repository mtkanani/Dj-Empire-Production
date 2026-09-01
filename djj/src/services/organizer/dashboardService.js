import { api } from '../api.js';

export const dashboardService = {
  /**
   * Get all organizer dashboard metrics, charts, and widget datasets.
   * Scoped strictly to the currently authenticated organizer via JWT.
   */
  async getDashboardSummary() {
    const results = await Promise.allSettled([
      api.get('/organizer/analytics'),
      api.get('/organizer/events'),
      api.get('/organizer/bookings'),
      api.get('/organizer/profile'),
    ]);

    const analyticsRes = results[0].status === 'fulfilled' ? results[0].value : null;
    const eventsRes = results[1].status === 'fulfilled' ? results[1].value : null;
    const bookingsRes = results[2].status === 'fulfilled' ? results[2].value : null;
    const profileRes = results[3].status === 'fulfilled' ? results[3].value : null;

    const analytics = analyticsRes?.data || analyticsRes || {};
    const rawEvents = Array.isArray(eventsRes?.data) ? eventsRes.data : Array.isArray(eventsRes) ? eventsRes : [];
    const rawBookings = Array.isArray(bookingsRes?.data) ? bookingsRes.data : Array.isArray(bookingsRes) ? bookingsRes : [];
    const profile = profileRes?.data || profileRes || null;

    // Filter out Archived events and their associated bookings from dashboard metrics
    const events = rawEvents.filter((ev) => ev.status !== 'Archived' && ev.status !== 'ARCHIVED');
    const archivedEventIds = new Set(
      rawEvents.filter((ev) => ev.status === 'Archived' || ev.status === 'ARCHIVED').map((ev) => ev.id)
    );
    const bookings = rawBookings.filter(
      (b) => !archivedEventIds.has(b.eventId) && !archivedEventIds.has(b.event?.id)
    );

    // Calculate Tickets Remaining across organizer's events
    let ticketsRemaining = 0;
    events.forEach((ev) => {
      if (Array.isArray(ev.ticketTypes)) {
        ev.ticketTypes.forEach((tt) => {
          ticketsRemaining += tt.quantityAvailable ?? (tt.quantityTotal - (tt.quantitySold || 0));
        });
      }
    });

    // Calculate Check-ins and Ticket Attendance Breakdown
    let checkedInCount = 0;
    let issuedCount = 0;
    let cancelledCount = 0;
    let pendingPaymentCount = 0;
    let pendingPaymentAmount = 0;

    bookings.forEach((b) => {
      const bStatus = (b.bookingStatus || b.status || '').toUpperCase();
      const pStatus = (b.paymentStatus || '').toUpperCase();

      if (bStatus === 'PENDING' || pStatus === 'PENDING' || bStatus === 'AWAITINGPAYMENT' || bStatus === 'RESERVED') {
        pendingPaymentCount += 1;
        pendingPaymentAmount += Number(b.totalAmount || 0);
      }

      if (Array.isArray(b.tickets)) {
        b.tickets.forEach((t) => {
          const tStatus = (t.status || '').toUpperCase();
          if (tStatus === 'CHECKED_IN' || tStatus === 'CHECKEDIN') {
            checkedInCount += 1;
          } else if (tStatus === 'ISSUED' || tStatus === 'VALID') {
            issuedCount += 1;
          } else if (tStatus === 'CANCELLED' || tStatus === 'EXPIRED') {
            cancelledCount += 1;
          }
        });
      }
    });

    // Construct Time Series Data for Charts (grouped by Date YYYY-MM-DD or MMM DD)
    const dateMap = {};
    const now = new Date();

    // Fill default 7-day timeline structure for smooth charts
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      dateMap[dateStr] = { date: dateStr, sales: 0, revenue: 0, tickets: 0 };
    }

    bookings.forEach((b) => {
      if (b.createdAt) {
        const d = new Date(b.createdAt);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = { date: dateStr, sales: 0, revenue: 0, tickets: 0 };
        }
        const bStatus = (b.bookingStatus || b.status || '').toUpperCase();
        const pStatus = (b.paymentStatus || '').toUpperCase();

        if (bStatus === 'CONFIRMED' || bStatus === 'CHECKEDIN' || bStatus === 'CHECKED_IN' || bStatus === 'COMPLETED' || pStatus === 'PAID' || pStatus === 'COMPLETED') {
          dateMap[dateStr].revenue += Number(b.totalAmount || 0);
          dateMap[dateStr].sales += 1;
          dateMap[dateStr].tickets += Array.isArray(b.tickets) && b.tickets.length > 0 ? b.tickets.length : (b.quantity || 1);
        }
      }
    });

    const timeSeriesChartData = Object.values(dateMap);

    // Construct Event Performance Data
    const eventPerformanceData = events.slice(0, 6).map((ev) => {
      let evRevenue = 0;
      let evTicketsSold = 0;
      const evBookings = bookings.filter((b) => b.eventId === ev.id || b.event?.id === ev.id);

      evBookings.forEach((b) => {
        const bStatus = (b.bookingStatus || b.status || '').toUpperCase();
        const pStatus = (b.paymentStatus || '').toUpperCase();
        if (bStatus === 'CONFIRMED' || bStatus === 'CHECKEDIN' || bStatus === 'CHECKED_IN' || bStatus === 'COMPLETED' || pStatus === 'PAID' || pStatus === 'COMPLETED') {
          evRevenue += Number(b.totalAmount || 0);
          evTicketsSold += Array.isArray(b.tickets) && b.tickets.length > 0 ? b.tickets.length : (b.quantity || 1);
        }
      });

      return {
        id: ev.id,
        name: ev.title,
        revenue: evRevenue,
        ticketsSold: evTicketsSold,
        bookingsCount: evBookings.length,
      };
    });

    // Upcoming Events Feed
    const upcomingEventsList = events
      .filter((ev) => {
        if (!ev.startDate) return ev.status === 'PUBLISHED';
        return new Date(ev.startDate) >= new Date() || ev.status === 'PUBLISHED';
      })
      .slice(0, 5);

    // Recent Bookings Feed
    const recentBookingsList = bookings
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Recent Payments Feed
    const recentPaymentsList = bookings
      .filter((b) => b.totalAmount > 0)
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      profile,
      kpis: {
        todaySales: analytics.todaySales || 0,
        monthlyRevenue: analytics.monthlyRevenue || 0,
        totalEvents: events.length,
        upcomingEventsCount: analytics.upcomingEventsCount || upcomingEventsList.length,
        totalTicketsSold: analytics.totalTicketsSold || (checkedInCount + issuedCount),
        ticketsRemaining,
        checkInsCount: checkedInCount,
        pendingPaymentsCount: pendingPaymentCount,
        pendingPaymentsAmount: pendingPaymentAmount,
      },
      charts: {
        salesTrend: timeSeriesChartData,
        revenueTrend: timeSeriesChartData,
        ticketSalesTrend: timeSeriesChartData,
        attendanceBreakdown: [
          { name: 'Checked In', value: checkedInCount, color: '#22C55E' },
          { name: 'Issued / Pending Check-in', value: issuedCount, color: '#FFD700' },
          { name: 'Cancelled', value: cancelledCount, color: '#FF2A52' },
        ],
        eventPerformance: eventPerformanceData,
      },
      widgets: {
        upcomingEvents: upcomingEventsList,
        recentBookings: recentBookingsList,
        recentPayments: recentPaymentsList,
      },
      errors: {
        analyticsError: results[0].status === 'rejected' ? results[0].reason?.message : null,
        eventsError: results[1].status === 'rejected' ? results[1].reason?.message : null,
        bookingsError: results[2].status === 'rejected' ? results[2].reason?.message : null,
      },
    };
  },
};
