import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import FountainPen3D from '@/components/FountainPen3D';
import { useSite } from '@/context/SiteContext';
import { useIsMobile } from '@/hooks/use-mobile';


/* Corner star SVG component matching the uploaded design */
function CornerStar({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="16,0 18,12 32,16 18,20 16,32 14,20 0,16 14,12" />
      <polygon points="16,4 17.5,14 28,16 17.5,18 16,28 14.5,18 4,16 14.5,14" opacity="0.6" />
    </svg>
  );
}

/* Intersection observer hook for scroll animations */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

const Index = () => {
  const navigate = useNavigate();
  const { content } = useSite();
  const isMobile = useIsMobile();
  const isLoggedIn = localStorage.getItem('inkopia_auth') === 'true';


  const hero = useInView(0.1);
  const concierge = useInView();
  const ritual = useInView();
  const commission = useInView();

  return (
    <div className="relative w-full min-h-screen text-foreground selection:bg-gold selection:text-black">
      {/* Decorative borders — matching logo theme */}
      <div className="page-frame" />
      <CornerStar className="corner-star corner-star--tl" />
      <CornerStar className="corner-star corner-star--tr" />
      <CornerStar className="corner-star corner-star--bl" />
      <CornerStar className="corner-star corner-star--br" />


      {/* Login link */}
      <div className={`fixed ${isMobile ? 'top-6 right-6' : 'top-10 right-10'} z-50`}>
        <Link 
          to={isLoggedIn ? "/dashboard" : "/signup"} 
          className={`text-[10px] tracking-[0.3em] font-sans uppercase text-ink-green hover:opacity-70 transition-all ${isMobile ? 'bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-ink-green/10 shadow-sm' : ''}`}
        >
          {isLoggedIn ? "Dashboard" : "Sign In"}
        </Link>
      </div>

      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <FountainPen3D />
      </div>

      {/* Content overlay */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
          <div
            ref={hero.ref}
            className={`flex flex-col items-center section-fade ${hero.isVisible ? 'visible' : ''}`}
          >
            {/* Logo merged with background — multiply blend makes the cream bg transparent */}
            <div className="flex justify-center pb-2 transition-transform duration-700 hover:scale-[1.02]">
              <img
                src="/logo.png"
                alt="INKOPIA"
                className="w-[180px] md:w-[460px] lg:w-[580px] h-auto -mt-4 transition-all"
              />
            </div>
            <p className="text-[10px] md:text-xs tracking-[0.6em] uppercase text-muted-foreground mt-1 font-sans font-light">
              {content.heroSubheading}
            </p>
          </div>

          {/* Premium Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-700">
            <span className="text-[8px] uppercase tracking-[0.5em] font-bold">Discover</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent scroll-indicator" />
          </div>
        </section>

        {/* The Concierge */}
        <section className="min-h-screen flex items-center px-8 md:px-12 lg:px-20 py-20 md:py-0">
          <div
            ref={concierge.ref}
            className={`max-w-md lg:max-w-lg section-fade ${concierge.isVisible ? 'visible' : ''}`}
          >
            <div className={`gold-divider mb-6 ${concierge.isVisible ? 'visible' : ''}`} />
            <p className="text-[10px] tracking-[0.5em] uppercase text-accent font-sans mb-3">
              {content.conciergeTitle}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif font-bold text-foreground leading-[1.1] md:leading-[0.95] mb-6">
              {(content.conciergeHeading || "").split('.').map((part, i) => (
                <span key={i} className="block md:inline">{part}{i === 0 && part ? '.' : ''}{i === 0 && <br className="hidden md:block" />}</span>
              ))}
            </h2>
            <p className="text-sm md:text-base text-foreground/70 leading-relaxed font-sans font-light max-w-sm">
              {content.conciergeText}
            </p>
          </div>
          
          {/* Decorative background logo for Concierge */}
          {!isMobile && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] rotate-12 pointer-events-none">
              <img src="/logo.png" alt="" className="w-[800px] grayscale" />
            </div>
          )}
        </section>

        {/* The Master Rituals - Contained Infographic Panels */}
        <section className="relative py-8">
          {/* Frosted backdrop so the 3D pen shows through blurred */}
          <div className="absolute inset-0 backdrop-blur-[2px] bg-white/50 pointer-events-none" />

          <div ref={ritual.ref} className={`relative z-10 section-fade ${ritual.isVisible ? 'visible' : ''}`}>
            {/* Section Header */}
            <div className="flex flex-col items-center text-center py-16 px-6">
              <div className="gold-divider mb-8" style={{ width: ritual.isVisible ? '80px' : '0' }} />
              <p className="text-[11px] tracking-[0.7em] uppercase text-accent font-sans font-bold">
                {content.ritualTitle}
              </p>
            </div>

            {/* Panel 1 — The Cleansing Protocol */}
            <div className="group px-4 md:px-12 lg:px-20 mb-12 md:mb-0">
              {/* Contained image card */}
              <div className="mx-auto max-w-5xl rounded-2xl overflow-hidden border border-gold/20 shadow-[0_20px_60px_rgba(0,0,0,0.12)] relative bg-white/10 backdrop-blur-[4px]">
                <img
                  src="/infographic1.png"
                  alt="The Cleansing Protocol"
                  className="w-full h-auto object-contain block grayscale-[0.05] group-hover:grayscale-0 transition-all duration-1000 scale-[1.01]"
                />
                {/* Soft inner vignette to blend edges */}
                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(245,245,245,0.4)] pointer-events-none rounded-2xl" />
              </div>
              
              {/* Premium Caption Card */}
              <div className="mx-auto max-w-5xl mt-[-1px] relative z-20">
                <div className="flex flex-col md:flex-row items-center justify-between px-6 py-8 md:py-5 border border-gold/20 rounded-b-2xl bg-white/70 backdrop-blur-xl shadow-xl">
                  <div className="flex flex-col items-center md:items-start mb-5 md:mb-0">
                    <span className="text-[7px] md:text-[9px] uppercase tracking-[0.7em] text-gold font-bold mb-2">Protocol I – III</span>
                    <span className="text-[12px] md:text-[11px] uppercase tracking-[0.5em] text-accent font-semibold md:hidden">Cleansing</span>
                  </div>
                  
                  <p className="text-[12px] md:text-xs text-foreground/80 font-sans font-medium leading-relaxed max-w-sm text-center md:text-center px-6 md:px-0">
                    A pharmaceutical-grade purge of the reservoir and feed, restoring absolute clarity of flow.
                  </p>
                  
                  <span className="text-[9px] uppercase tracking-[0.5em] text-gold/50 font-bold hidden md:block">Cleansing</span>
                </div>
              </div>
            </div>

            {/* Elegant Star Divider */}
            <div className="flex items-center gap-4 md:gap-6 px-12 md:px-32 py-12 md:py-16">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent md:to-gold/25" />
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute inset-0 bg-gold/15 rounded-full blur-md animate-pulse" />
                <svg viewBox="0 0 24 24" className="w-3.5 md:w-4 h-3.5 md:h-4 text-gold/60 relative z-10" fill="currentColor">
                  <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
                </svg>
              </div>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-gold/30 to-transparent md:to-gold/25" />
            </div>

            {/* Panel 2 — The Ink Replenishment Ritual */}
            <div className="group px-4 md:px-12 lg:px-20 mb-12 md:mb-0">
              <div className="mx-auto max-w-5xl rounded-2xl overflow-hidden border border-gold/20 shadow-[0_20px_60px_rgba(0,0,0,0.12)] relative bg-white/10 backdrop-blur-[4px]">
                <img
                  src="/infographic2.png"
                  alt="The Ink Replenishment Ritual"
                  className="w-full h-auto object-contain block grayscale-[0.05] group-hover:grayscale-0 transition-all duration-1000 scale-[1.01]"
                />
                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(245,245,245,0.4)] pointer-events-none rounded-2xl" />
              </div>
              
              <div className="mx-auto max-w-5xl mt-[-1px] relative z-20">
                <div className="flex flex-col md:flex-row items-center justify-between px-6 py-8 md:py-5 border border-gold/20 rounded-b-2xl bg-white/70 backdrop-blur-xl shadow-xl">
                  <div className="flex flex-col items-center md:items-start mb-5 md:mb-0">
                    <span className="text-[7px] md:text-[9px] uppercase tracking-[0.7em] text-gold font-bold mb-2">Protocol IV – VI</span>
                    <span className="text-[12px] md:text-[11px] uppercase tracking-[0.5em] text-accent font-semibold md:hidden">Replenishment</span>
                  </div>
                  
                  <p className="text-[12px] md:text-xs text-foreground/80 font-sans font-medium leading-relaxed max-w-sm text-center md:text-center px-6 md:px-0">
                    Surgical precision in loading the curated ink selection for a consistently flawless flow.
                  </p>
                  
                  <span className="text-[9px] uppercase tracking-[0.5em] text-gold/50 font-bold hidden md:block">Replenishment</span>
                </div>
              </div>
            </div>

            {/* Elegant Star Divider */}
            <div className="flex items-center gap-4 md:gap-6 px-12 md:px-32 py-12 md:py-16">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent md:to-gold/25" />
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute inset-0 bg-gold/15 rounded-full blur-md animate-pulse" />
                <svg viewBox="0 0 24 24" className="w-3.5 md:w-4 h-3.5 md:h-4 text-gold/60 relative z-10" fill="currentColor">
                  <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
                </svg>
              </div>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-gold/30 to-transparent md:to-gold/25" />
            </div>

            {/* Panel 3 — The Writing Mastery Ritual */}
            <div className="group px-4 md:px-12 lg:px-20 mb-12 md:mb-0">
              <div className="mx-auto max-w-5xl rounded-2xl overflow-hidden border border-gold/20 shadow-[0_20px_60px_rgba(0,0,0,0.12)] relative bg-white/10 backdrop-blur-[4px]">
                <img
                  src="/infographic3.png"
                  alt="The Writing Mastery Ritual"
                  className="w-full h-auto object-contain block grayscale-[0.05] group-hover:grayscale-0 transition-all duration-1000 scale-[1.01]"
                />
                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(245,245,245,0.4)] pointer-events-none rounded-2xl" />
              </div>
              
              <div className="mx-auto max-w-5xl mt-[-1px] relative z-20">
                <div className="flex flex-col md:flex-row items-center justify-between px-6 py-8 md:py-5 border border-gold/20 rounded-b-2xl bg-white/70 backdrop-blur-xl shadow-xl">
                  <div className="flex flex-col items-center md:items-start mb-5 md:mb-0">
                    <span className="text-[7px] md:text-[9px] uppercase tracking-[0.7em] text-gold font-bold mb-2">Protocol VII – IX</span>
                    <span className="text-[12px] md:text-[11px] uppercase tracking-[0.5em] text-accent font-semibold md:hidden">Mastery</span>
                  </div>
                  
                  <p className="text-[12px] md:text-xs text-foreground/80 font-sans font-medium leading-relaxed max-w-sm text-center md:text-center px-6 md:px-0">
                    Nib tuning, angle calibration and hand-polishing for the ultimate sensory writing experience.
                  </p>
                  
                  <span className="text-[9px] uppercase tracking-[0.5em] text-gold/50 font-bold hidden md:block">Mastery</span>
                </div>
              </div>
            </div>

            {/* Bottom spacer */}
            <div className="py-16" />
          </div>
        </section>


        {/* Commission */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6">
          <div
            ref={commission.ref}
            className={`flex flex-col items-center section-fade ${commission.isVisible ? 'visible' : ''}`}
          >
            <div className={`gold-divider mb-8 ${commission.isVisible ? 'visible' : ''}`} style={{ width: commission.isVisible ? '48px' : '0' }} />
            <p className="text-[10px] tracking-[0.5em] uppercase text-accent font-sans mb-4">
              {content.commissionTitle}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif font-bold text-foreground text-center leading-[1.1] md:leading-[0.95] mb-6">
              {(content.commissionHeading || "").split('.').map((part, i) => (
                <span key={i} className="block md:inline">{part}{i === 0 && part ? '.' : ''}{i === 0 && <br className="hidden md:block" />}</span>
              ))}
            </h2>
            <p className="max-w-sm text-center text-sm text-foreground/70 leading-relaxed mb-8 font-sans font-light">
              {content.commissionText}
            </p>
            <div className="mb-12 text-center border border-gold/20 p-8 glass-panel max-w-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gold/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
              <p className="text-[10px] uppercase tracking-widest text-gold mb-2 font-bold relative z-10">Current Highlight</p>
              <h4 className="font-serif text-2xl text-primary mb-2 relative z-10">{content.commissionPenBrand}</h4>
              <p className="italic text-muted-foreground font-serif text-lg relative z-10">{content.commissionPenName}</p>
            </div>
            <button
              onClick={() => {
                navigate(isLoggedIn ? '/dashboard' : '/signup');
              }}
              className="btn-inkopia px-16 py-5 text-[10px] font-sans tracking-[0.4em] uppercase font-bold relative z-10"
            >
              {isLoggedIn ? "Enter Your Private Vault" : "Secure Your Commission"}
            </button>
          </div>
        </section>
      </div>


    </div>
  );
};

export default Index;
