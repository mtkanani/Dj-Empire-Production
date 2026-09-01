import { useState } from "react";
import { Mail, Phone, MessageCircle, MapPin, Globe, Send, CheckCircle2 } from "lucide-react";
import { PageHeader, Panel, Btn } from "../components/SharedComponents";
import { Footer } from "../components/Layout";
import { C } from "../constants";

const inputStyle = {
  width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`,
  background: "rgba(255, 255, 255, 0.05)", color: C.text, fontFamily: "Inter", fontSize: 14,
  outline: "none", transition: "all 0.3s ease"
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "Inter", fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
}

function ContactView({ setView }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSent(true);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Hero Section - Premium Cinematic UI */}
      <div className="hero" style={{ 
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
            Home / Contact
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
            Get In Touch
          </h1>
          <p style={{ 
            fontFamily: "Poppins", 
            fontSize: "clamp(16px, 4vw, 18px)", 
            color: C.muted, 
            maxWidth: 800, 
            margin: "0 auto", 
            lineHeight: 1.8 
          }}>
            Whether you're launching a brand, planning a concert, creating a film, producing music, developing a website or growing your business—D J EMPIRE PRODUCTION is your complete creative partner.
          </p>
        </div>
        <style>{`@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
      </div>

      <div className="section contact-grid" style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div className="panel" style={{ padding: "40px", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = C.border;
          }}>
          {!sent ? (
            <div>
              <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 28, color: C.text, marginBottom: 32 }}>Send us a message</div>
              <Field label="Full name">
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </Field>
              <Field label="Email">
                <input style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" />
              </Field>
              <Field label="Phone (optional)">
                <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile" />
              </Field>
              <Field label="Tell us about your project">
                <textarea style={{ ...inputStyle, minHeight: 140, resize: "vertical", fontFamily: "Inter" }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your project, requirements, timeline..." />
              </Field>
              <Btn tone="gold" icon={Send} disabled={sending || !form.name || !form.email || !form.message} onClick={submit} style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
                {sending ? "Sending..." : "Send message"}
              </Btn>
              <div style={{ fontFamily: "Inter", fontSize: 13, color: C.faint, marginTop: 16, textAlign: "center" }}>
                Messages will be sent to info.djempire@gmail.com
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <CheckCircle2 size={48} color={C.gold} style={{ margin: "0 auto 24px" }} />
              <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 24, color: C.text, marginBottom: 12 }}>Message received</div>
              <div style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, marginBottom: 24 }}>We'll get back to {form.email} shortly.</div>
              <Btn onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}>Send another</Btn>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
          <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 28, color: C.text, marginBottom: 8 }}>Get In Touch</div>
          <div style={{ fontFamily: "Inter", fontSize: 16, color: C.muted, marginBottom: 32, lineHeight: 1.7 }}>
            Have a question or want to work together? Reach out to us through any of these channels.
          </div>
          {[
            { icon: Mail, label: "Email", value: "info.djempire@gmail.com" },
            { icon: Phone, label: "Phone", value: "+91 6351599181" },
            { icon: MessageCircle, label: "WhatsApp", value: "+91 6351599181" },
            { icon: MapPin, label: "India Office", value: "Vadodara, Gujarat" },
            { icon: Globe, label: "United Kingdom", value: "Freelance Projects " }
          ].map((item, i) => (
            <div key={i} style={{ 
              display: "flex", 
              gap: 20, 
              alignItems: "center", 
              padding: "28px", 
              background: "rgba(255, 255, 255, 0.03)", 
              border: `1px solid ${C.border}`, 
              borderRadius: 16,
              transition: "all 0.3s ease"
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.4)";
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.transform = "scale(1.2) rotate(10deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = C.border;
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.transform = "scale(1) rotate(0deg)";
              }}>
              <item.icon size={28} color={C.gold} style={{ transition: "transform 0.3s ease" }} />
              <div>
                <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 16, color: C.text }}>{item.label}</div>
                <div style={{ fontFamily: "Inter", fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } } @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      <Footer setView={setView} />
    </div>
  );
}

export default ContactView;
