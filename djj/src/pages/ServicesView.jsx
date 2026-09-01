import { Layers, TrendingUp, Zap, Globe, Radio, Ticket, Users, Send } from "lucide-react";
import { PageHeader, Panel, Btn } from "../components/SharedComponents";
import { Footer } from "../components/Layout";
import { C } from "../constants";

function ServicesView({ setView }) {
  const serviceCategories = [
    {
      title: "Event Production",
      icon: Layers,
      items: [
        "Corporate Events", "Live Concert", "Celebrity Management", "Festival Management",
        "Brand Launch", "Exhibitions", "Award Shows", "Wedding Planning",
        "Stage Design", "Production Management"
      ]
    },
    {
      title: "Marketing & Promotions",
      icon: TrendingUp,
      items: [
        "BTL Activities", "Road Shows", "Mall Activation", "Society Activation",
        "Sampling", "Brand Promotion", "Canter Advertising", "Look Walker",
        "Data Collection", "Market Survey", "Retail Branding","Society Branding"
      ]
    },
    {
      title: "Creative Studio",
      icon: Zap,
      items: [
        "Graphic Designing", "Brand Identity", "Motion Graphics", "2D Animation",
        "3D Animation", "Visual Effects (VFX)", "Product Visualization",
        "Commercial Editing", "Corporate Films" , "Animated movies"
      ]
    },
    {
      title: "Digital Services",
      icon: Globe,
      items: [
        "Website Development","Custom CRM","E-commerce", "Mobile App Development", "UI/UX Design",
        "SEO", "Social Media Marketing", "Google Ads", "Meta Ads",
        "Content Creation", "Email Marketing"
      ]
    },
    {
      title: "Music Production",
      icon: Radio,
      items: [
        "Recording", "Mixing", "Mastering", "Background Score",
        "Podcast Production", "Voice Over", "Music Video Production", "Artist Management"
      ]
    },
    {
      title: "Ticketing Platform",
      icon: Ticket,
      items: [
        "Online Ticket Booking", "QR Ticket", "Event Registration",
        "Entry Management", "Analytics", "Dashboard",
        "Organizer Panel", "Customer Support"
      ]
    },
    {
      title: "Manpower Solutions",
      icon: Users,
      items: [
        "Promoters", "Hostess", "Event Staff", "Volunteers",
        "Brand Ambassador", "Supervisor", "Registration Staff"
      ]
    }
  ];

  return (
    <div>
      {/* Hero Section - Premium Cinematic UI */}
      <div style={{ 
        position: "relative",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at center, rgba(0, 229, 255, 0.05) 0%, transparent 70%), radial-gradient(ellipse at bottom left, rgba(255, 215, 0, 0.05) 0%, transparent 50%)",
        overflow: "hidden"
      }}>
        <div style={{ padding: "120px 40px 80px", maxWidth: "1400px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ 
            fontFamily: "Montserrat", 
            fontSize: 14, 
            color: C.blue, 
            textTransform: "uppercase", 
            letterSpacing: 6, 
            marginBottom: 24, 
            fontWeight: 600 
          }}>
            Home / Services
          </div>
          <h1 style={{ 
            fontFamily: "Space Grotesk", 
            fontWeight: 700, 
            fontSize: "clamp(36px, 8vw, 64px)", 
            lineHeight: 1.1, 
            color: C.text, 
            margin: "0 0 24px", 
            letterSpacing: "-2px",
            background: `linear-gradient(135deg, ${C.text} 0%, ${C.gold} 50%, ${C.blue} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% 200%",
            animation: "gradientShift 5s ease infinite"
          }}>
            Our Services
          </h1>
          <p style={{ 
            fontFamily: "Poppins", 
            fontSize: "clamp(16px, 4vw, 18px)", 
            color: C.muted, 
            maxWidth: 800, 
            margin: "0 auto", 
            lineHeight: 1.8 
          }}>
            From live events to digital experiences, we offer end-to-end creative production services across entertainment, marketing, technology and media.
          </p>
        </div>
        <style>{`@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
      </div>
      <div style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
          {serviceCategories.map((category, i) => (
            <div key={i} style={{ 
              padding: "40px", 
              background: "rgba(255, 255, 255, 0.03)", 
              border: `1px solid ${C.border}`, 
              borderRadius: 20, 
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden"
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.4)";
                const icon = e.currentTarget.querySelector('div > svg');
                if (icon) icon.style.transform = "scale(1.2) rotate(10deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = C.border;
                const icon = e.currentTarget.querySelector('div > svg');
                if (icon) icon.style.transform = "scale(1) rotate(0deg)";
              }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid rgba(255, 215, 0, 0.2)", transition: "transform 0.3s ease" }}>
                <category.icon size={32} color={C.gold} style={{ transition: "transform 0.3s ease" }} />
              </div>
              <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 26, color: C.text, marginBottom: 24 }}>{category.title}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                {category.items.map((item, j) => (
                  <div key={j} style={{ fontFamily: "Inter", fontSize: 15, color: C.muted, display: "flex", alignItems: "center", gap: 10, lineHeight: 1.7, transition: "transform 0.2s ease" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(5px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(184, 134, 11, 0.05) 100%)", border: `1px solid ${C.border}`, borderRadius: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 32, width: "100%" }}>
        <div>
          <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", color: C.text, marginBottom: 16 }}>Need a Custom Solution?</div>
          <div style={{ fontFamily: "Inter", fontSize: 18, color: C.muted, lineHeight: 1.7, maxWidth: 600 }}>Let's discuss your project and create something extraordinary together.</div>
        </div>
        <Btn tone="gold" icon={Send} onClick={() => setView("contact")}>Get In Touch</Btn>
      </div>
      <Footer setView={setView} />
    </div>
  );
}

export default ServicesView;
