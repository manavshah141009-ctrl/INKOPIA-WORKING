import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: localStorage.getItem('inkopia_user_name') || '',
    phone: '',
    company: '',
    designation: ''
  });
  const [errors, setErrors] = useState<{ phone?: string }>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const newErrors: { phone?: string } = {};
    const phoneDigits = form.phone.replace(/\D/g, '').slice(-10);
    const phoneRegex = /^[6-9]\d{9}$/;
    
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(phoneDigits)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated with Google');
      
      const idToken = await user.getIdToken();
      
      const { data } = await axios.post('/api/auth/update-profile', form, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      
      localStorage.setItem('inkopia_user_name', data.user.name || form.name);
      localStorage.setItem('inkopia_user_phone', data.user.phone || form.phone);
      
      toast.success(`Welcome to your vault, ${data.user.name.split(' ')[0]}.`);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Update Profile Error:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full bg-transparent border-b pb-2 pt-1 font-sans text-sm text-ink-green placeholder-ink-green/30 focus:outline-none transition-colors duration-300`;

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center py-24 md:py-32 px-6">
      <div className="page-frame" />
      <div className="relative z-10 w-full max-w-xl border border-ink-green/10 bg-background/60 backdrop-blur-md p-6 md:p-14 shadow-xl rounded-xl">
        <div className="text-center mb-10 flex flex-col items-center">
          <img src="/logo.png" alt="Inkopia" className="w-[160px] md:w-[220px] h-auto mb-2" />
          <p className="font-serif italic text-ink-green/70 text-sm md:text-base tracking-wide mt-1">
            "Your Concierge Journey Begins Here"
          </p>
          <h2 className="mt-8 font-serif text-2xl text-ink-green font-bold uppercase tracking-widest">Complete Profile</h2>
          <p className="text-xs text-ink-green/60 mt-2">We need a few details to provide a seamless concierge experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-[0.2em] text-ink-green font-medium mb-1">
              Full Name <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Your full name"
              className={`${inputClass} border-ink-green/30 focus:border-gold`}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-[0.2em] text-ink-green font-medium mb-1">
              Phone Number <span className="text-gold">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+91 00000 00000"
              className={`${inputClass} ${errors.phone ? 'border-[hsl(var(--error))] shake-error' : 'border-ink-green/30 focus:border-gold'}`}
              required
            />
            <AnimatePresence>
              {errors.phone && (
                <motion.p 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="error-message"
                >
                  {errors.phone}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-[0.2em] text-ink-green font-medium mb-1">
              Company (Optional)
            </label>
            <input
              type="text"
              value={form.company}
              onChange={set('company')}
              placeholder="Your company name"
              className={`${inputClass} border-ink-green/30 focus:border-gold`}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-[0.2em] text-ink-green font-medium mb-1">
              Designation (Optional)
            </label>
            <input
              type="text"
              value={form.designation}
              onChange={set('designation')}
              placeholder="Your job title"
              className={`${inputClass} border-ink-green/30 focus:border-gold`}
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-3 text-xs font-sans tracking-[0.3em] uppercase flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed btn-inkopia"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </>
              ) : (
                'Enter Private Vault'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
