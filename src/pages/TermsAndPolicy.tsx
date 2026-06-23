import { Link } from 'react-router-dom';

const TermsAndPolicy = () => {
  return (
    <div className="relative w-full min-h-screen bg-background text-foreground selection:bg-accent selection:text-white font-sans py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto border border-[hsl(var(--gold)/0.15)] bg-background/60 backdrop-blur-md p-8 md:p-16 relative">
        <h1 className="text-3xl md:text-5xl font-serif text-accent mb-8">Terms of Service & Privacy Policy</h1>
        
        <div className="space-y-8 text-sm md:text-base text-foreground/80 font-light leading-relaxed">
          <section>
            <h2 className="text-xl font-serif text-accent mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Inkopia's services, you agree to be bound by these Terms of Service. Our concierge services are subject to availability and scheduling constraints.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-accent mb-4">2. Service Disclaimers</h2>
            <p>While our master specialists exercise the utmost care during the cleaning and refilling rituals, Inkopia shall not be held liable for pre-existing micro-fractures, structural weaknesses, or inherent flaws in vintage or specialty instruments.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-accent mb-4">3. Privacy & Data Collection</h2>
            <p>We collect your name, contact information, and service history strictly for the purpose of maintaining your Private Vault and dispatching our concierges. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-accent mb-4">4. Cancellations & Modifications</h2>
            <p>Commissions may be modified or canceled up to 24 hours prior to the scheduled concierge visit. Late cancellations may incur a nominal scheduling fee.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[hsl(var(--gold)/0.15)]">
          <Link to="/" className="text-xs uppercase tracking-widest text-accent hover:text-foreground transition-colors font-bold">
            ← Return to Experience
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPolicy;
