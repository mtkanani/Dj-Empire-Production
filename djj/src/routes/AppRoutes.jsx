import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import CustomerRegister from '../pages/auth/CustomerRegister.jsx';
import CustomerLogin from '../pages/auth/CustomerLogin.jsx';
import CustomerVerifyEmail from '../pages/auth/CustomerVerifyEmail.jsx';
import OrganizerRegister from '../pages/auth/OrganizerRegister.jsx';
import OrganizerLogin from '../pages/auth/OrganizerLogin.jsx';
import OrganizerVerifyEmail from '../pages/auth/OrganizerVerifyEmail.jsx';
import AdminLogin from '../pages/auth/AdminLogin.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ForgotPasswordVerify from '../pages/auth/ForgotPasswordVerify.jsx';
import ForgotPasswordReset from '../pages/auth/ForgotPasswordReset.jsx';
import ForgotPasswordSuccess from '../pages/auth/ForgotPasswordSuccess.jsx';

import HomeView from '../pages/HomeView.jsx';
import ServicesView from '../pages/ServicesView.jsx';
import AboutView from '../pages/AboutView.jsx';
import PortfolioView from '../pages/PortfolioView.jsx';
import ContactView from '../pages/ContactView.jsx';
import { CustomerView, ClientView } from '../pages/AppViews.jsx';
import ScannerAppView from '../pages/ScannerAppView.jsx';

// Phase 10 — Customer Event Discovery Pages
import CustomerHomePage from '../pages/customer/CustomerHomePage.jsx';
import CustomerEventListingPage from '../pages/customer/CustomerEventListingPage.jsx';
import CustomerEventDetailsPage from '../pages/customer/CustomerEventDetailsPage.jsx';

// Phase 11 — Customer Booking & Payment Pages
import { BookingProvider } from '../context/BookingContext.jsx';
import TicketSelectionPage from '../pages/customer/TicketSelectionPage.jsx';
import CustomerDetailsPage from '../pages/customer/CustomerDetailsPage.jsx';
import OrderSummaryPage from '../pages/customer/OrderSummaryPage.jsx';
import PaymentMethodPage from '../pages/customer/PaymentMethodPage.jsx';
import BookingConfirmationPage from '../pages/customer/BookingConfirmationPage.jsx';
import PaymentFailedPage from '../pages/customer/PaymentFailedPage.jsx';

// Phase 12 — Payment Abstraction & History Pages
import CustomerPaymentHistoryPage from '../pages/customer/CustomerPaymentHistoryPage.jsx';
import CustomerPaymentDetailsPage from '../pages/customer/CustomerPaymentDetailsPage.jsx';
import InvoicePage from '../pages/customer/InvoicePage.jsx';

// Phase 13 — Booking Management Pages
import CustomerBookingsPage from '../pages/customer/CustomerBookingsPage.jsx';
import CustomerBookingDetailsPage from '../pages/customer/CustomerBookingDetailsPage.jsx';
import OrganizerBookingDetailsPage from '../pages/organizer/BookingDetailsPage.jsx';

// Phase 14 — Digital QR Tickets Page & Profile Page
import MyTicketsPage from '../pages/customer/MyTicketsPage.jsx';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage.jsx';

// Phase 15 — Scanner Users Page
import ScannerUsersPage from '../pages/organizer/ScannerUsersPage.jsx';

// Phase 16 — Attendance & Check-In Analytics Pages
import AttendanceAnalyticsPage from '../pages/organizer/AttendanceAnalyticsPage.jsx';
import CheckInHistoryPage from '../pages/organizer/CheckInHistoryPage.jsx';

// Phase 17 — Financial Management Pages
import FinancialDashboardPage from '../pages/organizer/FinancialDashboardPage.jsx';

// Admin Imports
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import OrganizersPage from '../pages/admin/OrganizersPage.jsx';
import OrganizerDetailsPage from '../pages/admin/OrganizerDetailsPage.jsx';
import CustomersPage from '../pages/admin/CustomersPage.jsx';
import CustomerDetailsPageAdmin from '../pages/admin/CustomerDetailsPage.jsx';
import EventsPage from '../pages/admin/EventsPage.jsx';
import CategoriesPage from '../pages/admin/CategoriesPage.jsx';
import CitiesPage from '../pages/admin/CitiesPage.jsx';
import VenuesPage from '../pages/admin/VenuesPage.jsx';
import TaxSettingsPage from '../pages/admin/TaxSettingsPage.jsx';
import PaymentsPage from '../pages/admin/PaymentsPage.jsx';
import AuditLogsPage from '../pages/admin/AuditLogsPage.jsx';
import NotificationsPage from '../pages/admin/NotificationsPage.jsx';
import SettingsPage from '../pages/admin/SettingsPage.jsx';

// Phase 6, 7, 8 & 9 — Organizer Panel Imports
import { OrganizerLayout } from '../layouts/OrganizerLayout.jsx';
import OrganizerDashboard from '../pages/organizer/OrganizerDashboard.jsx';
import MyEventsPage from '../pages/organizer/MyEventsPage.jsx';
import CreateEventPage from '../pages/organizer/CreateEventPage.jsx';
import EditEventPage from '../pages/organizer/EditEventPage.jsx';
import EventDetailsPage from '../pages/organizer/EventDetailsPage.jsx';
import EventPreviewPage from '../pages/organizer/EventPreviewPage.jsx';

// Phase 8 — Ticketing System Pages
import TicketingEventsPage from '../pages/organizer/TicketingEventsPage.jsx';
import EventTicketingPage from '../pages/organizer/EventTicketingPage.jsx';
import CreateTicketPage from '../pages/organizer/CreateTicketPage.jsx';
import EditTicketPage from '../pages/organizer/EditTicketPage.jsx';
import TicketDetailsPage from '../pages/organizer/TicketDetailsPage.jsx';

// Phase 9 — Seating & Seat Map Pages
import EventSeatingPage from '../pages/organizer/EventSeatingPage.jsx';
import SeatMapManagementPage from '../pages/organizer/SeatMapManagementPage.jsx';
import SeatMapPreviewPage from '../pages/organizer/SeatMapPreviewPage.jsx';

import BookingsPage from '../pages/organizer/BookingsPage.jsx';
import OrganizerPaymentsPage from '../pages/organizer/PaymentsPage.jsx';
import OrganizerRefundsPage from '../pages/organizer/RefundsPage.jsx';
import InvoicesPage from '../pages/organizer/InvoicesPage.jsx';
import OrganizerSettlementsPage from '../pages/organizer/SettlementsPage.jsx';
import OrganizerCheckInPage from '../pages/organizer/CheckInPage.jsx';
import GatesPage from '../pages/organizer/GatesPage.jsx';
import ScannersPage from '../pages/organizer/ScannersPage.jsx';
import AttendancePage from '../pages/organizer/AttendancePage.jsx';
import ProfilePage from '../pages/organizer/ProfilePage.jsx';
import OrganizerSettingsPage from '../pages/organizer/SettingsPage.jsx';

import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute.jsx';

const BookingLayoutWrapper = () => (
  <BookingProvider>
    <Outlet />
  </BookingProvider>
);

export default function AppRoutes({ setView }) {
  return (
    <Routes>
      {/* Public Customer Discovery Pages */}
      <Route path="/" element={<HomeView setView={setView} />} />
      <Route path="/events" element={<CustomerEventListingPage />} />
      <Route path="/events/:id" element={<CustomerEventDetailsPage />} />
      <Route path="/about" element={<AboutView setView={setView} />} />
      <Route path="/services" element={<ServicesView setView={setView} />} />
      <Route path="/portfolio" element={<PortfolioView setView={setView} />} />
      <Route path="/contact" element={<ContactView setView={setView} />} />

      {/* Public / Guest Tax Invoice View */}
      <Route path="/invoices/:bookingId" element={<InvoicePage />} />

      {/* Customer Booking & Checkout Routes under a persistent BookingProvider */}
      <Route element={<BookingLayoutWrapper />}>
        <Route
          path="/events/:eventId/book"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'EVENT_ORGANIZER', 'ORGANIZER', 'SUPER_ADMIN', 'ADMIN']}>
              <TicketSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId/booking/customer"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'EVENT_ORGANIZER', 'ORGANIZER', 'SUPER_ADMIN', 'ADMIN']}>
              <CustomerDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId/booking/summary"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'EVENT_ORGANIZER', 'ORGANIZER', 'SUPER_ADMIN', 'ADMIN']}>
              <OrderSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId/booking/payment"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'EVENT_ORGANIZER', 'ORGANIZER', 'SUPER_ADMIN', 'ADMIN']}>
              <PaymentMethodPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:bookingId/success"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'EVENT_ORGANIZER', 'ORGANIZER', 'SUPER_ADMIN', 'ADMIN']}>
              <BookingConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:bookingId/failed"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'EVENT_ORGANIZER', 'ORGANIZER', 'SUPER_ADMIN', 'ADMIN']}>
              <PaymentFailedPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Customer My Bookings & Digital Tickets Routes */}
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings/:id"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerBookingDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'EVENT_ORGANIZER', 'ORGANIZER', 'SUPER_ADMIN', 'ADMIN']}>
            <MyTicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'EVENT_ORGANIZER', 'ORGANIZER', 'SUPER_ADMIN', 'ADMIN']}>
            <CustomerProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Phase 12 Customer Payment History & Transaction Details */}
      <Route
        path="/my-payments"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerPaymentHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/payments"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerPaymentHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/payments/:paymentId"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerPaymentDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Customer Authentication Routes */}
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <CustomerRegister />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <CustomerLogin />
          </PublicOnlyRoute>
        }
      />
      <Route path="/verify-email" element={<CustomerVerifyEmail />} />

      {/* Organizer Authentication Routes */}
      <Route
        path="/organizer/register"
        element={
          <PublicOnlyRoute>
            <OrganizerRegister />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/organizer/login"
        element={
          <PublicOnlyRoute>
            <OrganizerLogin />
          </PublicOnlyRoute>
        }
      />
      <Route path="/organizer/verify-email" element={<OrganizerVerifyEmail />} />

      {/* Super Admin Dedicated Login Route */}
      <Route
        path="/admin/login"
        element={
          <PublicOnlyRoute>
            <AdminLogin />
          </PublicOnlyRoute>
        }
      />

      {/* Password Reset Routes */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/verify" element={<ForgotPasswordVerify />} />
      <Route path="/forgot-password/reset" element={<ForgotPasswordReset />} />
      <Route path="/forgot-password/success" element={<ForgotPasswordSuccess />} />
      <Route path="/reset-password" element={<ForgotPasswordReset />} />

      {/* Legacy Portals */}
      <Route path="/customer" element={<Navigate to="/events" replace />} />
      <Route path="/client" element={<ClientView setView={setView} />} />
      <Route path="/scanner" element={<ScannerAppView />} />

      {/* PHASE 6, 7, 8, 9, 13, 14, 15, 16 & 17 — ORGANIZER PANEL ROUTES */}
      <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
      <Route
        path="/organizer/*"
        element={
          <ProtectedRoute allowedRoles={['EVENT_ORGANIZER', 'ORGANIZER']}>
            <OrganizerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="events" element={<MyEventsPage />} />
        <Route path="events/create" element={<CreateEventPage />} />
        <Route path="events/:id/edit" element={<EditEventPage />} />
        <Route path="events/:id/preview" element={<EventPreviewPage />} />
        <Route path="events/:id" element={<EventDetailsPage />} />
        
        {/* Phase 8 Ticketing Routes */}
        <Route path="ticketing" element={<TicketingEventsPage />} />
        <Route path="events/:eventId/tickets" element={<EventTicketingPage />} />
        <Route path="events/:eventId/tickets/create" element={<CreateTicketPage />} />
        <Route path="events/:eventId/tickets/:ticketId" element={<TicketDetailsPage />} />
        <Route path="events/:eventId/tickets/:ticketId/edit" element={<EditTicketPage />} />

        {/* Phase 9 Seating & Seat Map Routes */}
        <Route path="events/:eventId/seating" element={<EventSeatingPage />} />
        <Route path="events/:eventId/sections" element={<EventSeatingPage />} />
        <Route path="events/:eventId/seat-map" element={<SeatMapManagementPage />} />
        <Route path="events/:eventId/seat-map/preview" element={<SeatMapPreviewPage />} />

        {/* Phase 13 Organizer Booking Routes */}
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/:id" element={<OrganizerBookingDetailsPage />} />

        {/* Phase 14 QR Scanner & Check-In Routes */}
        <Route path="check-in" element={<OrganizerCheckInPage />} />
        <Route path="scanner" element={<OrganizerCheckInPage />} />

        {/* Phase 15 Gate & Scanner Infrastructure Routes */}
        <Route path="gates" element={<GatesPage />} />
        <Route path="scanners" element={<ScannersPage />} />
        <Route path="scanner-users" element={<ScannerUsersPage />} />

        {/* Phase 16 Attendance & Check-In Analytics Routes */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/:eventId" element={<AttendancePage />} />
        <Route path="check-in-analytics" element={<AttendanceAnalyticsPage />} />
        <Route path="check-in-dashboard" element={<AttendanceAnalyticsPage />} />
        <Route path="check-in-history" element={<CheckInHistoryPage />} />

        {/* Phase 17 Financial Management Routes */}
        <Route path="financial-dashboard" element={<FinancialDashboardPage />} />
        <Route path="payments" element={<OrganizerPaymentsPage />} />
        <Route path="payments/:id" element={<OrganizerPaymentsPage />} />
        <Route path="refunds" element={<OrganizerRefundsPage />} />
        <Route path="refunds/:id" element={<OrganizerRefundsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoicesPage />} />
        <Route path="settlements" element={<OrganizerSettlementsPage />} />
        <Route path="settlements/:id" element={<OrganizerSettlementsPage />} />

        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<OrganizerSettingsPage />} />
        <Route path="*" element={<Navigate to="/organizer/dashboard" replace />} />
      </Route>

      {/* PHASE 2 — ADMIN DASHBOARD ROUTES */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="organizers" element={<OrganizersPage />} />
        <Route path="organizers/:id" element={<OrganizerDetailsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailsPageAdmin />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="cities" element={<CitiesPage />} />
        <Route path="venues" element={<VenuesPage />} />
        <Route path="tax-settings" element={<TaxSettingsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
