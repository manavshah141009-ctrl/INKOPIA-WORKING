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

  // Preload large assets for smooth 3D experience
  useEffect(() => {
    if (content.penImage) {
      const img = new Image();
      img.src = content.penImage;
    }
  }, [content.penImage]);

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

        {/* The White-Glove Concierge Service — Text Only Statement Layout */}
        <section className="relative py-24 md:py-40 overflow-hidden">
          {/* Subtle frosted backdrop so the 3D pen shows through clearly */}
          <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 pointer-events-none" />

          <div ref={ritual.ref} className={`relative z-10 section-fade max-w-6xl mx-auto px-6 ${ritual.isVisible ? 'visible' : ''}`}>
            
            {/* Main Statement Header */}
            <div className="flex flex-col items-center text-center mb-40 md:mb-64">
              <div className="gold-divider mb-16" style={{ width: ritual.isVisible ? '160px' : '0' }} />
              <h2 className="text-4xl md:text-8xl font-serif text-accent mb-20 italic leading-[1.1] max-w-5xl">
                "Focus entirely on the writing. <br className="hidden md:block" /> Let us handle the mess."
              </h2>
              <div className="flex items-center gap-6 md:gap-10 mb-10">
                <div className="w-10 md:w-16 h-[1px] bg-gold/40" />
                <p className="text-[12px] md:text-[20px] tracking-[0.8em] md:tracking-[1.2em] uppercase text-gold font-sans font-extrabold whitespace-nowrap">
                  The White-Glove Concierge
                </p>
                <div className="w-10 md:w-16 h-[1px] bg-gold/40" />
              </div>
              <p className="text-lg md:text-3xl text-foreground/50 font-sans max-w-4xl leading-relaxed italic font-medium">
                We bring the world's finest pen care and ink library directly to your home or office. 
                Zero mess, zero downtime, and endless colour possibilities.
              </p>
            </div>

            {/* Pillar 1 — The Mobile Atelier */}
            <div className="mb-40 md:mb-64 group">
              <div className="flex flex-col md:flex-row items-baseline gap-6 md:gap-20 mb-10 md:mb-16">
                <span className="text-6xl md:text-9xl font-serif text-gold/25 font-light italic leading-none">01</span>
                <h3 className="text-4xl md:text-7xl font-serif text-accent uppercase tracking-tight leading-tight">
                  The Mobile <br className="hidden md:block" /> Atelier
                </h3>
              </div>
              <div className="md:ml-40 max-w-4xl border-l-2 border-gold/20 pl-8 md:pl-20 py-6">
                <p className="text-xl md:text-4xl text-foreground/80 font-sans leading-relaxed font-medium italic">
                  No mailing your precious pens. No dropping them off. Our trained artisans come directly to your residence or workplace at a time that suits you.
                </p>
                <div className="mt-12 flex items-center gap-6">
                  <span className="text-[12px] md:text-[15px] uppercase tracking-[0.6em] text-gold font-bold">Convenience redefined</span>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-gold/40 to-transparent" />
                </div>
              </div>
            </div>

            {/* Star Motif Divider */}
            <div className="flex justify-center mb-32 md:mb-56">
               <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl animate-pulse" />
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-gold/60 relative z-10" fill="currentColor">
                  <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
                </svg>
              </div>
            </div>

            {/* Pillar 2 — Sacred Preservation */}
            <div className="mb-40 md:mb-64 group text-right flex flex-col items-end">
              <div className="flex flex-col md:flex-row-reverse items-baseline gap-6 md:gap-20 mb-10 md:mb-16">
                <span className="text-6xl md:text-9xl font-serif text-gold/25 font-light italic leading-none">02</span>
                <h3 className="text-4xl md:text-7xl font-serif text-accent uppercase tracking-tight leading-tight">
                  Sacred <br className="hidden md:block" /> Preservation
                </h3>
              </div>
              <div className="md:mr-40 max-w-4xl border-r-2 border-gold/20 pr-8 md:pr-20 py-6">
                <p className="text-xl md:text-4xl text-foreground/80 font-sans leading-relaxed font-medium italic">
                  We treat your instruments with the utmost respect. We meticulously flush, clean, and inspect your pens by hand, strictly avoiding harsh ultrasonic machines.
                </p>
                <div className="mt-12 flex items-center gap-6 flex-row-reverse">
                  <span className="text-[12px] md:text-[15px] uppercase tracking-[0.6em] text-gold font-bold">Artisanal hand-care</span>
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-gold/40 to-transparent" />
                </div>
              </div>
            </div>

             {/* Star Motif Divider */}
             <div className="flex justify-center mb-40 md:mb-64">
               <div className="relative flex items-center justify-center w-16 h-16">
                <div className="absolute inset-0 bg-gold/25 rounded-full blur-2xl animate-pulse" />
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-gold/70 relative z-10" fill="currentColor">
                  <polygon points="12,0 13.5,9 24,12 13.5,15 12,24 10.5,15 0,12 10.5,9" />
                </svg>
              </div>
            </div>

            {/* Pillar 3 — The Infinite Palette */}
            <div className="mb-40 md:mb-64 group">
              <div className="flex flex-col md:flex-row items-baseline gap-6 md:gap-20 mb-10 md:mb-16">
                <span className="text-6xl md:text-9xl font-serif text-gold/25 font-light italic leading-none">03</span>
                <h3 className="text-4xl md:text-7xl font-serif text-accent uppercase tracking-tight leading-tight">
                  The Infinite <br className="hidden md:block" /> Palette
                </h3>
              </div>
              <div className="md:ml-40 max-w-4xl border-l-2 border-gold/20 pl-8 md:pl-20 py-6">
                <p className="text-xl md:text-4xl text-foreground/80 font-sans leading-relaxed font-medium italic">
                  Refill on the spot from our library of 500+ premium inks. Choose your exact colour today, without the commitment of buying the bottle.
                </p>
                <div className="mt-12 flex items-center gap-6">
                  <span className="text-[12px] md:text-[15px] uppercase tracking-[0.6em] text-gold font-bold">Endless possibilities</span>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-gold/40 to-transparent" />
                </div>
              </div>
            </div>

            {/* Final Call to Action */}
            <div className="flex flex-col items-center py-40">
              <div className="gold-divider mb-16 w-32" />
              <p className="text-3xl md:text-5xl text-accent font-serif mb-20 italic text-center leading-tight">
                Ready for a fresh start <br className="hidden md:block" /> and a fresh colour?
              </p>
              <button className="gold-button scale-150 transform hover:scale-[1.6] transition-all duration-700 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                Book Your Concierge Session
              </button>
            </div>
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
