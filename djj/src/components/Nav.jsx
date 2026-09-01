import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, Menu, X, User, QrCode, LogOut, ChevronDown, ShieldCheck, LayoutDashboard } from "lucide-react";
import { C } from "../constants";
import { useAuth } from "../context/AuthContext.jsx";

function Nav({ view, setView }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const isOrganizer =
    user?.role === "EVENT_ORGANIZER" ||
    user?.role === "ORGANIZER" ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN";

  const navLinks = [
    { id: "home", label: "HOME" },
    { id: "events", label: "EXPLORE EVENTS" },
    ...(isOrganizer ? [{ id: "organizer-dashboard", label: "DASHBOARD", isOrganizerRoute: true }] : []),
    { id: "about", label: "ABOUT" },
    { id: "services", label: "SERVICES" },
    { id: "gallery", label: "GALLERY" },
    { id: "contact", label: "CONTACT" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
    setView("home");
  };

  const getRoleDisplayName = (role) => {
    if (!role) return "CUSTOMER";
    if (role === "SUPER_ADMIN" || role === "ADMIN") return "ADMIN";
    if (role === "EVENT_ORGANIZER" || role === "ORGANIZER") return "ORGANIZER";
    return "CUSTOMER";
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
        width: "100%",
        background: "#000000",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.8)",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "16px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => setView("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {/* Ornate Gold Emblem Logo */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src="/logo.png"
              alt="DJ Empire Emblem"
              style={{
                height: "44px",
                width: "44px",
                objectFit: "contain",
                filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <svg
              width="44"
              height="44"
              viewBox="0 0 100 100"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: "none",
                opacity: 0,
              }}
              id="svg-emblem-fallback"
            >
              <circle cx="50" cy="50" r="46" fill="none" stroke="#FFD700" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#DAA520" strokeWidth="1.5" />
              <text x="50" y="58" textAnchor="middle" fill="#FFD700" fontSize="24" fontFamily="serif" fontWeight="bold">DJ</text>
            </svg>
          </div>

          <div
            style={{
              fontFamily: "'Space Grotesk', 'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: "20px",
              letterSpacing: "1.2px",
              color: "#FFD700",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>D J</span>
            <span style={{ color: "#FFD700" }}>EMPIRE</span>
          </div>
        </div>

        {/* Center/Right: Navigation Links, Profile / Sign In & Action Button */}
        <div
          className="desktop-nav-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
            }}
          >
            {navLinks.map((link) => {
              const isActive = view === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.isOrganizerRoute) {
                      navigate('/organizer/dashboard');
                    } else {
                      setView(link.id);
                    }
                    setMobileOpen(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    fontFamily: "'Montserrat', 'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: "12px",
                    letterSpacing: "1.2px",
                    color: isActive ? "#FFD700" : link.isOrganizerRoute ? "#FFD700" : "#D1D5DB",
                    padding: "6px 0",
                    position: "relative",
                    transition: "color 0.2s ease",
                    textTransform: "uppercase",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#FFD700";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !link.isOrganizerRoute) e.currentTarget.style.color = "#D1D5DB";
                  }}
                >
                  {link.label}
                  {/* Active Yellow Underline */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-4px",
                        left: 0,
                        right: 0,
                        height: "2.5px",
                        backgroundColor: "#FFD700",
                        borderRadius: "2px",
                        boxShadow: "0 0 8px rgba(255, 215, 0, 0.6)",
                      }}
                    />
                  )}
                </button>
              );
            })}

            {/* Profile Dropdown OR Sign In Link */}
            {isAuthenticated ? (
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: profileOpen ? "rgba(255, 215, 0, 0.12)" : "rgba(255, 255, 255, 0.05)",
                    border: "1.5px solid #FFD700",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    color: "#FFD700",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    outline: "none",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #FFD700 0%, #DAA520 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#000",
                      fontWeight: 800,
                      fontSize: "11px",
                    }}
                  >
                    <User size={14} strokeWidth={2.5} color="#000000" />
                  </div>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: "12px",
                      letterSpacing: "0.8px",
                      maxWidth: "110px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textTransform: "uppercase",
                    }}
                  >
                    {user?.firstName || (user?.fullName ? user.fullName.split(" ")[0] : (user?.name ? user.name.split(" ")[0] : "ACCOUNT"))}
                  </span>
                  <ChevronDown size={14} color="#FFD700" style={{ transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                </button>

                {/* Luxury Profile Dropdown Menu */}
                {profileOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 12px)",
                      width: "250px",
                      background: "#0A0A0A",
                      border: "1px solid rgba(255, 215, 0, 0.25)",
                      borderRadius: "16px",
                      boxShadow: "0 12px 32px rgba(0, 0, 0, 0.95), 0 0 20px rgba(255, 215, 0, 0.1)",
                      padding: "16px 0",
                      zIndex: 1100,
                      animation: "fadeInDown 0.2s ease-out",
                    }}
                  >
                    {/* User Header Info */}
                    <div style={{ padding: "0 20px 14px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "14px", color: "#FFFFFF", marginBottom: "2px" }}>
                        {user?.fullName || "Valued Customer"}
                      </div>
                      <div style={{ fontFamily: "Inter", fontSize: "11px", color: "#9CA3AF", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user?.email || "customer@djempire.com"}
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "rgba(255, 215, 0, 0.12)",
                          border: "1px solid rgba(255, 215, 0, 0.3)",
                          color: "#FFD700",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                        }}
                      >
                        <ShieldCheck size={12} color="#FFD700" />
                        <span>{getRoleDisplayName(user?.role)}</span>
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div style={{ padding: "8px 0" }}>
                      {isOrganizer && (
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigate("/organizer/dashboard");
                          }}
                          style={{
                            ...dropdownItemStyle,
                            color: "#FFD700",
                            fontWeight: 700,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 215, 0, 0.15)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <LayoutDashboard size={15} color="#FFD700" />
                          <span>Organizer Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setView("profile");
                        }}
                        style={dropdownItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 215, 0, 0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <User size={15} color="#FFD700" />
                        <span>View Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setView("my-tickets");
                        }}
                        style={dropdownItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 215, 0, 0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Ticket size={15} color="#FFD700" />
                        <span>View Tickets</span>
                      </button>
                    </div>

                    {/* Logout Option */}
                    <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "6px" }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          ...dropdownItemStyle,
                          color: "#EF4444",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <LogOut size={15} color="#EF4444" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setView("signin");
                  setMobileOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  letterSpacing: "1.2px",
                  color: view === "signin" ? "#FFD700" : "#D1D5DB",
                  padding: "6px 0",
                  position: "relative",
                  transition: "color 0.2s ease",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => {
                  if (view !== "signin") e.currentTarget.style.color = "#FFD700";
                }}
                onMouseLeave={(e) => {
                  if (view !== "signin") e.currentTarget.style.color = "#D1D5DB";
                }}
              >
                SIGN IN
                {view === "signin" && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-4px",
                      left: 0,
                      right: 0,
                      height: "2.5px",
                      backgroundColor: "#FFD700",
                      borderRadius: "2px",
                      boxShadow: "0 0 8px rgba(255, 215, 0, 0.6)",
                    }}
                  />
                )}
              </button>
            )}
          </div>

          {/* Far Right: BOOK TICKETS CTA Button (Only when not logged in) */}
          {!isAuthenticated && (
            <button
              onClick={() => {
                setView("tickets");
                setMobileOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "24px",
                background: "rgba(18, 18, 18, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                color: "#FFFFFF",
                fontFamily: "'Montserrat', 'Inter', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "1.2px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#FFD700";
                e.currentTarget.style.color = "#FFD700";
                e.currentTarget.style.background = "rgba(255, 215, 0, 0.1)";
                e.currentTarget.style.boxShadow = "0 0 16px rgba(255, 215, 0, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.background = "rgba(18, 18, 18, 0.9)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Ticket size={15} strokeWidth={2} color="currentColor" />
              <span>BOOK TICKETS</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#FFD700",
            padding: "6px",
          }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          style={{
            background: "#080808",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "20px 28px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setView(link.id);
                setMobileOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                textAlign: "left",
                padding: "8px 0",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "1px",
                color: view === link.id ? "#FFD700" : "#FFFFFF",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {link.label}
            </button>
          ))}

          {isAuthenticated ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "12px" }}>
              {isOrganizer && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/organizer/dashboard");
                  }}
                  style={{ ...mobileMenuItemStyle, color: "#FFD700", fontWeight: 800 }}
                >
                  <LayoutDashboard size={16} color="#FFD700" />
                  <span>ORGANIZER DASHBOARD</span>
                </button>
              )}
              <button onClick={() => { setView("profile"); setMobileOpen(false); }} style={{ ...mobileMenuItemStyle, color: "#FFD700" }}>
                <User size={16} /> View Profile ({user?.fullName || "User"})
              </button>
              <button onClick={() => { setView("my-tickets"); setMobileOpen(false); }} style={mobileMenuItemStyle}>
                <Ticket size={16} /> View Tickets
              </button>
              <button onClick={handleLogout} style={{ ...mobileMenuItemStyle, color: "#EF4444" }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setView("signin");
                setMobileOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                textAlign: "left",
                padding: "8px 0",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "1px",
                color: view === "signin" ? "#FFD700" : "#FFFFFF",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              SIGN IN
            </button>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => {
                setView("tickets");
                setMobileOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px",
                marginTop: "8px",
                borderRadius: "24px",
                background: "rgba(18, 18, 18, 0.9)",
                border: "1px solid rgba(255, 215, 0, 0.4)",
                color: "#FFD700",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "1px",
                cursor: "pointer",
              }}
            >
              <Ticket size={16} color="#FFD700" />
              <span>BOOK TICKETS</span>
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 980px) {
          .desktop-nav-actions {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}

const dropdownItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  width: "100%",
  padding: "10px 20px",
  background: "transparent",
  border: "none",
  color: "#E5E7EB",
  fontFamily: "'Montserrat', 'Inter', sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.2s ease",
};

const mobileMenuItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "none",
  border: "none",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  padding: "6px 0",
};

export default Nav;
