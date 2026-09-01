import { Target, Compass, Zap, Globe, BadgeCheck, Send } from "lucide-react";
import { PageHeader, Panel, Badge, Btn } from "../components/SharedComponents";
import { Footer } from "../components/Layout";
import { C } from "../constants";

function AboutView({ setView }) {
  const coreValues = [
    "Innovation", "Creativity", "Commitment", "Integrity", "Quality",
    "Teamwork", "Passion", "Customer Success", "Global Thinking", "Continuous Learning"
  ];

  return (
    <div>
      {/* Hero Section - Premium Cinematic UI */}
      <div className="hero" style={{ 
        position: "relative",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at center, rgba(255, 215, 0, 0.05) 0%, transparent 70%), radial-gradient(ellipse at top right, rgba(0, 229, 255, 0.05) 0%, transparent 50%)",
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
            Home / About
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
            About Us
          </h1>
          <p style={{ 
            fontFamily: "Poppins", 
            fontSize: "clamp(16px, 4vw, 18px)", 
            color: C.muted, 
            maxWidth: 800, 
            margin: "0 auto", 
            lineHeight: 1.8 
          }}>
            Every successful company begins with a dream. From Shree Haree Events & Promotion to D J EMPIRE PRODUCTION, our journey has been one of growth, innovation and creative excellence.
          </p>
        </div>
        <style>{`@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
      </div>

      <div className="section" style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div className="two-col" style={{ marginBottom: 80 }}>
          <div>
            <div style={{ fontFamily: "Inter", fontSize: 13, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Our Story</div>
            <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: C.text, marginBottom: 24, lineHeight: 1.2 }}>Building Dreams Since 2022</h2>
            <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 16 }}>
              Our journey started in 2022 under the name Shree Haree Events & Promotion, where we specialized in promotional campaigns, brand activations, event management and manpower solutions.
            </p>
            <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 16 }}>
              Over the years, we worked with numerous businesses, helping brands reach their audience through innovative marketing campaigns and professional event execution.
            </p>
            <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 16 }}>
              As technology evolved and client expectations grew, we recognized the need to offer much more than traditional event services.
            </p>
            <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.8 }}>
              In 2026, we proudly transformed into D J EMPIRE PRODUCTION, a full-service creative production company delivering world-class solutions across entertainment, digital media, technology and marketing.
            </p>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ 
              aspectRatio: "4/3", 
              borderRadius: 20, 
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)",
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 72, color: C.gold, marginBottom: 16 }}>2022</div>
                <div style={{ fontFamily: "Inter", fontSize: 18, color: C.muted }}>Founded</div>
                <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 72, color: C.gold, marginBottom: 16, marginTop: 32 }}>2026</div>
                <div style={{ fontFamily: "Inter", fontSize: 18, color: C.muted }}>Rebranded</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32, marginBottom: 80 }}>
          <div style={{ padding: "40px", background: "rgba(255, 255, 255, 0.03)", border: `1px solid ${C.border}`, borderRadius: 20, transition: "all 0.3s ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = C.border;
            }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid rgba(255, 215, 0, 0.2)" }}>
              <Target size={32} color={C.gold} />
            </div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 26, color: C.text, marginBottom: 20 }}>Our Mission</h3>
            <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.8 }}>
              To become a trusted global creative production company by delivering innovative entertainment, digital solutions and marketing experiences that empower businesses, inspire audiences and create opportunities for artists, creators and brands.
            </p>
          </div>
          <div style={{ padding: "40px", background: "rgba(255, 255, 255, 0.03)", border: `1px solid ${C.border}`, borderRadius: 20, transition: "all 0.3s ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = C.border;
            }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, rgba(155, 118, 83, 0.15) 0%, rgba(155, 118, 83, 0.05) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid rgba(155, 118, 83, 0.2)" }}>
              <Compass size={32} color={C.purple} />
            </div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 26, color: C.text, marginBottom: 20 }}>Our Vision</h3>
            <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.8 }}>
              Our vision is to position D J EMPIRE PRODUCTION among the most respected creative production companies in the world. We aspire to become a platform where businesses build brands, artists discover opportunities and creators transform imagination into reality.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "Inter", fontSize: 13, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>What We Believe In</div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", color: C.text }}>Core Values</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
            {coreValues.map((value, i) => (
              <div key={i} style={{ 
                background: "rgba(255, 255, 255, 0.03)", 
                padding: "28px 20px", 
                borderRadius: 16, 
                border: `1px solid ${C.border}`, 
                textAlign: "center", 
                transition: "all 0.3s ease",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.4)";
                e.currentTarget.style.background = "rgba(255, 215, 0, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}>
                <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 18, color: C.gold }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32, marginBottom: 80 }}>
          <div style={{ padding: "40px", background: "rgba(255, 255, 255, 0.03)", border: `1px solid ${C.border}`, borderRadius: 20, transition: "all 0.3s ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = C.border;
            }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, rgba(255, 140, 0, 0.15) 0%, rgba(255, 140, 0, 0.05) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid rgba(255, 140, 0, 0.2)" }}>
              <Zap size={32} color={C.orange} />
            </div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 26, color: C.text, marginBottom: 16 }}>For Artists</h3>
            <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 16, fontWeight: 600 }}>
              We Believe Every Artist Deserves A Stage
            </p>
            <p style={{ fontFamily: "Inter", fontSize: 15, color: C.muted, lineHeight: 1.8 }}>
              D J EMPIRE PRODUCTION proudly supports musicians, singers, actors, dancers, influencers, filmmakers and digital creators. Whether you're an emerging talent or an established performer, we help transform your creativity into opportunities through professional production, branding and promotion.
            </p>
          </div>
          <div style={{ padding: "40px", background: "rgba(255, 255, 255, 0.03)", border: `1px solid ${C.border}`, borderRadius: 20, transition: "all 0.3s ease" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = C.border;
            }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid rgba(34, 197, 94, 0.2)" }}>
              <Globe size={32} color={C.green} />
            </div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 26, color: C.text, marginBottom: 16 }}>For India</h3>
            <p style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 16, fontWeight: 600 }}>
              Proudly Made In India
            </p>
            <p style={{ fontFamily: "Inter", fontSize: 15, color: C.muted, lineHeight: 1.8 }}>
              We believe India's creativity has the power to influence the world. Our mission is to promote Indian talent, culture and innovation through world-class production, digital media and entertainment experiences while creating employment opportunities for young creative professionals.
            </p>
          </div>
        </div>

        <div style={{ padding: "48px", background: "rgba(255, 255, 255, 0.02)", border: `1px solid ${C.border}`, borderRadius: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40, marginBottom: 80 }}>
          <div>
            <div style={{ fontFamily: "Inter", fontSize: 13, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Global Presence</div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 32, color: C.text, marginBottom: 12 }}>India & United Kingdom</h3>
            <div style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>
              Combining global standards with local expertise
            </div>
            <h4 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 22, color: C.text, marginBottom: 20 }}>India Office</h4>
            <div style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 2 }}>
              <div style={{ marginBottom: 12 }}>• Creative Production</div>
              <div style={{ marginBottom: 12 }}>• Events</div>
              <div style={{ marginBottom: 12 }}>• Marketing</div>
              <div style={{ marginBottom: 12 }}>• Technology</div>
              <div>• Brand Solutions</div>
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 22, color: C.text, marginBottom: 20 }}>United Kingdom</h4>
            <div style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, lineHeight: 2 }}>
              <div style={{ marginBottom: 12 }}>• Freelance Creative Projects</div>
              <div style={{ marginBottom: 12 }}>• Digital Production</div>
              <div style={{ marginBottom: 12 }}>• Animation</div>
              <div style={{ marginBottom: 12 }}>• Graphic Design</div>
              <div style={{ marginBottom: 12 }}>• Website Development</div>
              <div>• International Client Support</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "Inter", fontSize: 13, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Our Expertise</div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", color: C.text }}>Industries We Serve</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            {["Entertainment", "Corporate", "Government", "Education", "Healthcare", "Fashion", "Real Estate", "Retail", "Hospitality", "Automobile", "Startups", "NGOs"].map((industry, i) => (
              <div key={i} style={{ 
                background: "rgba(255, 255, 255, 0.03)", 
                padding: "32px 20px", 
                borderRadius: 16, 
                border: `1px solid ${C.border}`, 
                textAlign: "center", 
                transition: "all 0.3s ease",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.4)";
                e.currentTarget.style.background = "rgba(255, 215, 0, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}>
                <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 18, color: C.text }}>{industry}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "Inter", fontSize: 13, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Our Strength</div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", color: C.text }}>Why Choose Us</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            {["Creative Team", "Experienced Professionals", "Latest Technology", "Transparent Process", "Dedicated Support", "Pan India Operations", "UK Freelance Support", "Affordable Pricing", "On Time Delivery", "Quality Commitment"].map((reason, i) => (
              <div key={i} style={{ 
                background: "rgba(255, 255, 255, 0.03)", 
                padding: "28px", 
                borderRadius: 16, 
                border: `1px solid ${C.border}`, 
                display: "flex", 
                alignItems: "center", 
                gap: 16, 
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = C.border;
              }}>
                <BadgeCheck size={24} color={C.gold} />
                <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 18, color: C.text }}>{reason}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "Inter", fontSize: 13, color: C.gold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>How We Work</div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", color: C.text }}>Our Process</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { step: "01", title: "Consultation", description: "We understand your vision, goals and requirements through detailed discussions." },
              { step: "02", title: "Planning", description: "We create a comprehensive strategy and roadmap tailored to your project." },
              { step: "03", title: "Design", description: "Our creative team develops concepts, designs and prototypes for your approval." },
              { step: "04", title: "Production", description: "We execute the plan with precision, using the latest technology and techniques." },
              { step: "05", title: "Execution", description: "We bring everything together seamlessly for a flawless delivery." },
              { step: "06", title: "Delivery", description: "We hand over the completed project with all deliverables and documentation." },
              { step: "07", title: "Support", description: "We provide ongoing support to ensure your continued success." }
            ].map((item, i) => (
              <div key={i} style={{ 
                background: "rgba(255, 255, 255, 0.03)", 
                padding: "32px", 
                borderRadius: 20, 
                border: `1px solid ${C.border}`, 
                position: "relative", 
                overflow: "hidden",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = C.border;
              }}>
                <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 48, color: C.gold, marginBottom: 16, opacity: 0.3 }}>{item.step}</div>
                <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 22, color: C.text, marginBottom: 12 }}>{item.title}</div>
                <div style={{ fontFamily: "Inter", fontSize: 15, color: C.muted, lineHeight: 1.7 }}>{item.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontFamily: "Montserrat", fontSize: 13, color: C.gold, textTransform: "uppercase", letterSpacing: 6, marginBottom: 20, fontWeight: 600 }}>Our Team</div>
            <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: C.text }}>Meet The Creative Minds</h3>
            <p style={{ fontFamily: "Poppins", fontSize: 16, color: C.muted, maxWidth: 600, margin: "20px auto 0", lineHeight: 1.7 }}>
              A passionate team of designers, developers, and strategists dedicated to bringing your vision to life.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32 }}>
            {[
              { name: "Pinal Togadiya", role: "Cofounder & CfO ", color: C.gold, image: "f1.png" },
              { name: "Ayush Chauhan", role: "Cofounder & CTO", color: C.blue, image: "f2.png" },
              { name: "Jaymin Chauhan", role: "founder & CEO", color: C.gold, image: "f3.png" },
              { name: "Tushar Parmar", role: "founder & COO", color: C.blue, image: "f4.png" }
            ].map((member, i) => (
              <div key={i} style={{ 
                padding: "40px", 
                background: "rgba(255, 255, 255, 0.03)", 
                border: `1px solid ${C.border}`, 
                borderRadius: 20, 
                textAlign: "center",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-12px) scale(1.03)";
                e.currentTarget.style.borderColor = member.color;
                e.currentTarget.style.boxShadow = `0 20px 60px ${member.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.boxShadow = "none";
              }}>
                {member.image ? (
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    overflow: "hidden",
                    margin: "0 auto 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${C.border}`
                  }}>
                    <img src={`/founderr/${member.image}`} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ) : (
                  <div style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: "50%", 
                    background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}40 100%)`, 
                    margin: "0 auto 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#000"
                  }}>
                    {member.name.charAt(0)}
                  </div>
                )}
                <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 20, color: C.text, marginBottom: 8 }}>{member.name}</div>
                <div style={{ fontFamily: "Montserrat", fontSize: 14, color: member.color, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(184, 134, 11, 0.05) 100%)", border: `1px solid ${C.border}`, borderRadius: 24, textAlign: "center", width: "100%" }}>
        <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(28px, 5vw, 42px)", color: C.text, marginBottom: 20 }}>Let's Build Something Extraordinary Together</h3>
        <p style={{ fontFamily: "Inter", fontSize: 18, color: C.muted, marginBottom: 40, maxWidth: 750, margin: "0 auto 40px", lineHeight: 1.8 }}>
          Whether you're launching a brand, planning a concert, creating a film, producing music, developing a website or growing your business—D J EMPIRE PRODUCTION is your complete creative partner. Let's create something unforgettable.
        </p>
        <Btn tone="gold" icon={Send} onClick={() => setView("contact")}>Get In Touch</Btn>
      </div>
      <Footer setView={setView} />
    </div>
  );
}

export default AboutView;
