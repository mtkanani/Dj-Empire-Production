import { Send } from "lucide-react";
import { PageHeader, Panel, Btn } from "../components/SharedComponents";
import { Footer } from "../components/Layout";
import { C } from "../constants";

function PortfolioView({ setView }) {
  const galleryImages = [
    "/gallery/g1.jpeg",
    "/gallery/g2.jpeg",
    "/gallery/g3.jpg",
    "/gallery/g4.jpg",
    "/gallery/g5.jpg",
    "/gallery/g6.jpeg",
    "/gallery/g7.jpg",
    "/gallery/g8.jpeg",
    "/gallery/g9.jpeg",
    "/gallery/g10.jpeg",
    "/gallery/g11.jpeg",
    "/gallery/g12.jpeg",
    "/gallery/g13.jpeg",
    "/gallery/g14.jpeg",
    "/gallery/g15.jpeg",
    "/gallery/g16.jpeg",
    "/gallery/g17.jpeg",
    "/gallery/g18.jpeg",
    "/gallery/g20.jpeg",
    "/gallery/g21.jpeg",
    "/gallery/g22.jpg",
    "/gallery/g23.jpeg",
    "/gallery/g24.jpeg",
    "/gallery/g25.jpeg",
    "/gallery/g26.jpeg",
    "/gallery/g27.jpeg",
    "/gallery/g28.jpeg",
    "/gallery/g29.jpeg",
    "/gallery/g30.jpeg",
    "/gallery/g31.jpeg",
    "/gallery/g32.jpeg",
    "/gallery/g33.jpeg",
    "/gallery/g34.jpeg",
    "/gallery/g35.jpeg",
    "/gallery/g36.jpeg",
    "/gallery/g37.jpeg"
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
        background: "radial-gradient(ellipse at center, rgba(255, 215, 0, 0.05) 0%, transparent 70%), radial-gradient(ellipse at bottom right, rgba(0, 229, 255, 0.05) 0%, transparent 50%)",
        overflow: "hidden"
      }}>
        <div style={{ padding: "120px 40px 80px", maxWidth: "1400px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ 
            fontFamily: "Montserrat", 
            fontSize: 14, 
            color: C.gold, 
            textTransform: "uppercase", 
            letterSpacing: 6, 
            marginBottom: 24, 
            fontWeight: 600 
          }}>
            Home / Portfolio
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
            Our Portfolio
          </h1>
          <p style={{ 
            fontFamily: "Poppins", 
            fontSize: "clamp(16px, 4vw, 18px)", 
            color: C.muted, 
            maxWidth: 800, 
            margin: "0 auto", 
            lineHeight: 1.8 
          }}>
            Explore our creative excellence across events, branding, digital solutions, and production projects.
          </p>
        </div>
        <style>{`@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
      </div>

      {/* Gallery Section */}
      <div style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
          {galleryImages.map((image, i) => (
            <div key={i} style={{ 
              position: "relative",
              borderRadius: 16, 
              overflow: "hidden",
              aspectRatio: "4/3",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 16px 48px rgba(255, 215, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}>
              <img
                src={image}
                alt={`Gallery ${i + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(184, 134, 11, 0.05) 100%)", border: `1px solid ${C.border}`, borderRadius: 24, textAlign: "center", width: "100%" }}>
        <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: C.text, marginBottom: 20 }}>Have a Project in Mind?</h3>
        <p style={{ fontFamily: "Inter", fontSize: 18, color: C.muted, marginBottom: 40, maxWidth: 750, margin: "0 auto 40px", lineHeight: 1.8 }}>
          Let's create something extraordinary together. Share your vision and we'll bring it to life.
        </p>
        <Btn tone="gold" icon={Send} onClick={() => setView("contact")}>Start Your Project</Btn>
      </div>
      <Footer setView={setView} />
    </div>
  );
}

export default PortfolioView;
