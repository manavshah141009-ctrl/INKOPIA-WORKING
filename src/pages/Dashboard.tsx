import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PenTool, Check, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { InkopiaPenSVG } from '../components/InkopiaPenSVG';
import { useOrders } from '../context/OrderContext';
import { useSite } from '../context/SiteContext';
import { toast } from 'sonner';

/* Corner star SVG component from the theme */
function CornerStar({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,0 18,12 32,16 18,20 16,32 14,20 0,16 14,12" />
      <polygon points="16,4 17.5,14 28,16 17.5,18 16,28 14.5,18 4,16 14.5,14" opacity="0.6" />
    </svg>
  );
}

interface Pen {
  id: string;
  brand: string;
  model: string;
  nib: string;
  silhouette: 'cigar' | 'flat-top' | 'faceted' | 'vintage';
  imageUrl?: string;
}

interface ServiceRequest {
  penId: string;
  serviceType: string;
  date: string;
  location: string;
  status: 'pending' | 'confirmed';
}

const PEN_SILHOUETTES = [
  { id: 'cigar', name: 'Cigar Shape' },
  { id: 'flat-top', name: 'Flat Top' },
  { id: 'faceted', name: 'Faceted' },
  { id: 'vintage', name: 'Vintage' },
] as const;

const PEN_DATABASE: Record<string, Record<string, string[]>> = {
  'Montblanc': {
    'Meisterstück 149': ['Extra Fine - 18k Gold', 'Fine - 18k Gold', 'Medium - 18k Gold', 'Broad - 18k Gold'],
    'StarWalker': ['Fine - 14k Gold', 'Medium - 14k Gold', 'Broad - 14k Gold'],
    'Heritage': ['Fine - 14k Gold', 'Medium - 14k Gold']
  },
  'Visconti': {
    'Homo Sapiens Bronze Age': ['Extra Fine - 23k Palladium', 'Fine - 23k Palladium', 'Medium - 23k Palladium', 'Broad - 23k Palladium'],
    'Divina Elegance': ['Fine - 18k Gold', 'Medium - 18k Gold'],
    'Van Gogh': ['Fine - Steel', 'Medium - Steel', 'Broad - Steel']
  },
  'Pelikan': {
    'Souverän M1000': ['Extra Fine - 18k', 'Fine - 18k', 'Medium - 18k', 'Broad - 18k'],
    'Souverän M800': ['Extra Fine - 18k', 'Fine - 18k', 'Medium - 18k', 'Broad - 18k']
  },
  'Namiki': {
    'Emperor': ['Fine - 18k', 'Medium - 18k', 'Broad - 18k'],
    'Yukari Royale': ['Fine - 18k', 'Medium - 18k']
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { addOrder, orders: backendOrders, pens, addPen, updateOrderStatus, inks } = useOrders();
  const { content } = useSite();
  const userName = localStorage.getItem('inkopia_user_name') || 'Collector';
  const userOrders = backendOrders.filter(order => order.clientName === userName);
  
  // Modals state
  const [isAddingPen, setIsAddingPen] = useState(false);
  const [isBookingService, setIsBookingService] = useState<string | null>(null);
  const [isOrderSuccess, setIsOrderSuccess] = useState<any | null>(null);

  // New pen form state
  const [newPen, setNewPen] = useState<{brand: string, model: string, nib: string, silhouette: Pen['silhouette'], imageUrl?: string}>({ brand: '', model: '', nib: '', silhouette: 'cigar' });

  // Booking form state
  const [booking, setBooking] = useState({ date: '', location: '', time: '', inkName: '', paymentMethod: 'cos', onlinePaymentType: 'upi' });

  const handleAddPen = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPen(newPen);
    setIsAddingPen(false);
    setNewPen({ brand: '', model: '', nib: '', silhouette: 'cigar', imageUrl: undefined });
  };

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBookingService) return;
    
    const pen = pens.find(p => p.id === isBookingService);
    
    const orderData = {
      clientName: userName,
      clientPhone: localStorage.getItem('inkopia_user_phone') || 'N/A',
      location: booking.location,
      date: booking.date,
      bookingTime: booking.time,
      service: 'Aficionado Maintenance Ritual',
      instrument: pen ? `${pen.brand} ${pen.model}` : 'Fountain Pen',
      ink: booking.inkName,
      paymentMethod: booking.paymentMethod === 'cos' ? 'Cash on Service' : `Online (${booking.onlinePaymentType.toUpperCase()})`,
      amount: content.servicePrice || 2500
    };

    try {
      await addOrder(orderData);
      setIsOrderSuccess(orderData);
      setIsBookingService(null);
      setBooking({ date: '', location: '', time: '', inkName: '', paymentMethod: 'cos', onlinePaymentType: 'upi' });
      toast.success('Your Aficionado commission has been dispatched.');
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans text-ink-green selection:bg-ink-green selection:text-white">
      {/* Decorative page frame matching theme */}
      <div className="page-frame" />
      <CornerStar className="corner-star corner-star--tl" />
      <CornerStar className="corner-star corner-star--tr" />
      <CornerStar className="corner-star corner-star--bl" />
      <CornerStar className="corner-star corner-star--br" />

      {/* Top Navigation */}
      <nav className="relative z-20 border-b border-ink-green/20 px-6 md:px-12 py-6 flex justify-between items-center bg-[#D3C2A3]/60 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center -ml-2">
            <img 
              src="/logo.jpg" 
              alt="Inkopia" 
              className="h-[40px] md:h-[50px] w-auto opacity-95 transition-opacity" 
              style={{ clipPath: 'inset(15% 10% 18% 10%)' }} 
            />
          </Link>
          <span className="text-[10px] tracking-widest text-ink-green/70 uppercase ml-4 hidden md:inline-block border-l border-ink-green/20 pl-4">Private Vault</span>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('inkopia_auth');
            localStorage.removeItem('inkopia_user_name');
            navigate('/');
          }}
          className="text-xs uppercase tracking-[0.2em] text-ink-green/70 hover:text-ink-green transition-colors font-medium border-b border-transparent hover:border-ink-green pb-0.5"
        >
          Sign Out
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        
        <header className="mb-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-ink-green/70 mb-4">Welcome back, {userName}</p>
          <h1 className="text-4xl md:text-6xl font-serif text-ink-green leading-tight font-bold">
            Your Personal<br />Instrument Vault.
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Collection Area */}
          <section className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-end border-b border-ink-green/20 pb-4">
              <h2 className="font-serif text-2xl font-bold text-ink-green">The Collection</h2>
              <button 
                onClick={() => setIsAddingPen(true)}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-ink-green/80 hover:text-ink-green transition-colors group font-semibold"
              >
                <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                Add Instrument
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pens.map(pen => (
                <div key={pen.id} className="group flex flex-col p-6 bg-white/30 backdrop-blur-sm border border-ink-green/20 hover:border-ink-green/50 transition-all duration-500 hover:-translate-y-1 shadow-sm">
                  {pen.imageUrl ? (
                    <div className="w-full h-32 mb-6 flex items-center justify-center border-b border-ink-green/10 pb-4">
                      <img src={pen.imageUrl} alt={pen.model} className="max-h-full object-contain filter drop-shadow-md mix-blend-multiply" />
                    </div>
                  ) : null}
                  <div className="flex justify-between items-start mb-6 mt-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-ink-green/70 mb-1 font-semibold">{pen.brand}</p>
                      <h3 className="font-serif font-semibold text-xl text-ink-green transition-colors">{pen.model}</h3>
                    </div>
                    <PenTool className="w-5 h-5 text-ink-green group-hover:text-gold transition-colors" />
                  </div>
                  
                  <div className="space-y-1 mb-8">
                    <p className="text-xs text-ink-green/80 font-medium"><span className="text-ink-green/60 uppercase tracking-widest text-[9px] mr-2">Nib</span> {pen.nib}</p>
                    <p className="text-xs text-ink-green/80 font-medium"><span className="text-ink-green/60 uppercase tracking-widest text-[9px] mr-2">Shape</span> {PEN_SILHOUETTES.find(s => s.id === pen.silhouette)?.name}</p>
                  </div>

                  <button 
                    onClick={() => setIsBookingService(pen.id)}
                    className="mt-auto w-full border border-ink-green/30 text-ink-green py-3 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-ink-green hover:border-ink-green hover:text-[#D5C8AD] transition-all duration-300"
                  >
                    Request Aficionado
                  </button>
                </div>
              ))}

              {pens.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-ink-green/30 bg-white/20 text-center">
                  <PenTool className="w-8 h-8 text-ink-green/50 mb-4" />
                  <p className="text-sm text-ink-green/70 mb-2 font-serif italic">Your vault is currently empty.</p>
                  <button onClick={() => setIsAddingPen(true)} className="text-xs font-semibold text-ink-green hover:text-gold transition-colors underline underline-offset-4">Register your first instrument</button>
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar - Service Requests */}
          <section className="space-y-8">
            <div className="border-b border-ink-green/20 pb-4">
              <h2 className="font-serif text-2xl font-bold text-ink-green">Active Services</h2>
            </div>
            
            <div className="space-y-4">
              {userOrders.length === 0 ? (
                <p className="text-xs text-ink-green/70 font-medium mt-4">No active aficionado requests.</p>
              ) : (
                userOrders.map((order, i) => {
                  return (
                    <div key={i} className="p-5 border border-ink-green/20 bg-white/30 backdrop-blur-sm shadow-sm">
                      <div className="flex flex-col md:items-end gap-2 mb-3">
                        <span className={`text-[10px] uppercase tracking-widest px-3 py-1 border ${
                          order.status === 'Pending' ? 'border-gold/40 text-gold/80' : 
                          order.status === 'In Progress' ? 'border-blue-400/40 text-blue-400/80' :
                          'border-green-500/40 text-green-500/80'
                        }`}>
                          {order.status}
                        </span>
                        {order.status !== 'Completed' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Completed')}
                            className="text-[9px] uppercase tracking-widest text-ink-green/50 hover:text-ink-green transition-colors border-b border-ink-green/20 hover:border-ink-green"
                          >
                            Mark as Serviced
                          </button>
                        )}
                      </div>
                      <p className="font-serif font-semibold text-sm text-ink-green mb-4">{order.instrument}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-ink-green/80 font-medium">
                          <Calendar className="w-3 h-3 text-ink-green/60" />
                          {order.date}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink-green/80 font-medium">
                          <MapPin className="w-3 h-3 text-ink-green/60" />
                          {order.location}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Add Pen Modal */}
      <AnimatePresence>
        {isAddingPen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#D5C8AD]/80 backdrop-blur-md flex justify-center items-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-[#D5C8AD] border border-ink-green w-full max-w-md p-8 relative shadow-2xl"
            >
              <button onClick={() => setIsAddingPen(false)} className="absolute top-6 right-6 text-ink-green/60 hover:text-ink-green transition-colors">✕</button>
              
              <h3 className="font-serif font-bold text-2xl text-ink-green mb-2">Add Instrument</h3>
              <p className="text-xs text-ink-green/70 mb-8 font-medium">Register a pen to your private vault.</p>

              <form onSubmit={handleAddPen} className="space-y-6">
                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest text-ink-green mb-1">Brand / Maker *</label>
                  <select required value={newPen.brand} onChange={e => {
                    setNewPen({...newPen, brand: e.target.value, model: '', nib: ''})
                  }} className="w-full bg-transparent border-b border-ink-green/30 pb-2 text-ink-green focus:outline-none focus:border-ink-green transition-colors appearance-none cursor-pointer">
                    <option value="" disabled>Select a brand</option>
                    {Object.keys(PEN_DATABASE).map(brand => <option key={brand} value={brand} className="bg-[#D5C8AD]">{brand}</option>)}
                  </select>
                </div>

                {newPen.brand && (
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-ink-green mb-1">Model Collection *</label>
                    <select required value={newPen.model} onChange={e => {
                      setNewPen({...newPen, model: e.target.value, nib: ''})
                    }} className="w-full bg-transparent border-b border-ink-green/30 pb-2 text-ink-green focus:outline-none focus:border-ink-green transition-colors appearance-none cursor-pointer">
                      <option value="" disabled>Select a model</option>
                      {Object.keys(PEN_DATABASE[newPen.brand]).map(model => <option key={model} value={model} className="bg-[#D5C8AD]">{model}</option>)}
                    </select>
                  </div>
                )}

                {newPen.model && (
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-widest text-ink-green mb-1">Nib Specification *</label>
                    <select required value={newPen.nib} onChange={e => setNewPen({...newPen, nib: e.target.value})} className="w-full bg-transparent border-b border-ink-green/30 pb-2 text-ink-green focus:outline-none focus:border-ink-green transition-colors appearance-none cursor-pointer">
                      <option value="" disabled>Select a nib</option>
                      {PEN_DATABASE[newPen.brand][newPen.model].map(nib => <option key={nib} value={nib} className="bg-[#D5C8AD]">{nib}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest text-ink-green mb-1">Upload Picture of your sword (Optional)</label>
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setNewPen({...newPen, imageUrl: url});
                    }
                  }} className="w-full text-ink-green text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:uppercase file:tracking-wider file:font-semibold file:bg-ink-green file:text-[#D5C8AD] hover:file:bg-ink-green/90 cursor-pointer" />
                  
                  {newPen.imageUrl && (
                    <div className="mt-4 p-4 border border-ink-green/20 bg-white/30 rounded-sm">
                      <img src={newPen.imageUrl} alt="Pen Preview" className="w-full h-32 object-contain mix-blend-multiply" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-semibold uppercase tracking-widest text-ink-green mb-1">Silhouette Profile (Optional)</label>
                  <select value={newPen.silhouette} onChange={e => setNewPen({...newPen, silhouette: e.target.value as any})} className="w-full bg-transparent border-b border-ink-green/30 pb-2 text-ink-green focus:outline-none focus:border-ink-green transition-colors appearance-none cursor-pointer">
                    {PEN_SILHOUETTES.map(s => <option key={s.id} value={s.id} className="bg-[#D5C8AD]">{s.name}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full mt-8 bg-ink-green text-[#D5C8AD] py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-ink-green/90 transition-colors shadow-md">Register to Vault</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Service Modal */}
      <AnimatePresence>
        {isBookingService && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#D5C8AD]/80 backdrop-blur-md flex justify-center items-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#D5C8AD] border border-ink-green w-full max-w-lg p-0 relative shadow-2xl flex flex-col overflow-hidden"
            >
              <button onClick={() => setIsBookingService(null)} className="absolute top-6 right-6 text-ink-green/60 hover:text-ink-green transition-colors z-20">✕</button>
              
              <div className="flex-1 p-8 pr-12">
                <p className="text-[10px] tracking-[0.3em] font-bold uppercase text-ink-green/60 mb-2">Commission Request</p>
                <h3 className="font-serif font-black text-2xl md:text-3xl text-ink-green mb-2 leading-tight">The<br/>Aficionado<br/>Ritual</h3>
                <p className="text-xs text-ink-green/80 font-medium mb-8 leading-relaxed">
                  Our master specialist will arrive at your premises to meticulously clean, tune, and refill the selected instrument.
                </p>

                <div className="p-4 border border-ink-green/20 bg-white/20 mb-8 backdrop-blur-sm">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-ink-green/60 mb-1">Selected Instrument</p>
                  <p className="font-serif font-bold text-ink-green">{pens.find(p => p.id === isBookingService)?.brand} {pens.find(p => p.id === isBookingService)?.model}</p>
                </div>

                <form onSubmit={handleBookService} className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">Date</label>
                      <input required type="date" value={booking.date} onChange={e => setBooking({...booking, date: e.target.value})} className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">Time</label>
                      <input required type="time" value={booking.time} onChange={e => setBooking({...booking, time: e.target.value})} className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green text-sm" />
                    </div>
                  </div>
                   <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">Estate / Office Address</label>
                    <input required type="text" value={booking.location} onChange={e => setBooking({...booking, location: e.target.value})} placeholder="Full address" className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green text-sm placeholder:text-ink-green/40" />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">Select Master Ink *</label>
                    <select 
                      required 
                      value={booking.inkName} 
                      onChange={e => setBooking({...booking, inkName: e.target.value})} 
                      className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green text-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#D5C8AD]">Choose an ink</option>
                      {inks.map(ink => (
                        <option key={ink.backendId} value={ink.name} className="bg-[#D5C8AD]">
                          {ink.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color selection moved to The Ink Sommelier on the right */}
                  
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-2">Payment Method *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button" 
                        onClick={() => setBooking({...booking, paymentMethod: 'cos'})}
                        className={`py-3 text-[10px] uppercase tracking-widest font-bold border transition-colors ${booking.paymentMethod === 'cos' ? 'border-ink-green bg-ink-green text-[#D5C8AD]' : 'border-ink-green/30 text-ink-green/70 hover:border-ink-green'}`}
                      >
                        Cash on Service
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setBooking({...booking, paymentMethod: 'online'})}
                        className={`py-3 text-[10px] uppercase tracking-widest font-bold border transition-colors ${booking.paymentMethod === 'online' ? 'border-ink-green bg-ink-green text-[#D5C8AD]' : 'border-ink-green/30 text-ink-green/70 hover:border-ink-green'}`}
                      >
                        Pay Online
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {booking.paymentMethod === 'online' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border border-ink-green/20 bg-white/20 mt-2 space-y-4">
                          
                          {/* Online Payment Type Sub-Selector */}
                          <div className="flex gap-2 border-b border-ink-green/20 pb-2">
                            <button type="button" onClick={() => setBooking({...booking, onlinePaymentType: 'upi'})} className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 transition-colors ${booking.onlinePaymentType === 'upi' ? 'bg-ink-green text-[#D5C8AD]' : 'text-ink-green/70 hover:bg-ink-green/10'}`}>UPI</button>
                            <button type="button" onClick={() => setBooking({...booking, onlinePaymentType: 'card'})} className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 transition-colors ${booking.onlinePaymentType === 'card' ? 'bg-ink-green text-[#D5C8AD]' : 'text-ink-green/70 hover:bg-ink-green/10'}`}>Cards</button>
                            <button type="button" onClick={() => setBooking({...booking, onlinePaymentType: 'netbanking'})} className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 transition-colors ${booking.onlinePaymentType === 'netbanking' ? 'bg-ink-green text-[#D5C8AD]' : 'text-ink-green/70 hover:bg-ink-green/10'}`}>Net Banking</button>
                          </div>

                          {/* Dynamic Payment Fields */}
                          {booking.onlinePaymentType === 'upi' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                               <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">Enter UPI ID (VPA)</label>
                               <input type="text" placeholder="example@okhdfcbank" className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green text-sm placeholder:text-ink-green/40" />
                               <p className="text-[8px] text-ink-green/50 mt-2">A payment request will be sent to your connected UPI App.</p>
                            </motion.div>
                          )}

                          {booking.onlinePaymentType === 'card' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <div className="mb-4">
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">Cardholder Name</label>
                                <input type="text" placeholder="John Doe" className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green text-sm" />
                              </div>
                              <div className="mb-4">
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">Card Number</label>
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green font-mono text-sm" />
                              </div>
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">Expiry Date</label>
                                  <input type="text" placeholder="MM/YY" className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green font-mono text-sm" />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">CVV</label>
                                  <input type="password" placeholder="***" className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green font-mono text-sm" />
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {booking.onlinePaymentType === 'netbanking' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                               <label className="block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1">Select Bank</label>
                               <select className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green text-sm appearance-none cursor-pointer">
                                 <option value="" disabled>Choose your bank</option>
                                 <option value="sbi" className="bg-[#D5C8AD]">State Bank of India</option>
                                 <option value="hdfc" className="bg-[#D5C8AD]">HDFC Bank</option>
                                 <option value="icici" className="bg-[#D5C8AD]">ICICI Bank</option>
                                 <option value="axis" className="bg-[#D5C8AD]">Axis Bank</option>
                                 <option value="kotak" className="bg-[#D5C8AD]">Kotak Mahindra</option>
                               </select>
                            </motion.div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button type="submit" className="w-full !mt-10 bg-ink-green text-[#D5C8AD] py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-ink-green/90 transition-colors shadow-md flex items-center justify-center gap-2">
                    Confirm Commission <ChevronRight className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Admin Access */}
      <Link to="/admin" className="fixed bottom-2 right-2 w-1 h-1 bg-ink-green/5 hover:bg-ink-green/20 transition-colors cursor-default rounded-full z-[100]" title="System" aria-label="Admin" />

      {/* Success Overlay */}
      <AnimatePresence>
        {isOrderSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#004225] flex justify-center items-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-md w-full"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[#D5C8AD] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Check className="w-10 h-10 md:w-12 md:h-12 text-[#004225]" />
              </div>
              
              <h2 className="font-serif text-3xl md:text-4xl text-[#D5C8AD] mb-4 font-black uppercase tracking-tight">
                Commission<br/>Confirmed
              </h2>
              
              <div className="bg-white/5 backdrop-blur-sm border border-[#D5C8AD]/20 p-6 mb-8 text-left">
                <p className="text-[10px] uppercase tracking-widest text-[#D5C8AD]/60 mb-4 border-b border-[#D5C8AD]/10 pb-2">Appointment Details</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase tracking-widest text-[#D5C8AD]/50">Aficionado Arrival</span>
                    <span className="text-sm font-serif text-[#D5C8AD] font-bold">
                      {isOrderSuccess.date ? new Date(isOrderSuccess.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Scheduled'} at {isOrderSuccess.bookingTime || '11:30 AM'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-widest text-[#D5C8AD]/50">Payable Amount</span>
                    <span className="text-xl font-mono text-white font-black">₹{(isOrderSuccess.amount || 2500).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-4 mb-8 border-l-2 border-[#D5C8AD]">
                <p className="text-[8px] uppercase tracking-widest text-[#D5C8AD]/40 mb-1">Service Location</p>
                <p className="text-[10px] text-[#D5C8AD] truncate">{isOrderSuccess.location}</p>
              </div>

              <p className="text-xs text-[#D5C8AD]/60 mb-10 leading-relaxed font-medium">
                Our specialist is preparing the ritual kits. You will receive a secure notification when they depart for your location.
              </p>

              <button 
                onClick={() => setIsOrderSuccess(null)}
                className="w-full py-4 bg-[#D5C8AD] text-[#004225] text-xs font-bold uppercase tracking-[0.3em] hover:bg-white transition-colors shadow-xl"
              >
                Return to Vault
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
