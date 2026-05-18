import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronRight, Clock, MapPin, Calendar, CheckCircle2, User } from 'lucide-react';

export default function MyOrders() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const isMobile = useIsMobile();
  const userName = localStorage.getItem('inkopia_user_name') || 'Collector';
  
  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'border-gold/40 text-gold bg-gold/5';
      case 'confirmed': return 'border-green-500/40 text-green-500 bg-green-500/5';
      case 'concierge_assigned': return 'border-blue-400/40 text-blue-400 bg-blue-400/5';
      case 'in_progress': return 'border-purple-400/40 text-purple-400 bg-purple-400/5';
      case 'completed': return 'border-zinc-500/40 text-zinc-500 bg-zinc-500/5';
      default: return 'border-gold/40 text-gold bg-gold/5';
    }
  };

  const formatStatus = (status: string) => {
    return (status || 'Pending').replace('_', ' ').toUpperCase();
  };

  return (
    <div className="relative min-h-screen w-full font-sans text-ink-green selection:bg-ink-green selection:text-white">
      <div className="page-frame" />

      {/* Top Navigation */}
      <nav className={`relative z-20 border-b border-ink-green/20 ${isMobile ? 'px-8 py-4' : 'px-12 py-6'} flex justify-between items-center bg-[#D3C2A3]/60 backdrop-blur-md sticky top-0`}>
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center -ml-2">
            <img 
              src="/logo.jpg" 
              alt="Inkopia" 
              className={`${isMobile ? 'h-[36px]' : 'h-[50px]'} w-auto opacity-95 transition-all`} 
              style={{ clipPath: 'inset(15% 10% 18% 10%)' }} 
            />
          </Link>
          <span className="text-[10px] tracking-widest text-ink-green/70 uppercase ml-4 hidden md:inline-block border-l border-ink-green/20 pl-4">Commissions</span>
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/dashboard" className="text-[10px] uppercase tracking-[0.2em] text-ink-green/70 hover:text-ink-green transition-colors font-semibold">
            Private Vault
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <header className="mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-ink-green/70 mb-4">Concierge History</p>
          <h1 className="text-4xl md:text-5xl font-serif text-ink-green leading-tight font-bold">
            Your Orders
          </h1>
        </header>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-ink-green/20 bg-white/20">
              <p className="font-serif italic text-ink-green/70 text-lg mb-2">No past commissions found.</p>
              <Link to="/dashboard" className="text-xs uppercase tracking-widest text-gold hover:text-ink-green transition-colors underline underline-offset-4">
                Request a Service
              </Link>
            </div>
          ) : (
            orders.map((order, idx) => (
              <motion.div 
                key={order.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group border border-ink-green/20 bg-white/40 backdrop-blur-md p-6 md:p-8 hover:border-ink-green/40 transition-colors shadow-sm relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-ink-green/50 font-mono">ID: {order.id}</span>
                    <h3 className="font-serif text-xl font-bold text-ink-green mt-1">{order.service || 'Concierge Ritual'}</h3>
                  </div>
                  <div className={`px-4 py-1.5 border text-[9px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {formatStatus(order.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm border-t border-ink-green/10 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-ink-green/50 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-ink-green/60 font-semibold mb-0.5">Created At</p>
                        <p className="text-ink-green font-medium">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-ink-green/50 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-ink-green/60 font-semibold mb-0.5">Service Location</p>
                        <p className="text-ink-green font-medium max-w-xs">{order.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-ink-green/5 p-4 border border-ink-green/10">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-ink-green/50 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-ink-green/60 font-semibold mb-0.5">Assigned Concierge</p>
                        <p className="text-ink-green font-serif italic text-base">
                          {order.conciergeName || 'Assigning...'}
                        </p>
                        {order.conciergePhone && (
                          <p className="text-xs text-ink-green/80 mt-1 font-mono">{order.conciergePhone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
