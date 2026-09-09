import React, { Suspense, lazy } from 'react';
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

import { BookingProvider } from '../context/BookingContext.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { OrganizerLayout } from '../layouts/OrganizerLayout.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute.jsx';

const ClientView = lazy(() => import('../pages/AppViews.jsx').then((m) => ({ default: m.ClientView })));
const ScannerAppView = lazy(() => import('../pages/ScannerAppView.jsx'));

const CustomerEventListingPage = lazy(() => import('../pages/customer/CustomerEventListingPage.jsx'));
const CustomerEventDetailsPage = lazy(() => import('../pages/customer/CustomerEventDetailsPage.jsx'));
const TicketSelectionPage = lazy(() => import('../pages/customer/TicketSelectionPage.jsx'));
const CustomerDetailsPage = lazy(() => import('../pages/customer/CustomerDetailsPage.jsx'));
const OrderSummaryPage = lazy(() => import('../pages/customer/OrderSummaryPage.jsx'));
const PaymentMethodPage = lazy(() => import('../pages/customer/PaymentMethodPage.jsx'));
const BookingConfirmationPage = lazy(() => import('../pages/customer/BookingConfirmationPage.jsx'));
const PaymentFailedPage = lazy(() => import('../pages/customer/PaymentFailedPage.jsx'));
const CustomerPaymentHistoryPage = lazy(() => import('../pages/customer/CustomerPaymentHistoryPage.jsx'));
const CustomerPaymentDetailsPage = lazy(() => import('../pages/customer/CustomerPaymentDetailsPage.jsx'));
const InvoicePage = lazy(() => import('../pages/customer/InvoicePage.jsx'));
const CustomerBookingsPage = lazy(() => import('../pages/customer/CustomerBookingsPage.jsx'));
const CustomerBookingDetailsPage = lazy(() => import('../pages/customer/CustomerBookingDetailsPage.jsx'));
const MyTicketsPage = lazy(() => import('../pages/customer/MyTicketsPage.jsx'));
const CustomerProfilePage = lazy(() => import('../pages/customer/CustomerProfilePage.jsx'));

const OrganizerBookingDetailsPage = lazy(() => import('../pages/organizer/BookingDetailsPage.jsx'));
const CashVerifyPage = lazy(() => import('../pages/organizer/CashVerifyPage.jsx'));
const ScannerUsersPage = lazy(() => import('../pages/organizer/ScannerUsersPage.jsx'));
const AttendanceAnalyticsPage = lazy(() => import('../pages/organizer/AttendanceAnalyticsPage.jsx'));
const CheckInHistoryPage = lazy(() => import('../pages/organizer/CheckInHistoryPage.jsx'));
const FinancialDashboardPage = lazy(() => import('../pages/organizer/FinancialDashboardPage.jsx'));
const OrganizerDashboard = lazy(() => import('../pages/organizer/OrganizerDashboard.jsx'));
const MyEventsPage = lazy(() => import('../pages/organizer/MyEventsPage.jsx'));
const CreateEventPage = lazy(() => import('../pages/organizer/CreateEventPage.jsx'));
const EditEventPage = lazy(() => import('../pages/organizer/EditEventPage.jsx'));
const EventDetailsPage = lazy(() => import('../pages/organizer/EventDetailsPage.jsx'));
const EventPreviewPage = lazy(() => import('../pages/organizer/EventPreviewPage.jsx'));
const TicketingEventsPage = lazy(() => import('../pages/organizer/TicketingEventsPage.jsx'));
const EventTicketingPage = lazy(() => import('../pages/organizer/EventTicketingPage.jsx'));
const CreateTicketPage = lazy(() => import('../pages/organizer/CreateTicketPage.jsx'));
const EditTicketPage = lazy(() => import('../pages/organizer/EditTicketPage.jsx'));
const TicketDetailsPage = lazy(() => import('../pages/organizer/TicketDetailsPage.jsx'));
const EventSeatingPage = lazy(() => import('../pages/organizer/EventSeatingPage.jsx'));
const SeatMapManagementPage = lazy(() => import('../pages/organizer/SeatMapManagementPage.jsx'));
const SeatMapPreviewPage = lazy(() => import('../pages/organizer/SeatMapPreviewPage.jsx'));
const BookingsPage = lazy(() => import('../pages/organizer/BookingsPage.jsx'));
const OrganizerPaymentsPage = lazy(() => import('../pages/organizer/PaymentsPage.jsx'));
const InvoicesPage = lazy(() => import('../pages/organizer/InvoicesPage.jsx'));
const OrganizerCheckInPage = lazy(() => import('../pages/organizer/CheckInPage.jsx'));
const GatesPage = lazy(() => import('../pages/organizer/GatesPage.jsx'));
const ScannersPage = lazy(() => import('../pages/organizer/ScannersPage.jsx'));
const AttendancePage = lazy(() => import('../pages/organizer/AttendancePage.jsx'));
const ProfilePage = lazy(() => import('../pages/organizer/ProfilePage.jsx'));
const OrganizerSettingsPage = lazy(() => import('../pages/organizer/SettingsPage.jsx'));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'));
const OrganizersPage = lazy(() => import('../pages/admin/OrganizersPage.jsx'));
const OrganizerDetailsPage = lazy(() => import('../pages/admin/OrganizerDetailsPage.jsx'));
const CustomersPage = lazy(() => import('../pages/admin/CustomersPage.jsx'));
const CustomerDetailsPageAdmin = lazy(() => import('../pages/admin/CustomerDetailsPage.jsx'));
const EventsPage = lazy(() => import('../pages/admin/EventsPage.jsx'));
const CategoriesPage = lazy(() => import('../pages/admin/CategoriesPage.jsx'));
const CitiesPage = lazy(() => import('../pages/admin/CitiesPage.jsx'));
const VenuesPage = lazy(() => import('../pages/admin/VenuesPage.jsx'));
const TaxSettingsPage = lazy(() => import('../pages/admin/TaxSettingsPage.jsx'));
const PaymentsPage = lazy(() => import('../pages/admin/PaymentsPage.jsx'));
const AuditLogsPage = lazy(() => import('../pages/admin/AuditLogsPage.jsx'));
const NotificationsPage = lazy(() => import('../pages/admin/NotificationsPage.jsx'));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage.jsx'));

const RouteFallback = () => (
  <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 14 }}>
    Loading…
  </div>
);

const BookingLayoutWrapper = () => (
  <BookingProvider>
    <Outlet />
  </BookingProvider>
);

export default function AppRoutes({ setView }) {
  return (
    <Suspense fallback={<RouteFallback />}>
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
        <Route path="cash-verify" element={<CashVerifyPage />} />

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
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoicesPage />} />

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
        <Route path="cash-verify" element={<CashVerifyPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
