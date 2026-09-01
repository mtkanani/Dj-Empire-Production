import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Smartphone, BadgeCheck, CreditCard, Radio, Download, ChevronRight, History, CheckCircle2,
  LayoutDashboard, FileSpreadsheet, ShieldCheck, QrCode, Clock, TrendingUp, Users, FileText,
  LogOut, LogIn, AlertCircle, Plus, Trash2, Search, Filter, Calendar, MapPin, Ticket, Shield
} from "lucide-react";
import { Panel, Badge, Btn } from "../components/SharedComponents";
import { C, uid, nowStr, fmtINR } from "../constants";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";
import { Modal } from "../components/common/Modal.jsx";
import { Button } from "../components/common/Button.jsx";
import { Input } from "../components/common/Input.jsx";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

function pseudoQR(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells = [];
  for (let i = 0; i < 121; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h >>> 16) % 3 === 0);
  }
  return cells;
}

function QRBlock({ seed, size = 132 }) {
  const cells = pseudoQR(seed);
  const n = 11;
  const cell = size / n;
  return (
    <svg width={size} height={size} style={{ background: "#1a1a3a", borderRadius: 12, boxShadow: "0 8px 32px rgba(0, 245, 255, 0.3)" }}>
      {cells.map((on, i) => {
        const x = (i % n) * cell, y = Math.floor(i / n) * cell;
        const corner = (x < cell * 3 && y < cell * 3) || (x > size - cell * 4 && y < cell * 3) || (x < cell * 3 && y > size - cell * 4);
        return (on || corner) ? <rect key={i} x={x} y={y} width={cell} height={cell} fill="#00f5ff" /> : null;
      })}
    </svg>
  );
}

export function CustomerView({ events = [], bookings = [], addBooking }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("events"); // "events" | "my-tickets"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Selection & Modal States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [ticketQty, setTicketQty] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerMobile, setCustomerMobile] = useState(user?.phone || "+91 9876543210");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Auto-open checkout if returning from login with pending booking
  useEffect(() => {
    if (location.state?.returnToBooking && location.state?.eventId && isAuthenticated) {
      const pendingEv = events.find(e => e.id === location.state.eventId);
      if (pendingEv) {
        setSelectedEvent(pendingEv);
        const section = pendingEv.categories?.[0] || { name: "General Entry", price: 2999 };
        setSelectedSection(section);
        setIsCheckoutModalOpen(true);
        showToast("Welcome back! Proceed to complete your ticket booking.", "success");
      }
    }
  }, [location.state, isAuthenticated, events]);

  const categoriesList = ["All", "Concerts", "Conferences", "Sports", "Festivals"];

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      ev.categories?.some((c) => c.name?.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === "Concerts" && ev.name?.toLowerCase().includes("music")) ||
      (selectedCategory === "Conferences" && ev.name?.toLowerCase().includes("tech"));
    return matchesSearch && matchesCategory;
  });

  const handleOpenDetail = (ev) => {
    setSelectedEvent(ev);
    setSelectedSection(ev.categories?.[0] || null);
    setIsDetailModalOpen(true);
  };

  const handleProceedToBookingClick = () => {
    if (!isAuthenticated) {
      showToast("Please log in to your customer account to book tickets.", "warning");
      setIsDetailModalOpen(false);
      navigate("/login", {
        state: {
          returnToBooking: true,
          eventId: selectedEvent?.id,
          email: user?.email,
        },
      });
      return;
    }

    setIsDetailModalOpen(false);
    setIsCheckoutModalOpen(true);
  };

  // GST Breakdown Calculation
  const unitPrice = selectedSection?.price || 2999;
  const subtotal = unitPrice * ticketQty;
  const gstRate = 0.18; // 18% GST
  const cgstAmount = Math.round((subtotal * 0.09) * 100) / 100;
  const sgstAmount = Math.round((subtotal * 0.09) * 100) / 100;
  const totalGst = cgstAmount + sgstAmount;
  const platformFee = 20;
  const grandTotal = subtotal + totalGst + platformFee;

  const handleConfirmPayment = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      const newBooking = {
        id: "BKG-" + Math.floor(100000 + Math.random() * 900000),
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        category: selectedSection?.name || "VIP Lounge",
        qty: ticketQty,
        amount: grandTotal,
        subtotal,
        gstAmount: totalGst,
        platformFee,
        mobile: customerMobile,
        status: "CONFIRMED",
        bookedAt: nowStr(),
        qrSeed: "QR_" + selectedEvent.id + "_" + Date.now(),
        customerName: `${user?.firstName || "Verified"} ${user?.lastName || "Customer"}`,
      };

      if (addBooking) addBooking(newBooking);
      showToast(`🎉 Payment Success! Issued ${ticketQty} ticket(s) for ${selectedEvent.name}.`, "success");
      setPaymentLoading(false);
      setIsCheckoutModalOpen(false);
      setActiveTab("my-tickets");
    }, 1200);
  };

  return (
    <div style={{ padding: "40px 20px 80px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Top Tab Bar Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", background: C.panel, padding: "6px", borderRadius: "16px", border: `1px solid ${C.border}` }}>
          <button
            onClick={() => setActiveTab("events")}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: activeTab === "events" ? `linear-gradient(135deg, ${C.gold} 0%, ${C.amber} 100%)` : "transparent",
              color: activeTab === "events" ? "#000" : C.muted,
              border: "none",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🔥 Explore Live Events
          </button>

          <button
            onClick={() => setActiveTab("my-tickets")}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: activeTab === "my-tickets" ? `linear-gradient(135deg, ${C.gold} 0%, ${C.amber} 100%)` : "transparent",
              color: activeTab === "my-tickets" ? "#000" : C.muted,
              border: "none",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Ticket size={16} /> My Ticket Wallet ({bookings.length})
          </button>
        </div>

        {/* User Auth Status Header Badge */}
        <div>
          {isAuthenticated ? (
            <span style={{ fontSize: "13px", color: C.green, background: C.greenDim, border: `1px solid ${C.green}`, padding: "6px 14px", borderRadius: "999px", fontWeight: 600 }}>
              Logged in as {user?.email || "Customer"}
            </span>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              <LogIn size={14} /> Customer Sign In
            </Button>
          )}
        </div>
      </div>

      {/* EXPLORE EVENTS TAB */}
      {activeTab === "events" && (
        <div>
          {/* Search & Category Filter Section */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "24px", padding: "24px", marginBottom: "36px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <Search size={18} color={C.muted} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Search events by title, artist, or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 48px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${C.border}`,
                    borderRadius: "14px",
                    color: C.text,
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "999px",
                      background: selectedCategory === cat ? C.goldDim : "rgba(255, 255, 255, 0.04)",
                      border: `1px solid ${selectedCategory === cat ? C.gold : C.border}`,
                      color: selectedCategory === cat ? C.gold : C.muted,
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Events Grid Display */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "28px" }}>
            {filteredEvents.map((ev) => {
              const minPrice = ev.categories?.length ? Math.min(...ev.categories.map((c) => c.price)) : 2999;
              return (
                <div
                  key={ev.id}
                  style={{
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "transform 0.3s ease, border-color 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  className="djj-event-card"
                >
                  <div style={{ height: "180px", background: `linear-gradient(135deg, ${C.goldDim} 0%, ${C.blueDim} 100%)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ticket size={64} color={C.gold} style={{ opacity: 0.2 }} />
                    <span style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.7)", color: C.gold, border: `1px solid ${C.gold}`, padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>
                      {ev.capacity || 5000} Seats Capacity
                    </span>
                  </div>

                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <h3 style={{ margin: "0 0 10px 0", fontFamily: "Space Grotesk, sans-serif", fontSize: "20px", color: C.text }}>
                      {ev.name}
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: C.muted, fontSize: "13px", marginBottom: "8px" }}>
                      <Calendar size={14} color={C.gold} /> {ev.date}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: C.muted, fontSize: "13px", marginBottom: "20px" }}>
                      <MapPin size={14} color={C.blue} /> {ev.venue}
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: "16px" }}>
                      <div>
                        <span style={{ fontSize: "12px", color: C.muted, display: "block" }}>Starting From</span>
                        <strong style={{ fontSize: "20px", color: C.gold, fontFamily: "Space Grotesk, sans-serif" }}>
                          {fmtINR(minPrice)}
                        </strong>
                      </div>

                      <Button variant="primary" size="sm" onClick={() => handleOpenDetail(ev)}>
                        View & Book
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MY TICKETS WALLET TAB */}
      {activeTab === "my-tickets" && (
        <div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", color: C.gold, fontSize: "28px", marginBottom: "20px" }}>
            My Purchased Ticket Passes
          </h2>

          {bookings.length === 0 ? (
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "24px", padding: "60px 20px", textAlign: "center", color: C.muted }}>
              <Ticket size={48} color={C.muted} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
              <p style={{ fontSize: "16px", margin: "0 0 16px" }}>You have not purchased any event tickets yet.</p>
              <Button variant="primary" onClick={() => setActiveTab("events")}>
                Explore Live Events
              </Button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
              {bookings.map((b) => (
                <div key={b.id} style={{ background: C.bgCard, border: `1px solid ${C.borderGold}`, borderRadius: "24px", padding: "24px", boxShadow: `0 10px 30px ${C.goldDim}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${C.border}`, paddingBottom: "12px" }}>
                    <span style={{ fontSize: "12px", color: C.muted }}>Ref: {b.id}</span>
                    <span style={{ background: b.category?.includes("VIP") ? C.purple : C.gold, color: "#000", fontWeight: 700, padding: "4px 12px", borderRadius: "999px", fontSize: "12px" }}>
                      {b.category || "VIP Pass"}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 8px", fontFamily: "Space Grotesk, sans-serif", color: C.text, fontSize: "18px" }}>
                    {b.eventName}
                  </h3>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.panel, padding: "16px", borderRadius: "16px", margin: "16px 0" }}>
                    <QRBlock seed={b.qrSeed || b.id} size={110} />
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", color: C.muted, display: "block" }}>Group Quantity</span>
                      <strong style={{ fontSize: "18px", color: C.gold, fontFamily: "Space Grotesk, sans-serif" }}>
                        {b.qty} Ticket(s)
                      </strong>
                      <span style={{ fontSize: "12px", color: C.green, display: "block", marginTop: "4px" }}>
                        Total Paid: {fmtINR(b.amount)}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: C.faint, textAlign: "center" }}>
                    Includes 18% GST (CGST+SGST) • Show QR at entrance gate scanner
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVENT DETAILS & SECTION SELECTOR MODAL */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={selectedEvent?.name || "Event Details"}>
        {selectedEvent && (
          <div>
            <p style={{ color: C.muted, fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
              Experience an unparalleled live event at {selectedEvent.venue} on {selectedEvent.date}. Book your section passes in advance.
            </p>

            <h4 style={{ fontFamily: "Space Grotesk, sans-serif", color: C.gold, marginBottom: "12px" }}>Select Ticket Section</h4>
            <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
              {selectedEvent.categories?.map((cat) => {
                const isSelected = selectedSection?.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedSection(cat)}
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      background: isSelected ? C.goldDim : C.panel,
                      border: `1px solid ${isSelected ? C.gold : C.border}`,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ color: isSelected ? C.gold : C.text, display: "block", fontSize: "15px" }}>
                        {cat.name} Section
                      </strong>
                      <span style={{ fontSize: "12px", color: C.muted }}>Available Seats: {cat.seats}</span>
                    </div>
                    <strong style={{ fontSize: "18px", color: C.gold, fontFamily: "Space Grotesk, sans-serif" }}>
                      {fmtINR(cat.price)}
                    </strong>
                  </div>
                );
              })}
            </div>

            <Button variant="primary" fullWidth onClick={handleProceedToBookingClick}>
              Proceed to Ticket Checkout →
            </Button>
          </div>
        )}
      </Modal>

      {/* CHECKOUT & DYNAMIC 18% GST TAX CALCULATOR MODAL */}
      <Modal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} title="Checkout & GST Tax Breakdown">
        {selectedEvent && (
          <div>
            <div style={{ background: C.panel, padding: "16px", borderRadius: "16px", border: `1px solid ${C.border}`, marginBottom: "20px" }}>
              <strong style={{ color: C.gold, fontSize: "16px", display: "block" }}>{selectedEvent.name}</strong>
              <span style={{ color: C.muted, fontSize: "13px" }}>Section: {selectedSection?.name || "General"} • {selectedEvent.date}</span>
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", color: C.muted, display: "block", marginBottom: "8px" }}>Select Number of Tickets</label>
              <div style={{ display: "flex", gap: "10px" }}>
                {[1, 2, 3, 4, 5].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setTicketQty(qty)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      background: ticketQty === qty ? C.gold : C.panel,
                      color: ticketQty === qty ? "#000" : C.text,
                      border: `1px solid ${ticketQty === qty ? C.gold : C.border}`,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Itemized GST & Platform Fee Calculator */}
            <div style={{ background: "rgba(255, 215, 0, 0.04)", border: `1px solid ${C.borderGold}`, borderRadius: "16px", padding: "18px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: C.muted, marginBottom: "8px" }}>
                <span>Subtotal ({ticketQty} × {fmtINR(unitPrice)})</span>
                <span style={{ color: C.text }}>{fmtINR(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: C.muted, marginBottom: "4px" }}>
                <span>CGST (9%)</span>
                <span>{fmtINR(cgstAmount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: C.muted, marginBottom: "8px" }}>
                <span>SGST (9%)</span>
                <span>{fmtINR(sgstAmount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: C.muted, marginBottom: "12px", borderBottom: `1px solid ${C.border}`, paddingBottom: "8px" }}>
                <span>Platform Booking Fee</span>
                <span>{fmtINR(platformFee)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, color: C.gold, fontFamily: "Space Grotesk, sans-serif" }}>
                <span>Total Amount Payable</span>
                <span>{fmtINR(grandTotal)}</span>
              </div>
            </div>

            <Button variant="primary" fullWidth loading={paymentLoading} onClick={handleConfirmPayment}>
              Pay {fmtINR(grandTotal)} & Generate Master QR Code
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function ClientView({ events, setEvents, bookings, notifications }) {
  const [tab, setTab] = useState("events");
  const [staff, setStaff] = useState([{ id: uid(), name: "Riya Shah", role: "Event manager" }, { id: uid(), name: "Karan Patel", role: "Gate operator" }]);

  return (
    <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        <Btn tone={tab === "events" ? "gold" : "ghost"} icon={LayoutDashboard} onClick={() => setTab("events")}>Events</Btn>
        <Btn tone={tab === "bookings" ? "gold" : "ghost"} icon={FileSpreadsheet} onClick={() => setTab("bookings")}>Bookings ({bookings.length})</Btn>
        <Btn tone={tab === "analytics" ? "gold" : "ghost"} icon={BarChart} onClick={() => setTab("analytics")}>Analytics</Btn>
        <Btn tone={tab === "staff" ? "gold" : "ghost"} icon={Users} onClick={() => setTab("staff")}>Staff ({staff.length})</Btn>
      </div>

      {tab === "events" && (
        <div style={{ display: "grid", gap: 16 }}>
          {events.map(e => (
            <Panel key={e.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <Badge tone={e.status === "Approved" ? "green" : "amber"}>{e.status}</Badge>
                  <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 17, color: C.text, marginTop: 8 }}>{e.name}</div>
                  <div style={{ fontFamily: "Inter", fontSize: 13, color: C.muted, marginTop: 4 }}>{e.date} &middot; {e.venue}</div>
                </div>
                <Badge tone="gold">{e.capacity} seats</Badge>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminView({ events, setEvents, clients, setClients }) {
  return (
    <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "Space Grotesk, sans-serif", color: C.gold }}>Super Admin Panel</h2>
    </div>
  );
}
