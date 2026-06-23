import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOrders } from '@/context/OrderContext';
import { useSite } from '@/context/SiteContext';
import axios from 'axios';

const PEN_SILHOUETTES = [
  { id: 'cigar', name: 'The Cigar Shape', description: 'Classic rounded profile, timeless elegance' },
  { id: 'flat-top', name: 'The Flat Top', description: 'Bold, architectural, commanding presence' },
  { id: 'faceted', name: 'The Faceted', description: 'Geometric precision, Art Deco heritage' },
  { id: 'vintage', name: 'Vintage Heirloom', description: 'Pre-war craftsmanship, storied provenance' },
];

const penPaths: Record<string, JSX.Element> = {
  cigar: (
    <svg viewBox="0 0 40 140" className="w-10 h-32">
      <ellipse cx="20" cy="8" rx="8" ry="4" fill="currentColor" opacity="0.9" />
      <rect x="12" y="8" width="16" height="14" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="10" y="22" width="20" height="70" rx="10" fill="currentColor" opacity="0.9" />
      <rect x="12" y="92" width="16" height="6" fill="currentColor" opacity="0.6" />
      <polygon points="20,140 12,98 28,98" fill="currentColor" opacity="0.85" />
    </svg>
  ),
  'flat-top': (
    <svg viewBox="0 0 40 140" className="w-10 h-32">
      <rect x="11" y="4" width="18" height="6" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="12" y="10" width="16" height="14" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="10" y="24" width="20" height="68" rx="3" fill="currentColor" opacity="0.9" />
      <rect x="12" y="92" width="16" height="6" fill="currentColor" opacity="0.6" />
      <polygon points="20,140 13,98 27,98" fill="currentColor" opacity="0.85" />
    </svg>
  ),
  faceted: (
    <svg viewBox="0 0 40 140" className="w-10 h-32">
      <polygon points="20,4 28,10 28,24 12,24 12,10" fill="currentColor" opacity="0.9" />
      <polygon points="10,24 30,24 30,92 10,92" fill="currentColor" opacity="0.9" />
      <line x1="16" y1="24" x2="16" y2="92" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="24" y1="24" x2="24" y2="92" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <rect x="12" y="92" width="16" height="6" fill="currentColor" opacity="0.6" />
      <polygon points="20,140 13,98 27,98" fill="currentColor" opacity="0.85" />
    </svg>
  ),
  vintage: (
    <svg viewBox="0 0 40 140" className="w-10 h-32">
      <ellipse cx="20" cy="8" rx="7" ry="5" fill="currentColor" opacity="0.9" />
      <rect x="13" y="10" width="14" height="10" rx="3" fill="currentColor" opacity="0.7" />
      <path d="M11,20 Q10,56 14,92 L26,92 Q30,56 29,20 Z" fill="currentColor" opacity="0.9" />
      <ellipse cx="20" cy="92" rx="7" ry="3" fill="currentColor" opacity="0.6" />
      <polygon points="20,140 14,95 26,95" fill="currentColor" opacity="0.85" />
    </svg>
  ),
};

function PenSlot({ pen, onSelect, index }: { pen: typeof PEN_SILHOUETTES[0]; onSelect: () => void; index: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onClick={onSelect}
      className="group relative flex flex-col items-center gap-5 p-4 md:p-6 cursor-pointer focus:outline-none"
    >
      <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[hsl(var(--gold)/0.12)] flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-[hsl(var(--gold)/0.5)] group-hover:-translate-y-4 group-hover:shadow-[0_12px_50px_rgba(212,175,55,0.15)]">
        <div className="text-[#3a3a3a] transition-all duration-500 group-hover:text-[hsl(var(--gold))] group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">
          {penPaths[pen.id]}
        </div>
      </div>
      <div className="text-center">
        <p className="font-serif text-sm text-[hsl(var(--gold)/0.7)] tracking-wide transition-colors duration-300 group-hover:text-[hsl(var(--gold))]">
          {pen.name}
        </p>
        <p className="font-sans text-[9px] text-[#444] tracking-[0.15em] uppercase mt-1.5 transition-colors duration-300 group-hover:text-[#666]">
          {pen.description}
        </p>
      </div>
    </motion.button>
  );
}

interface BookingData {
  clientName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  locationType: 'Residence' | 'Office';
  date: string;
  time: string;
  amount: number;
}

interface BookingErrors {
  clientName?: string;
  location?: string;
  date?: string;
}

function BookingForm({ penType, onClose, onConfirmed }: { penType: string; onClose: () => void; onConfirmed: (data: BookingData) => void }) {
  const { content } = useSite();
  const { brandPricings } = useOrders();
  const [booking, setBooking] = useState<BookingData>(() => ({
    clientName: localStorage.getItem('inkopia_user_name') || '',
    streetAddress: localStorage.getItem('inkopia_user_street') || '',
    city: localStorage.getItem('inkopia_user_city') || '',
    state: localStorage.getItem('inkopia_user_state') || '',
    postalCode: localStorage.getItem('inkopia_user_zip') || '',
    locationType: 'Residence',
    date: '',
    time: '14:00',
    amount: content.servicePrice || 2500,
  }));

  // Pricing state
  const [selectedInk, setSelectedInk] = useState<string>('');
  const [penBrand, setPenBrand] = useState('');
  const [customInkBrand, setCustomInkBrand] = useState('');
  const [inkColor, setInkColor] = useState('');

  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCustomBrand = selectedInk === 'other';
  const selectedPricingTier = brandPricings?.find(p => p.brand === selectedInk);
  const baseAmount = selectedPricingTier ? Number(selectedPricingTier.price) : (content.servicePrice || 2500);
  const gstAmount = Math.round(baseAmount * 0.18 * 100) / 100;
  const totalAmount = (isCustomBrand || !selectedInk) ? 0 : Math.round((baseAmount + gstAmount) * 100) / 100;

  const getInkImage = (brand: string) => {
    if (!brand || brand === 'other') return null;
    const b = brand.toLowerCase();
    if (b.includes('montblanc')) return '/inks/montblanc.png';
    if (b.includes('noodler')) return '/inks/noodlers.png';
    return '/inks/generic.png';
  };

  const validate = (): boolean => {
    const errs: BookingErrors = {};
    if (!booking.clientName.trim()) errs.clientName = 'Please enter your name.';
    if (!booking.streetAddress.trim()) errs.location = 'Please provide a valid address.';
    if (!booking.city.trim() || !booking.postalCode.trim()) errs.location = 'City and Postal Code are required.';
    if (!booking.date) errs.date = 'Please select a preferred date.';
    else {
      const selected = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) errs.date = 'Please select a future date.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSubmitting(false);
    onConfirmed({
      ...booking,
      location: `${booking.streetAddress}, ${booking.city}, ${booking.state} - ${booking.postalCode}`,
      amount: totalAmount,
      baseAmount: (isCustomBrand || !selectedInk) ? 0 : baseAmount,
      instrument: `${penType}${penBrand ? ` - ${penBrand}` : ''}`,
      ink: `${isCustomBrand ? customInkBrand : selectedInk} - ${inkColor}`,
    });
  };

  const inputBase = 'w-full bg-transparent border-b pb-3 pt-1 text-white font-sans text-sm tracking-wide placeholder:text-[#555] focus:outline-none transition-colors duration-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto px-6"
    >
      <div className="w-12 h-px bg-[hsl(var(--gold))] mx-auto mb-8" />
      <p className="text-[10px] tracking-[0.5em] uppercase text-[hsl(var(--gold)/0.6)] font-sans text-center mb-3">
        {penType}
      </p>
      <h2 className="font-serif text-3xl md:text-4xl text-white text-center mb-2 leading-tight">
        Where shall we send<br />your Concierge?
      </h2>
      <p className="text-[#555] text-xs text-center font-sans mb-10">
        We'll arrange a private consultation at your convenience.
      </p>

      {content.acceptingOrders === false ? (
        <div className="text-center space-y-4 p-6 border border-[hsl(var(--gold)/0.2)] bg-[hsl(var(--gold)/0.05)] mb-8">
          <h3 className="text-xl font-serif text-[hsl(var(--gold))]">Currently Unavailable</h3>
          <p className="text-sm font-sans text-white/70">
            We are temporarily not accepting new commission requests at this time. Please check back later.
          </p>
        </div>
      ) : (
      <form className="space-y-8" onSubmit={handleSubmit} noValidate>
        <div>
          <input
            id="vault-name"
            type="text"
            placeholder="Client Name"
            value={booking.clientName}
            onChange={e => setBooking(b => ({ ...b, clientName: e.target.value }))}
            className={`${inputBase} ${errors.clientName ? 'border-red-500/70' : 'border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]'}`}
          />
          {errors.clientName && <p className="text-[9px] text-red-400 mt-1">{errors.clientName}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <input
              id="vault-street"
              type="text"
              placeholder="Street Address / Estate"
              value={booking.streetAddress}
              onChange={e => setBooking(b => ({ ...b, streetAddress: e.target.value }))}
              className={`${inputBase} ${errors.location ? 'border-red-500/70' : 'border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]'}`}
            />
          </div>
          <div>
            <input
              id="vault-city"
              type="text"
              placeholder="City"
              value={booking.city}
              onChange={e => setBooking(b => ({ ...b, city: e.target.value }))}
              className={`${inputBase} ${errors.location ? 'border-red-500/70' : 'border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]'}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              id="vault-state"
              type="text"
              placeholder="State"
              value={booking.state}
              onChange={e => setBooking(b => ({ ...b, state: e.target.value }))}
              className={`${inputBase} border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]`}
            />
            <input
              id="vault-zip"
              type="text"
              placeholder="Pincode"
              value={booking.postalCode}
              onChange={e => setBooking(b => ({ ...b, postalCode: e.target.value }))}
              className={`${inputBase} ${errors.location ? 'border-red-500/70' : 'border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]'}`}
            />
          </div>
          {errors.location && <p className="text-[9px] text-red-400 mt-1 md:col-span-2">{errors.location}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[hsl(var(--gold)/0.6)] mb-2 block">Your Pen Brand & Model</label>
            <input
              type="text"
              placeholder="e.g. Lamy Safari"
              value={penBrand}
              onChange={e => setPenBrand(e.target.value)}
              className={`${inputBase} border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]`}
              required
            />
          </div>
          <div className="relative">
            <label className="text-[9px] uppercase tracking-widest text-[hsl(var(--gold)/0.6)] mb-2 block">Select Master Ink Brand *</label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <select
                  required
                  value={selectedInk}
                  onChange={e => setSelectedInk(e.target.value)}
                  className={`${inputBase} border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))] appearance-none`}
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23D4AF37%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }}
                >
                  <option value="" className="bg-[#0A0A0A] text-white">Select an Ink Brand...</option>
                  {brandPricings?.map((pricing: any) => (
                    <option key={pricing.id} value={pricing.brand} className="bg-[#0A0A0A] text-white">
                      {pricing.brand} (₹{Number(pricing.price).toLocaleString()})
                    </option>
                  ))}
                  <option value="other" className="bg-[#0A0A0A] text-[hsl(var(--gold))] italic">Other / My Brand is Not Listed</option>
                </select>
              </div>
              {getInkImage(selectedInk) && (
                <div className="w-16 h-16 rounded overflow-hidden bg-[#0A0A0A] border border-[hsl(var(--gold)/0.3)] shadow-[0_0_15px_rgba(212,175,55,0.15)] flex-shrink-0 transition-opacity duration-300">
                  <img src={getInkImage(selectedInk)!} alt="Ink preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[hsl(var(--gold)/0.6)] mb-2 block">Specific Ink Name / Color *</label>
            <input
              type="text"
              placeholder="e.g. Kon-Peki, Royal Blue"
              value={inkColor}
              onChange={e => setInkColor(e.target.value)}
              className={`${inputBase} border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]`}
              required
            />
          </div>

          {isCustomBrand && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="text-[9px] uppercase tracking-widest text-[hsl(var(--gold)/0.6)] mb-2 block">Custom Ink Brand *</label>
              <input
                type="text"
                placeholder="e.g. Noodler's"
                value={customInkBrand}
                onChange={e => setCustomInkBrand(e.target.value)}
                className={`${inputBase} border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]`}
                required
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[hsl(var(--gold)/0.6)] mb-2 block">Preferred Date</label>
            <input
              id="vault-date"
              type="date"
              value={booking.date}
              onChange={e => setBooking(b => ({ ...b, date: e.target.value }))}
              className={`${inputBase} ${errors.date ? 'border-red-500/70' : 'border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]'}`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && <p className="text-[9px] text-red-400 mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-widest text-[hsl(var(--gold)/0.6)] mb-2 block">Preferred Time</label>
            <input
              id="vault-time"
              type="time"
              value={booking.time}
              onChange={e => setBooking(b => ({ ...b, time: e.target.value }))}
              className={`${inputBase} border-[hsl(var(--gold)/0.3)] focus:border-[hsl(var(--gold))]`}
            />
          </div>
        </div>
        <div>
          <label className="text-[9px] uppercase tracking-widest text-[hsl(var(--gold)/0.6)] mb-2 block">Location Type</label>
          <div className="flex gap-6 mt-2">
            {(['Residence', 'Office'] as const).map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="locationType"
                  checked={booking.locationType === type}
                  onChange={() => setBooking(b => ({ ...b, locationType: type }))}
                  className="appearance-none w-4 h-4 border border-[hsl(var(--gold)/0.4)] rounded-full checked:bg-[hsl(var(--gold))] checked:border-[hsl(var(--gold))] transition-all"
                />
                <span className="text-[11px] text-white/70 group-hover:text-white transition-colors uppercase tracking-widest font-sans">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {isCustomBrand ? (
          <div className="p-4 border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.05)] text-center space-y-2 mt-4">
            <h4 className="text-[10px] uppercase tracking-widest text-[hsl(var(--gold))] font-bold">Custom Quote Required</h4>
            <p className="text-xs text-white/70 font-sans">
              As you have selected an unlisted brand, our manager will review your instrument details and contact you with a bespoke pricing quote before confirming the service.
            </p>
          </div>
        ) : selectedInk ? (
          <div className="pt-4 border-t border-[hsl(var(--gold)/0.15)] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[9px] uppercase tracking-widest text-white/50">Base Service Fee</span>
              <span className="font-mono text-white/80">₹{baseAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[9px] uppercase tracking-widest text-white/50">GST (18%)</span>
              <span className="font-mono text-white/80">₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[hsl(var(--gold)/0.1)]">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[hsl(var(--gold))]">Total Payable</span>
              <span className="text-xl font-mono text-[hsl(var(--gold))] font-bold">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        ) : null}

        {/* Service Catalogs */}
        <div className="pt-6 mt-6 border-t border-[hsl(var(--gold)/0.15)] flex flex-col gap-4">
          <p className="text-[9px] uppercase tracking-widest text-white/50 text-center">Review our service catalogs</p>
          <div className="flex flex-row justify-center gap-6">
             <a href="/catalogs/EXI1500+GSt.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider text-[hsl(var(--gold))] hover:text-white transition-colors flex items-center gap-1"><span className="underline">Essential (₹1500)</span></a>
             <a href="/catalogs/Exhi2000+gst.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider text-[hsl(var(--gold))] hover:text-white transition-colors flex items-center gap-1"><span className="underline">Premium (₹2000)</span></a>
             <a href="/catalogs/Exhi2500+gst.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider text-[hsl(var(--gold))] hover:text-white transition-colors flex items-center gap-1"><span className="underline">Bespoke (₹2500)</span></a>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 mt-8 bg-[hsl(var(--gold))] text-[#0A0A0A] text-[11px] uppercase tracking-[0.3em] font-sans font-bold hover:bg-white hover:text-[#0A0A0A] transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isCustomBrand ? (
            'Request Custom Quote'
          ) : (
            'Confirm Concierge'
          )}
        </button>
      </form>
      )}
    </motion.div>
  );
}

function ConfirmationScreen({ penType, booking, onClose }: { penType: string; booking: BookingData; onClose: () => void }) {
  const basePrice = booking.baseAmount || 2500;
  const totalAmount = booking.amount;
  
  const gstAmount = Math.round(basePrice * 0.18 * 100) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto px-6 py-12 flex flex-col items-center text-center"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-gradient-to-tr from-[hsl(var(--gold))] to-[#B8860B] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(212,175,55,0.3)]"
      >
        <CheckCircle className="w-12 h-12 text-[#0A0A0A]" />
      </motion.div>
      
      <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-tight tracking-tight">
        Booking Confirmed.
      </h2>
      <p className="text-[12px] tracking-[0.4em] uppercase text-[hsl(var(--gold))] font-sans mb-12 font-bold">
        Your Concierge is being prepared.
      </p>

      <div className="w-full bg-[#111] border border-[hsl(var(--gold)/0.2)] rounded-lg overflow-hidden mb-12 shadow-2xl">
        <div className="bg-[hsl(var(--gold)/0.05)] border-b border-[hsl(var(--gold)/0.1)] p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase tracking-widest text-[#666] mb-2">Service Appointment</p>
              <h3 className="text-2xl font-serif text-white">{booking.locationType} Visit</h3>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] uppercase tracking-widest text-[#666] mb-2">Total Payable (with 18% GST)</p>
              <p className="text-3xl font-serif text-[hsl(var(--gold))]">₹{totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#666] mb-2">Scheduled For</p>
              <p className="text-xl text-white font-serif mb-1">
                {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-2xl font-mono text-[hsl(var(--gold))] font-bold tracking-tighter">
                {booking.time}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#666] mb-2">Destination</p>
              <p className="text-sm text-white/90 leading-relaxed font-sans">{booking.location}</p>
            </div>
          </div>

          <div className="space-y-4 bg-[hsl(var(--gold)/0.03)] p-6 rounded border border-[hsl(var(--gold)/0.05)] text-left">
            <div className="flex justify-between border-b border-[#222] pb-2 text-xs">
              <span className="text-[#666] uppercase tracking-wider text-[9px]">Base Service Fee:</span>
              <span className="text-white/80 font-mono">₹{basePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-[#222] pb-2 text-xs">
              <span className="text-[#666] uppercase tracking-wider text-[9px]">GST (18%):</span>
              <span className="text-white/80 font-mono">₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 text-xs">
              <span className="text-[hsl(var(--gold))] uppercase tracking-wider text-[10px]">Net Payable:</span>
              <span className="text-[hsl(var(--gold))] font-mono">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="pt-2 text-[9px] text-[#555] italic">
              Payment Mode: {booking.paymentMethod}
            </div>
            <div className="text-[9px] text-[#555] italic">
              Assigned Pen: {penType}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-12">
        <p className="text-[11px] text-[#666] font-sans leading-relaxed mb-8">
          A digital signature of this commission has been recorded in your <span className="text-[hsl(var(--gold))]">Inkopia Vault</span>. Our senior concierge will contact you 24 hours prior to arrival to confirm the final coordination.
        </p>
      </div>

      <button
        onClick={onClose}
        className="group relative px-12 py-4 bg-transparent border border-[hsl(var(--gold))] text-[hsl(var(--gold))] text-[11px] uppercase tracking-[0.4em] font-sans overflow-hidden transition-all duration-500 hover:text-[#0A0A0A]"
      >
        <span className="relative z-10">Return to Vault</span>
        <div className="absolute inset-0 bg-[hsl(var(--gold))] translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
      </button>
    </motion.div>
  );
}

export default function VaultOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'confirmed'>('form');
  const [selectedPen] = useState<string>("Masterpiece Concierge");
  const [confirmedBooking, setConfirmedBooking] = useState<BookingData | null>(null);
  const { addOrder } = useOrders();

  const handleClose = () => {
    setStep('form');
    setConfirmedBooking(null);
    onClose();
  };

  const handleConfirmed = (data: BookingData) => {
    setConfirmedBooking(data);
    setStep('confirmed');
    
    addOrder({
      clientName: data.clientName,
      clientEmail: localStorage.getItem('inkopia_user_email') || '',
      clientPhone: localStorage.getItem('inkopia_user_phone') || 'N/A',
      location: data.location,
      date: data.date,
      service: 'Concierge Commission',
      instrument: selectedPen,
      paymentMethod: data.paymentMethod,
      bookingTime: data.time,
      amount: data.amount,
      voucher_code: data.voucherCode,
      base_amount: data.baseAmount
    }).catch(err => console.error('Background order sync failed:', err));

    toast.success('Concierge commissioned successfully.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center overflow-y-auto"
        >
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-[60] text-[#444] hover:text-[hsl(var(--gold))] transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center w-full min-h-screen py-24"
              >
                <BookingForm penType={selectedPen} onClose={handleClose} onConfirmed={handleConfirmed} />
              </motion.div>
            )}

            {step === 'confirmed' && confirmedBooking && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center w-full min-h-screen py-24"
              >
                <ConfirmationScreen penType={selectedPen} booking={confirmedBooking} onClose={handleClose} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
