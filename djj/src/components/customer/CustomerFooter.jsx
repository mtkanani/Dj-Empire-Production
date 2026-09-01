import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Youtube, Mail, Phone, MessageCircle, Globe } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const CustomerFooter = ({ setView }) => {
  const navigate = useNavigate();

  const handleNav = (targetView) => {
    if (setView) {
      setView(targetView);
    } else {
      switch (targetView) {
        case 'home':
          navigate('/');
          break;
        case 'events':
          navigate('/events');
          break;
        case 'about':
          navigate('/about');
          break;
        case 'services':
          navigate('/services');
          break;
        case 'portfolio':
          navigate('/portfolio');
          break;
        case 'contact':
          navigate('/contact');
          break;
        default:
          navigate('/');
      }
    }
  };

  return (
    <footer
      style={{
        padding: '100px 40px 40px',
        borderTop: `1px solid ${C.border}`,
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
        position: 'relative',
        overflow: 'hidden',
        marginTop: '80px',
      }}
    >
      {/* Decorative gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent)',
        }}
      />

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 60,
          marginBottom: 60,
          position: 'relative',
          zIndex: 1,
          width: '100%',
        }}
      >
        {/* Brand Column */}
        <div>
          <img
            src="/logo.png"
            alt="D J EMPIRE PRODUCTION"
            style={{
              height: 70,
              width: 'auto',
              objectFit: 'contain',
              marginBottom: 20,
              filter: 'drop-shadow(0 4px 20px rgba(255, 215, 0, 0.3))',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div
            style={{
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              fontSize: 24,
              marginBottom: 8,
              letterSpacing: -0.5,
              background: 'linear-gradient(135deg, #FFD700 0%, #FFF8DC 25%, #FFD700 50%, #DAA520 75%, #B8860B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            D J EMPIRE
          </div>
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: 12,
              color: C.gold,
              marginBottom: 24,
              letterSpacing: 4,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            PRODUCTION
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 24 }}>
            Creative • Production • Entertainment • Technology
          </div>
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: 15,
              color: C.gold,
              fontWeight: 600,
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Globe size={18} color={C.gold} />
            <span>India | United Kingdom</span>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { icon: Instagram, url: 'https://www.instagram.com/d.j.empire_productions?utm_source=qr&igsh=MW5sOTh5Zzh2d3JpeA==' },
              { icon: Facebook },
              { icon: Linkedin },
              { icon: Youtube },
            ].map((social, i) => {
              const boxStyle = {
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: `1px solid ${C.border}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              };

              const enter = (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = C.gold;
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 215, 0, 0.2)';
              };

              const leave = (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.boxShadow = 'none';
              };

              const inner = (
                <div style={boxStyle}>
                  <social.icon size={20} color={C.gold} />
                </div>
              );

              if (social.url) {
                return (
                  <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onMouseEnter={enter} onMouseLeave={leave}>
                    {inner}
                  </a>
                );
              }

              return (
                <div key={i} style={boxStyle} onMouseEnter={enter} onMouseLeave={leave}>
                  <social.icon size={20} color={C.gold} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: 14, color: C.gold, marginBottom: 28, letterSpacing: 2, textTransform: 'uppercase' }}>
            Explore
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['home', 'events', 'about', 'services', 'portfolio', 'contact'].map((v) => (
              <button
                key={v}
                onClick={() => handleNav(v)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: 15,
                  color: C.muted,
                  textTransform: 'capitalize',
                  padding: '10px 0',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  position: 'relative',
                  letterSpacing: 0.5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C.gold;
                  e.currentTarget.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = C.muted;
                  e.currentTarget.style.paddingLeft = '0';
                }}
              >
                {v === 'events' ? 'Explore Events' : v}
              </button>
            ))}
          </div>
        </div>

        {/* Services Column */}
        <div>
          <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: 14, color: C.gold, marginBottom: 28, letterSpacing: 2, textTransform: 'uppercase' }}>
            Services
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Event Production', 'Marketing', 'Creative Studio', 'Digital Services', 'Music Production'].map((service, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: 15,
                  color: C.muted,
                  padding: '10px 0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  letterSpacing: 0.5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C.gold;
                  e.currentTarget.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = C.muted;
                  e.currentTarget.style.paddingLeft = '0';
                }}
              >
                {service}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info Column */}
        <div>
          <div style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: 14, color: C.gold, marginBottom: 28, letterSpacing: 2, textTransform: 'uppercase' }}>
            Get in Touch
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <a
              href="mailto:d.j.empireproductions@gmail.com"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: 'Inter',
                fontSize: 14,
                color: C.muted,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              <Mail size={18} color={C.gold} />
              <span>d.j.empireproductions@gmail.com</span>
            </a>
            <a
              href="tel:+919876543210"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: 'Inter',
                fontSize: 14,
                color: C.muted,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              <Phone size={18} color={C.gold} />
              <span>+91 98765 43210</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sub-Footer */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          paddingTop: 32,
          borderTop: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ fontFamily: 'Inter', fontSize: 14, color: C.muted }}>
          © {new Date().getFullYear()} D J EMPIRE PRODUCTION. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'Inter',
                fontSize: 14,
                color: C.muted,
                cursor: 'pointer',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
