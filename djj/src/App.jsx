import { useState, useEffect } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import "./styles/global.css";
import Nav from "./components/Nav";
import AppRoutes from "./routes/AppRoutes";
import { C, fontImport } from "./constants/theme.js";
import ParticleBackground from "./components/ParticleBackground";
import MouseGlow from "./components/MouseGlow";
import LoadingScreen from "./components/LoadingScreen";
import CursorTrail from "./components/CursorTrail";
import FloatingShapes from "./components/FloatingShapes";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

function MainContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to map view names to routes
  const setView = (v) => {
    switch (v) {
      case "home":
        navigate("/");
        break;
      case "events":
        navigate("/events");
        break;
      case "about":
        navigate("/about");
        break;
      case "services":
        navigate("/services");
        break;
      case "portfolio":
      case "gallery":
        navigate("/portfolio");
        break;
      case "contact":
        navigate("/contact");
        break;
      case "login":
      case "signin":
        navigate("/login");
        break;
      case "tickets":
      case "customer":
        navigate("/events");
        break;
      case "my-tickets":
        navigate("/my-tickets");
        break;
      case "profile":
      case "my-profile":
        navigate("/profile");
        break;
      case "client":
      case "organizer":
        navigate("/organizer/dashboard");
        break;
      case "scanner":
        navigate("/scanner");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  // Compute current view name for Nav highlight
  const currentView = (() => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/profile") return "profile";
    if (path.startsWith("/events")) return "events";
    if (path === "/about") return "about";
    if (path === "/services") return "services";
    if (path === "/portfolio") return "gallery";
    if (path === "/contact") return "contact";
    if (path === "/login" || path === "/register") return "signin";
    if (path === "/my-tickets" || path === "/my-bookings") return "tickets";
    if (path === "/customer") return "customer";
    if (path.startsWith("/client") || path.startsWith("/organizer")) return "organizer";
    if (path === "/scanner") return "scanner";
    if (path.startsWith("/admin")) return "admin";
    return "home";
  })();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative", width: "100%", overflowX: "hidden" }}>
      <style>{fontImport}</style>

      <ParticleBackground />
      <MouseGlow />
      <CursorTrail />
      <FloatingShapes />

      <Nav view={currentView} setView={setView} />
      <div style={{ maxWidth: "100%", margin: "0 auto", position: "relative", zIndex: 1, width: "100%", paddingTop: "88px" }}>
        <AppRoutes setView={setView} />
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MainContent />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
