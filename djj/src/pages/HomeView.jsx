import { Badge, Btn, ScanRing } from "../components/SharedComponents";
import { Footer } from "../components/Layout";
import { C } from "../constants";
import { Palette, Monitor, Smartphone, Sparkles, Tag, Film } from "lucide-react";
import LogoCarousel from "../components/LogoCarousel";

function HomeView({ setView }) {
  const ourNumbers = [
    { value: "2022", label: "Journey Started" },
    { value: "2026", label: "Rebranded as D J EMPIRE PRODUCTION" },
    { value: "100+", label: "Projects Delivered" },
    { value: "2", label: "Countries" },
  ];

  const clientLogos = [
    { id: 1, name: "Client 1", image: "/carousel/c1.png" },
    { id: 2, name: "Client 2", image: "/carousel/c2.png" },
    { id: 3, name: "Client 3", image: "/carousel/c3.png" },
    { id: 4, name: "Client 4", image: "/carousel/c4.png" },
    { id: 5, name: "Client 5", image: "/carousel/c5.png" },
    { id: 6, name: "Client 6", image: "/carousel/c6.png" },
    { id: 7, name: "Client 7", image: "/carousel/c7.png" },
    { id: 8, name: "Client 8", image: "/carousel/c8.png" },
    { id: 9, name: "Client 9", image: "/carousel/c9.png" },
    { id: 10, name: "Client 10", image: "/carousel/c10.png" },
    { id: 11, name: "Client 11", image: "/carousel/c11.png" },
    { id: 12, name: "Client 12", image: "/carousel/c12.png" },
    { id: 13, name: "Client 13", image: "/carousel/c13.png" },
    { id: 14, name: "Client 14", image: "/carousel/c14.png" },
    { id: 15, name: "Client 15", image: "/carousel/c15.png" },
     { id: 16, name: "Client 16", image: "/carousel/c16.jpeg" },
    { id: 17, name: "Client 17", image: "/carousel/c17.png" },
    { id: 18, name: "Client 18", image: "/carousel/c18.png" },
    { id: 19, name: "Client 19", image: "/carousel/c19.png" },
    { id: 20, name: "Client 20", image: "/carousel/c20.png" },
    { id: 21, name: "Client 21", image: "/carousel/c21.jpg" },
    { id: 22, name: "Client 22", image: "/carousel/c22.jpg" },
    
  ];

  return (
    <div>
      {/* Hero Section - Cinematic Premium UI */}
      <div className="hero" style={{ 
        position: "relative",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at center, rgba(255, 215, 0, 0.05) 0%, transparent 70%), radial-gradient(ellipse at top right, rgba(0, 229, 255, 0.05) 0%, transparent 50%)",
        overflow: "hidden"
      }}>
        {/* Animated gradient background */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(45deg, rgba(255, 215, 0, 0.03) 0%, transparent 50%, rgba(0, 229, 255, 0.03) 100%)",
          animation: "gradientMove 15s ease-in-out infinite"
        }} />
        
        <div style={{ padding: "80px 40px 40px", maxWidth: "1400px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ 
            fontFamily: "Montserrat", 
            fontSize: 14, 
            color: C.gold, 
            textTransform: "uppercase", 
            letterSpacing: 6, 
            marginBottom: 32, 
            fontWeight: 600,
            opacity: 0,
            animation: "fadeInUp 1s ease-out 0.2s both"
          }}>
            Premium Creative Studio
          </div>
          
          <h1 style={{ 
            fontFamily: "Space Grotesk", 
            fontWeight: 700, 
            fontSize: "clamp(36px, 8vw, 72px)", 
            lineHeight: 1.1, 
            color: C.text, 
            margin: "0 0 32px", 
            letterSpacing: "-3px",
            opacity: 0,
            animation: "fadeInUp 1s ease-out 0.4s both"
          }}>
            Where Creativity<br />
            <span style={{ 
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.blue} 50%, ${C.gold} 100%)`, 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 200%",
              animation: "gradientShift 5s ease infinite"
            }}>
              Meets Technology
            </span>
          </h1>
          
          <p style={{ 
            fontFamily: "Poppins", 
            fontSize: "clamp(16px, 4vw, 20px)", 
            color: C.muted, 
            maxWidth: 800, 
            margin: "0 auto 48px", 
            lineHeight: 1.8,
            opacity: 0,
            animation: "fadeInUp 1s ease-out 0.6s both"
          }}>
            We create Graphic Design, Animation, Music, Films, Events and Marketing Experiences that transform brands and captivate audiences.
          </p>
          
          <div style={{ 
            display: "flex", 
            gap: 20, 
            justifyContent: "center",
            flexWrap: "wrap",
            opacity: 0,
            animation: "fadeInUp 1s ease-out 0.8s both"
          }}>
            <Btn 
              tone="gold" 
              onClick={() => setView("services")}
              style={{ 
                fontFamily: "Montserrat",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 1,
                padding: "18px 40px",
                borderRadius: 50,
                background: `linear-gradient(135deg, ${C.gold} 0%, ${C.amber} 100%)`,
                boxShadow: `0 8px 32px ${C.goldGlow}`,
                border: "none"
              }}
            >
              Explore Services
            </Btn>
            <Btn 
              tone="ghost" 
              onClick={() => setView("contact")}
              style={{ 
                fontFamily: "Montserrat",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 1,
                padding: "18px 40px",
                borderRadius: 50,
                background: "transparent",
                border: `2px solid ${C.blue}`,
                color: C.blue,
                boxShadow: `0 0 20px ${C.blueDim}`
              }}
            >
              Start Your Project
            </Btn>
          </div>
        </div>

        {/* Floating geometric shapes */}
        <div style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "100px",
          height: "100px",
          border: `1px solid ${C.gold}`,
          borderRadius: "20px",
          transform: "rotate(45deg)",
          opacity: 0.1,
          animation: "float 6s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute",
          bottom: "30%",
          right: "15%",
          width: "150px",
          height: "150px",
          border: `1px solid ${C.blue}`,
          borderRadius: "50%",
          opacity: 0.1,
          animation: "float 8s ease-in-out infinite reverse"
        }} />
        <div style={{
          position: "absolute",
          top: "60%",
          right: "25%",
          width: "80px",
          height: "80px",
          background: `linear-gradient(135deg, ${C.gold} 0%, ${C.blue} 100%)`,
          borderRadius: "12px",
          opacity: 0.05,
          animation: "float 7s ease-in-out infinite"
        }} />

        <style>{`
          @keyframes gradientMove {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(50px); }
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          @media (max-width: 768px) {
            h1 { font-size: 48px !important; }
          }
        `}</style>
      </div>


      {/* Services Section - Grid Layout */}
      <div className="section" style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "Inter", fontSize: 13, color: C.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Our Services</div>
        <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: C.text, marginBottom: 48, lineHeight: 1.2 }}>
          Action what we believe in
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32 }}>
          {[
            { icon: Palette, title: "Graphic Design", desc: "Brand identity, visual design, creative assets" },
            { icon: Monitor, title: "Website Design", desc: "Modern websites, e-commerce, web applications" },
            { icon: Smartphone, title: "App Development", desc: "iOS & Android apps, cross-platform solutions" },
            { icon: Sparkles, title: "UI/UX Design", desc: "User interfaces, experience design, prototyping" },
            { icon: Tag, title: "Product Branding", desc: "Brand strategy, positioning, identity systems" },
            { icon: Film, title: "3D Animation", desc: "3D modeling, animation, visual effects" }
          ].map((service, i) => (
            <div key={i} style={{ padding: "32px", border: `1px solid ${C.border}`, borderRadius: 16, transition: "all 0.3s ease", cursor: "pointer" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.4)";
                e.currentTarget.style.background = "rgba(255, 215, 0, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = "transparent";
              }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255, 215, 0, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: `1px solid ${C.borderGold}` }}>
                <service.icon size={24} color={C.gold} />
              </div>
              <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 20, color: C.text, marginBottom: 12 }}>{service.title}</h3>
              <p style={{ fontFamily: "Inter", fontSize: 15, color: C.muted, lineHeight: 1.6 }}>{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Creative Process Section */}
      <div className="section" style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "Inter", fontSize: 13, color: C.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Our Creative Process</div>
        <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: C.text, marginBottom: 48, lineHeight: 1.2 }}>
          How we bring ideas to life
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
          {[
            { step: "01", title: "Research", desc: "Understanding your vision, audience, and goals" },
            { step: "02", title: "Design", desc: "Creating concepts, prototypes, and visual directions" },
            { step: "03", title: "Development", desc: "Building, testing, and refining the final product" }
          ].map((item, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 72, color: C.gold, opacity: 0.3, lineHeight: 1, marginBottom: 24 }}>{item.step}</div>
              <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 24, color: C.text, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Work Section */}
      <div className="section" style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "Inter", fontSize: 13, color: C.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Featured Work</div>
        <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: C.text, marginBottom: 48, lineHeight: 1.2 }}>
          Work that inspires on multiple levels
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          {[
            { title: "Brand Launch Campaign", category: "Marketing", desc: "Complete brand identity and launch strategy" },
            { title: "Corporate Event Production", category: "Events", desc: "Full-scale event production and management" },
            { title: "Music Video Production", category: "Creative", desc: "Cinematic music video with VFX and editing" }
          ].map((work, i) => (
            <div key={i} style={{ padding: "40px", background: "linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 100%)", border: `1px solid ${C.border}`, borderRadius: 20, transition: "all 0.3s ease", cursor: "pointer" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 16px 48px rgba(0, 0, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}>
              <div style={{ fontFamily: "Inter", fontSize: 13, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontWeight: 600 }}>{work.category}</div>
              <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 24, color: C.text, marginBottom: 12 }}>{work.title}</h3>
              <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.6 }}>{work.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Awards Section */}
      <div className="section" style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "Inter", fontSize: 13, color: C.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Our Latest Awards</div>
        <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: C.text, marginBottom: 48, lineHeight: 1.2 }}>
          Recognition for excellence
        </h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {["Best Creative Agency 2024", "Excellence in Digital Marketing", "Top Event Production", "Innovation Award"].map((award, i) => (
            <div key={i} style={{ padding: "20px 32px", background: "rgba(255, 215, 0, 0.08)", border: `1px solid ${C.border}`, borderRadius: 50, fontFamily: "Inter", fontSize: 16, color: C.text, fontWeight: 500 }}>
              {award}
            </div>
          ))}
        </div>
      </div>


      {/* Client Logo Carousel */}
      <LogoCarousel logos={clientLogos} speed={35} direction="left" />

      {/* Client Testimonials Section */}
      <div className="section" style={{ padding: "100px 40px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontFamily: "Montserrat", fontSize: 13, color: C.gold, textTransform: "uppercase", letterSpacing: 6, marginBottom: 20, fontWeight: 600 }}>Testimonials</div>
          <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: C.text, marginBottom: 16 }}>What Our Clients Say</h2>
          <p style={{ fontFamily: "Poppins", fontSize: 16, color: C.muted, maxWidth: 600, margin: "0 auto" }}>
            Trusted by brands worldwide to deliver exceptional creative solutions.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          {[
            { name: "Sarah Johnson", company: "Tech Startup", text: "D J EMPIRE transformed our brand identity completely. Their attention to detail and creative vision exceeded our expectations.", rating: 5 },
            { name: "Michael Chen", company: "Event Management", text: "The team delivered an outstanding event production. Professional, creative, and incredibly efficient. Highly recommended!", rating: 5 },
            { name: "Emily Davis", company: "Marketing Agency", text: "Working with D J EMPIRE was a game-changer for our clients. Their animation and video production is world-class.", rating: 5 }
          ].map((testimonial, i) => (
            <div key={i} style={{ 
              padding: "40px", 
              background: "rgba(255, 255, 255, 0.03)", 
              border: `1px solid ${C.border}`, 
              borderRadius: 20, 
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-12px)";
              e.currentTarget.style.borderColor = C.borderGold;
              e.currentTarget.style.boxShadow = `0 20px 60px ${C.goldGlow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = "none";
            }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {[...Array(testimonial.rating)].map((_, j) => (
                  <div key={j} style={{ color: C.gold, fontSize: 20 }}>★</div>
                ))}
              </div>
              <p style={{ fontFamily: "Poppins", fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>
                "{testimonial.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: "50%", 
                  background: `linear-gradient(135deg, ${C.gold} 0%, ${C.blue} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#000"
                }}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 16, color: C.text }}>{testimonial.name}</div>
                  <div style={{ fontFamily: "Montserrat", fontSize: 13, color: C.gold, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="section" style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", textAlign: "center", width: "100%" }}>
        <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(32px, 6vw, 48px)", color: C.text, marginBottom: 24, lineHeight: 1.2 }}>
          Smart ideas with visionary agency
        </h2>
        <p style={{ fontFamily: "Inter", fontSize: 18, color: C.muted, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Let's create something extraordinary together. Share your vision and we'll bring it to life.
        </p>
        <Btn tone="gold" onClick={() => setView("contact")}>Get in touch</Btn>
      </div>

      <Footer setView={setView} />
    </div>
  );
}

export default HomeView;
