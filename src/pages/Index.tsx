import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import FountainPen3D from '@/components/FountainPen3D';
import { useSite } from '@/context/SiteContext';


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
      <div className="fixed top-10 right-10 z-50">
        <Link to={isLoggedIn ? "/dashboard" : "/signup"} className="text-[10px] tracking-[0.3em] font-sans uppercase text-ink-green hover:opacity-70 transition-opacity">
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
                className="w-[300px] md:w-[460px] lg:w-[580px] h-auto -mt-4 transition-all"
              />
            </div>
            <p className="text-[10px] md:text-xs tracking-[0.6em] uppercase text-muted-foreground mt-1 font-sans font-light">
              {content.heroSubheading}
            </p>
          </div>

          {/* Scroll to Explore removed per Hero Section Visual Reset */}
        </section>

        {/* The Concierge */}
        <section className="min-h-screen flex items-center px-6 md:px-12 lg:px-20">
          <div
            ref={concierge.ref}
            className={`max-w-md lg:max-w-lg section-fade ${concierge.isVisible ? 'visible' : ''}`}
          >
            <div className={`gold-divider mb-6 ${concierge.isVisible ? 'visible' : ''}`} />
            <p className="text-[10px] tracking-[0.5em] uppercase text-accent font-sans mb-3">
              {content.conciergeTitle}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-foreground leading-[0.95] mb-6">
              {(content.conciergeHeading || "").split('.').map((part, i) => (
                <span key={i}>{part}{i === 0 && part ? '.' : ''}<br /></span>
              ))}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-sans font-light max-w-sm">
              {content.conciergeText}
            </p>
          </div>
        </section>

        {/* The Ritual */}
        <section className="min-h-screen flex items-center justify-end px-6 md:px-12 lg:px-20">
          <div
            ref={ritual.ref}
            className={`max-w-md lg:max-w-lg text-right section-fade ${ritual.isVisible ? 'visible' : ''}`}
          >
            <div className={`gold-divider mb-6 ml-auto ${ritual.isVisible ? 'visible' : ''}`} />
            <p className="text-[10px] tracking-[0.5em] uppercase text-accent font-sans mb-3">
              {content.ritualTitle}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-foreground leading-[0.95] mb-10">
              {(content.ritualHeading || "").split('.').map((part, i) => (
                <span key={i}>{part}{i === 0 && part ? '.' : ''}<br /></span>
              ))}
            </h2>
            <div className="space-y-0">
              {content.ritualItems.map((item, i) => (
                <div key={i} className={`border-t border-gold/30 py-5 ${i === content.ritualItems.length - 1 ? 'border-b border-b-gold/30' : ''} transition-all duration-500`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <h3 className="text-base font-serif font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground font-sans font-light">{item.desc}</p>
                </div>
              ))}
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
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-foreground text-center leading-[0.95] mb-6">
              {(content.commissionHeading || "").split('.').map((part, i) => (
                <span key={i}>{part}{i === 0 && part ? '.' : ''}<br /></span>
              ))}
            </h2>
            <p className="max-w-sm text-center text-sm text-muted-foreground leading-relaxed mb-8 font-sans font-light">
              {content.commissionText}
            </p>
            <div className="mb-10 text-center border-y border-gold/30 py-4 px-8 bg-white/5 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-widest text-gold mb-1 font-bold">Featured Commission</p>
              <p className="font-serif text-lg text-primary">{content.commissionPenBrand} <span className="italic text-muted-foreground">{content.commissionPenName}</span></p>
            </div>
            <button
              onClick={() => {
                navigate(isLoggedIn ? '/dashboard' : '/signup');
              }}
              className="btn-inkopia bg-primary text-primary-foreground px-12 py-4 text-xs font-sans tracking-[0.3em] uppercase relative z-10 inline-block"
            >
              {isLoggedIn ? "Access Your Vault" : "Inquire for Booking"}
            </button>
          </div>
        </section>
      </div>


    </div>
  );
};

export default Index;
