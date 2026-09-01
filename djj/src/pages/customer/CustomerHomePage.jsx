import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Sparkles, ArrowRight, Music, Cpu, Trophy, Film } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { customerEventService } from '../../services/customer/customerEventService.js';
import { CustomerNavbar } from '../../components/customer/CustomerNavbar.jsx';
import { CustomerFooter } from '../../components/customer/CustomerFooter.jsx';
import { EventSearchHero } from '../../components/customer/EventSearchHero.jsx';
import { EventGrid } from '../../components/customer/EventGrid.jsx';

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomepageData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [eventsRes, catRes, citiesRes] = await Promise.allSettled([
          customerEventService.browseEvents(),
          customerEventService.getCategories(),
          customerEventService.getCities(),
        ]);

        if (eventsRes.status === 'fulfilled') {
          const rawEv = eventsRes.value.data || eventsRes.value || [];
          setEvents(Array.isArray(rawEv) ? rawEv : []);
        } else {
          setError('Failed to fetch events');
        }

        if (catRes.status === 'fulfilled') {
          const rawCat = catRes.value.data || catRes.value || [];
          setCategories(Array.isArray(rawCat) ? rawCat : []);
        }

        if (citiesRes.status === 'fulfilled') {
          const rawCit = citiesRes.value.data || citiesRes.value || [];
          setCities(Array.isArray(rawCit) ? rawCit : []);
        }
      } catch (err) {
        setError(err.message || 'Error loading homepage data');
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bgMain, color: C.text, display: 'flex', flexDirection: 'column' }}>
      <CustomerNavbar />

      <main style={{ flexGrow: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '60px' }}>
        {/* Hero Section */}
        <EventSearchHero cities={cities} />

        {/* Category Pills Slider Section */}
        {categories.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 700, margin: 0 }}>
                  Browse by Category
                </h2>
                <span style={{ fontSize: '13px', color: C.muted }}>Explore events categorized by interest</span>
              </div>

              <Link to="/events" style={{ color: C.gold, fontSize: '13px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/events?categoryId=${cat.id}`)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '16px',
                    background: C.bgCard,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.gold)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
                >
                  <Sparkles size={14} color={C.gold} /> {cat.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Featured & Upcoming Events Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 800, margin: 0 }}>
                Explore Featured & Upcoming Events
              </h2>
              <span style={{ fontSize: '13px', color: C.muted }}>Handpicked concerts, festivals, and tech summits</span>
            </div>

            <Link to="/events" style={{ color: C.gold, fontSize: '14px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All Events ({events.length}) <ArrowRight size={16} />
            </Link>
          </div>

          <EventGrid events={events} loading={loading} error={error} />
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}
