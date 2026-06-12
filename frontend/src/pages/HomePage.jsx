import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Users, 
  Calendar, 
  Star, 
  Search, 
  MapPin, 
  Wrench, 
  Car,
  CheckCircle,
  Clock,
  ArrowRight,
  CreditCard,
  Shield,
  Map,
  Building2,
  Smartphone,
  Sparkles,
  Zap,
  Award,
  ThumbsUp,
  TrendingUp,
  Phone,
  Mail
} from 'lucide-react';

/* ── Images professionnelles ── */
const MECHANIC_PNG = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&q=85';
const WORKSHOP_IMG = 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=1000&q=85';
const MODERN_GARAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&q=85';

const TESTIMONIALS = [
  { name: 'Karim B.', city: 'Casablanca', note: 5, text: 'Service rapide et professionnel. J\'ai trouvé un garage de confiance en 2 minutes !', avatar: 'KB' },
  { name: 'Fatima Z.', city: 'Rabat', note: 5, text: 'Le suivi en temps réel est incroyable. Je sais exactement où en est ma voiture.', avatar: 'FZ' },
  { name: 'Amine S.', city: 'Marrakech', note: 5, text: 'Les devis en ligne m\'ont évité beaucoup de déplacements. Vraiment pratique !', avatar: 'AS' },
];

const STATS = [
  { key: 'providers', number: '500+', icon: Building2 },
  { key: 'clients', number: '12K+', icon: Users },
  { key: 'rdv', number: '45K+', icon: Calendar },
  { key: 'rating', number: '4.9', icon: Star },
];

const SERVICES = [
  { id: 'garage', labelKey: 'garage', descKey: 'garage_desc', icon: Building2 },
  { id: 'carrosserie', labelKey: 'carrosserie', descKey: 'carrosserie_desc', icon: Car },
  { id: 'electricite', labelKey: 'electricite', descKey: 'electricite_desc', icon: Wrench },
  { id: 'depannage', labelKey: 'depannage', descKey: 'depannage_desc', icon: Smartphone },
  { id: 'controle_technique', labelKey: 'controle_technique', descKey: 'controle_technique_desc', icon: CheckCircle },
  { id: 'assurance', labelKey: 'assurance', descKey: 'assurance_desc', icon: Shield },
];

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    const step = num / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { 
        setCount(num); 
        clearInterval(timer); 
      } else setCount(current);
    }, 16);
    return () => clearInterval(timer);
  }, [start, target, duration]);
  return count;
}

function AnimatedStat({ number, label, icon: Icon, startAnim }) {
  const num = useCountUp(number, 1800, startAnim);
  const isFloat = number.includes('.');
  const suffix = number.replace(/[0-9.]/g, '');
  const displayNumber = startAnim ? (isFloat ? num.toFixed(1) : Math.floor(num).toLocaleString()) + suffix : '0';
  
  return (
    <div style={{ 
      textAlign: 'center', 
      animation: startAnim ? 'slideUpFade 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards' : 'none', 
      opacity: 0,
      transform: 'translateY(40px)'
    }}>
      <div style={{ 
        marginBottom: '12px', 
        position: 'relative',
        display: 'inline-block'
      }}>
        <div style={{
          position: 'absolute',
          inset: '-10px',
          background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulseGlow 2s infinite'
        }} />
        <Icon size={44} color="#dc2626" strokeWidth={1.5} />
      </div>
      <div style={{
        fontFamily: "'Inter', sans-serif", fontWeight: 800,
        fontSize: 'clamp(36px, 4vw, 52px)', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1,
      }}>
        {displayNumber}
      </div>
      <div style={{ color: '#6b7280', marginTop: '8px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function AnimatedCard({ children, delay = 0, direction = 'up' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getAnimation = () => {
    if (!isVisible) return 'none';
    switch(direction) {
      case 'left': return `slideInLeft 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards ${delay}s`;
      case 'right': return `slideInRight 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards ${delay}s`;
      default: return `slideUpFade 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards ${delay}s`;
    }
  };

  const getTransform = () => {
    if (direction === 'left') return 'translateX(-40px)';
    if (direction === 'right') return 'translateX(40px)';
    return 'translateY(40px)';
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        animation: getAnimation(),
        transform: getTransform(),
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [ville, setVille] = useState('');
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) setStatsVisible(true); 
    }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (search) p.set('q', search);
    if (ville) p.set('ville', ville);
    navigate(`/prestataires?${p.toString()}`);
  };

  const statsLabels = {
    providers: t('home.stats_providers', { defaultValue: 'Prestataires' }),
    clients: t('home.stats_clients', { defaultValue: 'Clients' }),
    rdv: t('home.stats_rdv', { defaultValue: 'Rendez-vous' }),
    rating: t('home.stats_rating', { defaultValue: 'Note moyenne' }),
  };

  return (
    <main style={{ 
      fontFamily: "'Inter', sans-serif", 
      background: '#ffffff', 
      color: '#1a1a2e', 
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(220,38,38,0.2); box-shadow: 0 0 0 0 rgba(220,38,38,0.1); }
          50% { border-color: rgba(220,38,38,0.6); box-shadow: 0 0 20px 5px rgba(220,38,38,0.2); }
        }
        
        .service-card {
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }
        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(220,38,38,0.05), transparent);
          transition: left 0.6s ease;
          pointer-events: none;
        }
        .service-card:hover::before {
          left: 100%;
        }
        .service-card:hover {
          transform: translateY(-12px) scale(1.02);
        }
        
        .floating-element {
          animation: float 4s ease-in-out infinite;
        }
        .floating-slow {
          animation: floatSlow 5s ease-in-out infinite;
        }
        
        .hero-gradient {
          background: radial-gradient(ellipse at 20% 40%, rgba(220,38,38,0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 60%, rgba(220,38,38,0.05) 0%, transparent 50%);
        }
        
        .glow-text {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #b91c1c 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        
        .stat-card {
          transition: all 0.4s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        
        .testimonial-card {
          animation: borderGlow 2s infinite;
        }
        
        .service-arrow {
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .service-card:hover .service-arrow {
          opacity: 1 !important;
          transform: translateX(5px);
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO SECTION - RED THEME WITH DYNAMIC BG
      ══════════════════════════════════════════ */}
      <section 
        className="hero-gradient"
        style={{ 
          position: 'relative', 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #fff5f5 0%, #fff 50%, #fef2f2 100%)',
        }}
      >
        {/* Animated background elements */}
        <div style={{
          position: 'absolute', top: '10%', right: '0',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)',
          animation: 'rotateSlow 20s linear infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '0', left: '0',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)',
          animation: 'rotateSlow 25s linear infinite reverse',
          pointerEvents: 'none',
        }} />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            background: `radial-gradient(circle, rgba(220,38,38,${Math.random() * 0.08}) 0%, transparent 70%)`,
            animation: `floatSlow ${Math.random() * 5 + 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            
            {/* Left content */}
            <div>
              <AnimatedCard direction="left" delay={0}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(220,38,38,0.12)',
                  border: '1px solid rgba(220,38,38,0.25)',
                  borderRadius: '100px', padding: '10px 28px', marginBottom: '32px',
                  color: '#dc2626', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <Sparkles size={16} className="floating-element" />
                  {t('app.tagline', { defaultValue: 'Service Auto au Maroc' })}
                </div>
              </AnimatedCard>

              <AnimatedCard direction="left" delay={0.1}>
                <h1 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(48px, 6vw, 76px)',
                  fontWeight: 800, lineHeight: 1.08,
                  color: '#1a1a2e', marginBottom: '28px',
                  letterSpacing: '-0.03em',
                }}>
                  {t('home.hero_title', { defaultValue: 'Votre voiture' })}<br />
                  <span className="glow-text" style={{ 
                    position: 'relative',
                    display: 'inline-block',
                  }}>
                    {t('home.hero_title_accent', { defaultValue: 'entre de bonnes mains' })}
                    <span style={{
                      position: 'absolute',
                      bottom: '-12px',
                      left: '0',
                      width: '100%',
                      height: '4px',
                      background: 'linear-gradient(90deg, #dc2626, #fbbf24, #dc2626)',
                      borderRadius: '2px',
                      animation: 'shimmer 2s linear infinite',
                      backgroundSize: '200% auto',
                    }} />
                  </span>
                </h1>
              </AnimatedCard>

              <AnimatedCard direction="left" delay={0.2}>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '18px', 
                  lineHeight: 1.7, 
                  marginBottom: '48px', 
                  maxWidth: '540px',
                }}>
                  {t('home.hero_subtitle', { defaultValue: 'Trouvez le meilleur garage près de chez vous et prenez rendez-vous en quelques clics.' })}
                </p>
              </AnimatedCard>

              {/* Search form */}
              <AnimatedCard direction="left" delay={0.3}>
                <form onSubmit={handleSearch}>
                  <div style={{
                    display: 'flex', gap: '0',
                    background: '#fff', borderRadius: '24px',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 40px 80px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.12)';
                  }}>
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', padding: '0 24px', borderRight: '1px solid #f0f0f0' }}>
                      <Search size={22} color="#dc2626" style={{ marginRight: '16px', flexShrink: 0 }} />
                      <input
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px', color: '#1a1a2e', background: 'transparent', padding: '20px 0', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                        placeholder={t('home.search_placeholder', { defaultValue: 'Rechercher un service...' })}
                        value={search} onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 24px', borderRight: '1px solid #f0f0f0' }}>
                      <MapPin size={22} color="#dc2626" style={{ marginRight: '16px', flexShrink: 0 }} />
                      <input
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px', color: '#1a1a2e', background: 'transparent', padding: '20px 0', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                        placeholder={t('home.city_placeholder', { defaultValue: 'Ville' })}
                        value={ville} onChange={e => setVille(e.target.value)}
                      />
                    </div>
                    <button type="submit" style={{
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      color: '#fff', border: 'none', padding: '0 48px',
                      fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '15px',
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s ease',
                      letterSpacing: '0.5px',
                    }}
                    onMouseEnter={e => { 
                      e.currentTarget.style.background = 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={e => { 
                      e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                      {t('home.search_btn', { defaultValue: 'Rechercher' })} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                  </div>

                  {/* Quick tags */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '28px' }}>
                    {['Vidange', 'Freins', 'Climatisation', 'Diagnostic', 'Pneumatiques'].map((tag, i) => (
                      <button 
                        key={tag} 
                        type="button" 
                        onClick={() => setSearch(tag)} 
                        style={{
                          background: 'rgba(220,38,38,0.08)',
                          border: '1px solid rgba(220,38,38,0.15)',
                          color: '#dc2626', padding: '12px 26px', borderRadius: '100px',
                          fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        }}
                        onMouseEnter={e => { 
                          e.currentTarget.style.background = '#dc2626'; 
                          e.currentTarget.style.color = '#fff'; 
                          e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(220,38,38,0.3)';
                        }}
                        onMouseLeave={e => { 
                          e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; 
                          e.currentTarget.style.color = '#dc2626'; 
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </form>
              </AnimatedCard>
            </div>

            {/* Right side - Animated Mechanic */}
            <AnimatedCard direction="right" delay={0.2}>
              <div style={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <div className="floating-slow" style={{
                  position: 'relative',
                  maxWidth: '520px',
                  width: '100%',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '-20px',
                    right: '-20px',
                    bottom: '-20px',
                    background: 'radial-gradient(ellipse, rgba(220,38,38,0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulseGlow 3s infinite',
                  }} />
                  <img 
                    src={MECHANIC_PNG} 
                    alt="Mécanicien souriant"
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.2))',
                      borderRadius: '30px',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  />
                  
                  {/* Floating rating badge */}
                  <div className="floating-element" style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '-30px',
                    background: '#fff',
                    padding: '18px 28px',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                    borderLeft: '5px solid #dc2626',
                    zIndex: 3,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '28px', color: '#1a1a2e' }}>4.9<span style={{ fontSize: '16px', color: '#9ca3af' }}>/5</span></div>
                        <div style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>Note moyenne</div>
                      </div>
                      <div>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} color="#fbbf24" fill="#fbbf24" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating verified badge */}
                  <div className="floating-element" style={{
                    position: 'absolute',
                    top: '60px',
                    left: '-40px',
                    background: '#fff',
                    padding: '14px 24px',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                    animationDelay: '1s',
                    zIndex: 3,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Award size={24} color="#10b981" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a2e' }}>Expert vérifié</div>
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>Garantie satisfait</div>
                      </div>
                    </div>
                  </div>

                  {/* Floating stats badge */}
                  <div className="floating-element" style={{
                    position: 'absolute',
                    bottom: '180px',
                    left: '-20px',
                    background: '#fff',
                    padding: '12px 20px',
                    borderRadius: '16px',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                    animationDelay: '2s',
                    zIndex: 3,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <TrendingUp size={20} color="#dc2626" />
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a2e' }}>+45K interventions</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '40px', left: '50%',
          transform: 'translateX(-50%)',
          animation: 'float 2s infinite',
          cursor: 'pointer',
          zIndex: 10,
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 5px 15px rgba(220,38,38,0.3)',
          }}>
            <ArrowRight size={20} color="#fff" style={{ transform: 'rotate(90deg)' }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS SECTION WITH COUNTERS
      ══════════════════════════════════════════ */}
      <section ref={statsRef} style={{ padding: '80px 40px', background: '#ffffff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '50px' }}>
            {STATS.map((s, i) => (
              <div key={i} className="stat-card">
                <AnimatedStat 
                  number={s.number} 
                  label={statsLabels[s.key]} 
                  icon={s.icon} 
                  startAnim={statsVisible} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES SECTION WITH ANIMATED CARDS
      ══════════════════════════════════════════ */}
      <section style={{ padding: '100px 40px', background: '#fafafa', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #dc2626, transparent)',
        }} />
        
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <AnimatedCard delay={0}>
              <div style={{
                display: 'inline-block', 
                background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(220,38,38,0.05) 100%)',
                color: '#dc2626', 
                padding: '8px 24px', 
                borderRadius: '100px',
                fontSize: '13px', 
                fontWeight: 700, 
                marginBottom: '20px', 
                letterSpacing: '1.5px',
                border: '1px solid rgba(220,38,38,0.2)',
              }}>
                {t('home.categories_title', { defaultValue: 'NOS SERVICES' }).toUpperCase()}
              </div>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                {t('home.categories_subtitle', { defaultValue: 'Des services variés pour votre véhicule' })}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: 500 }}>Des prestataires qualifiés pour chaque besoin</p>
            </AnimatedCard>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {SERVICES.map((s, idx) => {
              const Icon = s.icon;
              return (
                <AnimatedCard key={s.id} delay={idx * 0.08} direction="up">
                  <Link to={`/prestataires?categorie=${s.id}`} style={{ textDecoration: 'none' }}>
                    <div className="service-card" style={{
                      background: '#fff', 
                      border: '1px solid #f0f0f0', 
                      borderRadius: '28px',
                      padding: '44px 32px', 
                      cursor: 'pointer', 
                      height: '100%',
                      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#dc2626';
                      e.currentTarget.style.boxShadow = '0 30px 60px rgba(220,38,38,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#f0f0f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <div style={{
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(220,38,38,0.05) 100%)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: '32px', 
                        transition: 'all 0.3s ease',
                      }}>
                        <Icon size={36} color="#dc2626" strokeWidth={1.5} />
                      </div>
                      <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
                        {t(`categories.${s.labelKey}`, { defaultValue: s.labelKey })}
                      </h3>
                      <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.6 }}>
                        {t(`categories.${s.descKey}`, { defaultValue: 'Service professionnel de qualité' })}
                      </p>
                      <ArrowRight size={20} color="#dc2626" style={{ marginTop: '24px' }} className="service-arrow" />
                    </div>
                  </Link>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS WITH TIMELINE
      ══════════════════════════════════════════ */}
      <section style={{ padding: '100px 40px', background: '#ffffff', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <AnimatedCard direction="left" delay={0}>
                <div style={{
                  display: 'inline-block', 
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(220,38,38,0.05) 100%)',
                  color: '#dc2626', 
                  padding: '8px 24px', 
                  borderRadius: '100px',
                  fontSize: '13px', 
                  fontWeight: 700, 
                  marginBottom: '20px', 
                  letterSpacing: '1.5px',
                }}>
                  {t('home.how_title', { defaultValue: 'COMMENT ÇA MARCHE' }).toUpperCase()}
                </div>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(32px, 3.5vw, 44px)', fontWeight: 800, marginBottom: '48px', letterSpacing: '-0.02em' }}>
                  {t('home.how_title', { defaultValue: 'Comment ça marche' })}
                </h2>
              </AnimatedCard>

              {[
                { n: '01', titleKey: 'step1_title', descKey: 'step1_desc', icon: Search },
                { n: '02', titleKey: 'step2_title', descKey: 'step2_desc', icon: Calendar },
                { n: '03', titleKey: 'step3_title', descKey: 'step3_desc', icon: CheckCircle },
              ].map((step, i) => (
                <AnimatedCard key={i} direction="left" delay={0.1 + i * 0.1}>
                  <div style={{ display: 'flex', gap: '28px', marginBottom: '48px', alignItems: 'flex-start', position: 'relative' }}>
                    <div style={{
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '20px', 
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontFamily: "'Inter', sans-serif", 
                      fontWeight: 800, 
                      fontSize: '24px', 
                      color: '#fff',
                      boxShadow: '0 15px 30px rgba(220,38,38,0.35)',
                      position: 'relative',
                    }}>
                      {step.n}
                      <div style={{
                        position: 'absolute',
                        inset: '-8px',
                        borderRadius: '24px',
                        background: 'rgba(220,38,38,0.2)',
                        zIndex: -1,
                      }} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '22px', marginBottom: '12px', color: '#1a1a2e' }}>
                        {t(`home.${step.titleKey}`, { defaultValue: step.titleKey })}
                      </h3>
                      <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '16px' }}>
                        {t(`home.${step.descKey}`, { defaultValue: 'Description du service' })}
                      </p>
                    </div>
                  </div>
                </AnimatedCard>
              ))}

              <AnimatedCard direction="left" delay={0.4}>
                <Link to="/inscription" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '14px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fff', padding: '18px 44px', borderRadius: '20px',
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '16px',
                  textDecoration: 'none', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: '0 15px 35px rgba(220,38,38,0.4)',
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'; 
                  e.currentTarget.style.boxShadow = '0 25px 45px rgba(220,38,38,0.5)';
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(220,38,38,0.4)';
                }}>
                  {t('home.cta_register', { defaultValue: 'Créer un compte' })} 
                  <Zap size={18} />
                </Link>
              </AnimatedCard>
            </div>

            {/* Photo collage with animations */}
            <div style={{ position: 'relative', height: '560px' }}>
              <AnimatedCard direction="right" delay={0.2}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '75%', height: '320px',
                  borderRadius: '32px', overflow: 'hidden',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                }}>
                  <img src={MODERN_GARAGE} alt="Garage moderne" style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
              </AnimatedCard>
              
              <AnimatedCard direction="right" delay={0.35}>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, width: '65%', height: '280px',
                  borderRadius: '32px', overflow: 'hidden',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                }}>
                  <img src={WORKSHOP_IMG} alt="Atelier" style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
              </AnimatedCard>

              {/* Floating badge */}
              <AnimatedCard direction="right" delay={0.5}>
                <div className="floating-element" style={{
                  position: 'absolute', bottom: '140px', right: '-10px',
                  background: '#fff',
                  padding: '20px 30px',
                  borderRadius: '28px',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                  borderLeft: '5px solid #dc2626',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%',
                      background: '#10b981',
                      animation: 'pulseGlow 1.5s infinite',
                    }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '18px', color: '#1a1a2e' }}>+500 {t('home.stats_providers', { defaultValue: 'Prestataires' })}</div>
                      <div style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 500 }}>Disponibles 24/7</div>
                    </div>
                    <ThumbsUp size={28} color="#dc2626" />
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS — RED THEME
      ══════════════════════════════════════════ */}
      <section style={{ padding: '100px 40px', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          pointerEvents: 'none',
        }} />
        
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <AnimatedCard delay={0}>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 800, letterSpacing: '3px', marginBottom: '20px' }}>
              TÉMOIGNAGES
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(30px,4vw,42px)', fontWeight: 800, color: '#fff', marginBottom: '50px' }}>
              Ce que nos clients disent
            </h2>
          </AnimatedCard>

          <div style={{ minHeight: '360px', position: 'relative' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                position: i === activeTestimonial ? 'relative' : 'absolute',
                opacity: i === activeTestimonial ? 1 : 0,
                transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: i === activeTestimonial ? 'auto' : 'none',
                width: '100%',
              }}>
                {i === activeTestimonial && (
                  <AnimatedCard delay={0}>
                    <div className="testimonial-card" style={{
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '40px', 
                      padding: '56px',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}>
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" style={{ marginBottom: '28px', marginLeft: 'auto', marginRight: 'auto' }}>
                        <path d="M3 21c3 0 5-2 7-5v-8H8v6H5V8H3v13zM17 21c3 0 5-2 7-5v-8h-2v6h-3V8h-2v13z"/>
                      </svg>
                      <p style={{ color: '#fff', fontSize: '20px', lineHeight: 1.7, marginBottom: '36px', fontStyle: 'italic', fontWeight: 500 }}>
                        "{t.text}"
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontFamily: "'Inter', sans-serif", 
                          fontWeight: 800, 
                          color: '#fff', 
                          fontSize: '18px',
                          border: '2px solid rgba(255,255,255,0.3)',
                        }}>{t.avatar}</div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>{t.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500 }}>📍 {t.city}</div>
                        </div>
                        <div style={{ marginLeft: '8px', display: 'flex', gap: '6px' }}>
                          {[...Array(t.note)].map((_, i) => (
                            <Star key={i} size={20} color="#fbbf24" fill="#fbbf24" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '50px' }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                width: i === activeTestimonial ? '40px' : '10px',
                height: '10px', 
                borderRadius: '5px',
                background: i === activeTestimonial ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none', 
                cursor: 'pointer', 
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding: '100px 40px', background: '#ffffff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <AnimatedCard delay={0}>
            <div style={{
              width: '90px', 
              height: '90px', 
              borderRadius: '32px',
              background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(220,38,38,0.05) 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 36px',
              border: '1px solid rgba(220,38,38,0.2)',
            }}>
              <Building2 size={44} color="#dc2626" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(32px,4vw,48px)', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em' }}>
              {t('home.cta_title', { defaultValue: 'Prêt à prendre soin de votre voiture ?' })}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '50px', lineHeight: 1.6, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              {t('home.cta_subtitle', { defaultValue: 'Rejoignez des milliers de clients satisfaits' })}
            </p>
          </AnimatedCard>

          <AnimatedCard delay={0.1}>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/inscription" style={{
                display: 'inline-flex', alignItems: 'center', gap: '14px',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#fff', padding: '18px 48px', borderRadius: '24px',
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '16px',
                textDecoration: 'none', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 15px 35px rgba(220,38,38,0.35)',
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.transform = 'translateY(-5px)'; 
                e.currentTarget.style.boxShadow = '0 25px 45px rgba(220,38,38,0.45)';
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(220,38,38,0.35)';
              }}>
                <ArrowRight size={20} />
                {t('home.cta_register', { defaultValue: 'Créer un compte' })}
              </Link>
              <Link to="/prestataires" style={{
                display: 'inline-flex', alignItems: 'center', gap: '14px',
                background: 'transparent', 
                color: '#dc2626', 
                padding: '18px 48px', 
                borderRadius: '24px',
                fontFamily: "'Inter', sans-serif", 
                fontWeight: 700, 
                fontSize: '16px',
                textDecoration: 'none', 
                border: '2px solid #dc2626',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = 'rgba(220,38,38,0.05)'; 
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(220,38,38,0.15)';
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = 'transparent'; 
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <Search size={20} />
                {t('home.cta_browse', { defaultValue: 'Explorer les prestataires' })}
              </Link>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <div style={{ marginTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>
                <CreditCard size={20} color="#dc2626" />
                Paiement sécurisé
              </span>
              <span style={{ fontSize: '14px', color: '#e5e7eb' }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>
                <CheckCircle size={20} color="#dc2626" />
                Professionnels vérifiés
              </span>
              <span style={{ fontSize: '14px', color: '#e5e7eb' }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>
                <Map size={20} color="#dc2626" />
                100% Maroc
              </span>
            </div>
          </AnimatedCard>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a1a2e', color: 'rgba(255,255,255,0.7)', padding: '70px 40px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', marginBottom: '60px' }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '28px', marginBottom: '20px' }}>
                <span style={{ color: '#dc2626' }}>AutoLink</span>
                <span style={{ color: '#fff' }}> Maroc</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.7, maxWidth: '300px', marginBottom: '24px' }}>
                {t('app.tagline', { defaultValue: 'La meilleure plateforme pour l\'entretien de votre véhicule au Maroc' })}
              </p>
            </div>
            {[
              { title: t('home.categories_title', { defaultValue: 'Services' }), links: [t('categories.garage', { defaultValue: 'Garage' }), t('categories.carrosserie', { defaultValue: 'Carrosserie' }), t('categories.electricite', { defaultValue: 'Électricité' })] },
              { title: t('nav.howItWorks', { defaultValue: 'Comment ça marche' }), links: [t('home.step1_title', { defaultValue: 'Recherche' }), t('nav.register', { defaultValue: 'Inscription' }), t('nav.login', { defaultValue: 'Connexion' })] },
              { title: 'Contact', links: ['support@autolink.ma', '0800 000 000', 'Casablanca'], icons: [Mail, Phone, MapPin] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#fff', marginBottom: '24px', fontSize: '16px', letterSpacing: '0.5px' }}>{col.title}</div>
                {col.links.map((l, idx) => (
                  <div key={l} style={{ 
                    fontSize: '13px', 
                    marginBottom: '12px', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: col.icons ? '8px' : '0',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                    {col.icons && idx < col.icons.length && React.createElement(col.icons[idx], { size: 14 })}
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '32px', textAlign: 'center', fontSize: '13px' }}>
            {t('footer.rights', { defaultValue: '© 2024 AutoLink Maroc. Tous droits réservés.' })}
          </div>
        </div>
      </footer>
    </main>
  );
}