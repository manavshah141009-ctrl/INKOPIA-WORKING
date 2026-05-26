'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RequestRitualPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    brand: '',
    model: '',
    nib: '',
    isNewPen: false,
    lastRefilledDate: '',
    pickupAddress: '',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          brand: '',
          model: '',
          nib: '',
          isNewPen: false,
          lastRefilledDate: '',
          pickupAddress: '',
          notes: '',
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#001220] font-serif flex flex-col justify-between selection:bg-[#001220] selection:text-white relative overflow-hidden">
      {/* Editorial Page Borders (Champagne Gold Frame) */}
      <div className="absolute top-0 left-0 w-full h-[6px] bg-[#D4AF37] z-50" />
      <div className="absolute bottom-0 left-0 w-full h-[6px] bg-[#D4AF37] z-50" />
      <div className="absolute top-0 left-0 h-full w-[6px] bg-[#D4AF37] z-50" />
      <div className="absolute top-0 right-0 h-full w-[6px] bg-[#D4AF37] z-50" />

      {/* Header */}
      <header className="px-12 py-12 md:px-24 flex justify-between items-center border-b border-[#001220]/10 z-10">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] font-sans font-bold">Inkopia Experience</span>
          <span className="text-xl tracking-[0.2em] uppercase font-bold text-[#001220] mt-1">Concierge Portal</span>
        </div>
        <span className="text-[10px] tracking-widest text-[#001220]/60 uppercase hidden sm:inline-block font-sans font-semibold">Private & Confidential</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-12 py-20 z-10">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-normal leading-tight text-[#001220]">
            Reserve Your Post-Ritual Care
          </h1>
          <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto my-6" />
          <p className="text-sm font-sans text-[#001220]/60 leading-relaxed font-light">
            Indulge your writing instruments with archival cleaning and refilling. Our Concierge Service delivers immaculate feed flushes and precise calibration directly to your desk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Client Personal Details */}
          <div className="space-y-6">
            <h2 className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] border-b border-[#001220]/10 pb-2">I. Client Identity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#001220]/70">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Sir Arthur Conan"
                  className="bg-white border-b-2 border-[#001220]/20 focus:border-[#D4AF37] px-0 py-2.5 outline-none text-base transition-colors font-serif placeholder:text-[#001220]/30 rounded-none"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#001220]/70">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.customerEmail}
                  onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="e.g. arthur@conan.com"
                  className="bg-white border-b-2 border-[#001220]/20 focus:border-[#D4AF37] px-0 py-2.5 outline-none text-base transition-colors font-serif placeholder:text-[#001220]/30 rounded-none"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#001220]/70">Phone Number</label>
              <input 
                type="tel" 
                required
                value={formData.customerPhone}
                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="bg-white border-b-2 border-[#001220]/20 focus:border-[#D4AF37] px-0 py-2.5 outline-none text-base transition-colors font-serif placeholder:text-[#001220]/30 rounded-none"
              />
            </div>
          </div>

          {/* Instrument Specifications */}
          <div className="space-y-8">
            <h2 className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] border-b border-[#001220]/10 pb-2">II. Instrument Specification</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#001220]/70">Brand</label>
                <input 
                  type="text" 
                  required
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Montblanc"
                  className="bg-white border-b-2 border-[#001220]/20 focus:border-[#D4AF37] px-0 py-2.5 outline-none text-base transition-colors font-serif placeholder:text-[#001220]/30 rounded-none"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#001220]/70">Pen Model</label>
                <input 
                  type="text" 
                  required
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. Meisterstück 149"
                  className="bg-white border-b-2 border-[#001220]/20 focus:border-[#D4AF37] px-0 py-2.5 outline-none text-base transition-colors font-serif placeholder:text-[#001220]/30 rounded-none"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#001220]/70">Nib Size</label>
                <input 
                  type="text" 
                  required
                  value={formData.nib}
                  onChange={e => setFormData({ ...formData, nib: e.target.value })}
                  placeholder="e.g. Medium (M)"
                  className="bg-white border-b-2 border-[#001220]/20 focus:border-[#D4AF37] px-0 py-2.5 outline-none text-base transition-colors font-serif placeholder:text-[#001220]/30 rounded-none"
                />
              </div>
            </div>

            {/* Premium Toggle: Is New Pen */}
            <div className="p-6 border border-[#001220]/10 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold tracking-wide text-[#001220]">Is this a newly acquired instrument?</h4>
                <p className="text-xs font-sans text-[#001220]/50 font-light">
                  A brand new pen requires a gentle custom break-in schedule.
                </p>
              </div>
              
              <div className="flex items-center gap-1 border-2 border-[#001220] p-1 h-10 w-44">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isNewPen: true, lastRefilledDate: '' })}
                  className={`flex-1 h-full text-[10px] font-sans font-bold uppercase tracking-wider transition-colors ${
                    formData.isNewPen ? 'bg-[#001220] text-white' : 'text-[#001220] hover:bg-[#001220]/5'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isNewPen: false })}
                  className={`flex-1 h-full text-[10px] font-sans font-bold uppercase tracking-wider transition-colors ${
                    !formData.isNewPen ? 'bg-[#001220] text-white' : 'text-[#001220] hover:bg-[#001220]/5'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Conditional Transition Picker: lastRefilledDate */}
            <AnimatePresence initial={false}>
              {!formData.isNewPen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-6 border border-[#001220]/10 border-t-0 bg-[#001220]/[0.02] flex flex-col space-y-4">
                    <label className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#001220]/80">
                      When was this instrument last flushed or refilled?
                    </label>
                    <input 
                      type="date"
                      required={!formData.isNewPen}
                      value={formData.lastRefilledDate}
                      onChange={e => setFormData({ ...formData, lastRefilledDate: e.target.value })}
                      className="bg-white border-2 border-[#001220]/20 focus:border-[#D4AF37] px-4 py-2.5 outline-none font-sans text-sm tracking-wider transition-colors rounded-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logistics & Request details */}
          <div className="space-y-6">
            <h2 className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-[#D4AF37] border-b border-[#001220]/10 pb-2">III. Service Details</h2>
            
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#001220]/70">Pickup & Service Address</label>
              <textarea 
                required
                rows={3}
                value={formData.pickupAddress}
                onChange={e => setFormData({ ...formData, pickupAddress: e.target.value })}
                placeholder="Where our specialist will arrive to collect or service your collection"
                className="bg-white border-b-2 border-[#001220]/20 focus:border-[#D4AF37] px-0 py-2.5 outline-none text-base transition-colors font-serif placeholder:text-[#001220]/30 resize-none rounded-none"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-sans font-bold tracking-widest uppercase text-[#001220]/70">Concierge Notes (Optional)</label>
              <textarea 
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Mention any custom specifications, flow adjustments, or signature archival inks requested"
                className="bg-white border-b-2 border-[#001220]/20 focus:border-[#D4AF37] px-0 py-2.5 outline-none text-base transition-colors font-serif placeholder:text-[#001220]/30 resize-none rounded-none"
              />
            </div>
          </div>

          {/* Messages & Submit */}
          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#001220] hover:bg-[#D4AF37] text-white hover:text-[#001220] py-4 text-xs font-sans font-bold uppercase tracking-[0.3em] transition-all cursor-pointer rounded-none disabled:opacity-50 select-none"
            >
              {isSubmitting ? 'Transmitting Request...' : 'Transmit Reservation'}
            </button>

            {/* Notification messages */}
            {submitStatus === 'success' && (
              <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50 text-emerald-800 text-xs font-sans tracking-wide">
                Your reservation has been received. Our Desk Sommelier will verify scheduling details shortly.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 border-l-4 border-rose-500 bg-rose-50 text-rose-800 text-xs font-sans tracking-wide">
                System error encountered. Please verify details or reach out directly to your concierge line.
              </div>
            )}
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="px-12 py-12 md:px-24 border-t border-[#001220]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[#001220]/50 text-[10px] tracking-widest uppercase font-sans font-semibold z-10 bg-white">
        <span>© 2026 Inkopia. The Art of Writing.</span>
        <div className="flex gap-8">
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Safety Rituals</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Archival Catalog</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Concierge Terms</a>
        </div>
      </footer>
    </div>
  );
}
