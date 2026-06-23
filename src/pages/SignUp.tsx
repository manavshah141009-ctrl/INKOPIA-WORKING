import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrders } from '@/context/OrderContext';
import { Loader2 } from 'lucide-react';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from "@/components/ui/input-otp";
import { auth, googleProvider } from "@/lib/firebase";
import { 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import axios from "axios";
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



interface FormData {
  name: string;
  email: string;
  company: string;
  designation: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}


const SignUp = () => {
  const navigate = useNavigate();
  const { addUser } = useOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');

  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    designation: '',
    phone: '',
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const recaptchaRef = useRef<any>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Initialize Recaptcha
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required for verification.';
    
    if (!acceptTerms) {
      toast.error('You must accept the Terms and Policy to continue.');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && acceptTerms;
  };

  const handleDirectSignUp = async () => {
    setIsSubmitting(true);
    try {
      await addUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        designation: form.designation
      });
      
      localStorage.setItem('inkopia_auth', 'true');
      localStorage.setItem('inkopia_user_name', form.name);
      localStorage.setItem('inkopia_user_email', form.email);
      localStorage.setItem('inkopia_user_phone', form.phone);
      toast.success(`Welcome to Inkopia, ${form.name.split(' ')[0]}. (Direct Access granted)`);
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setIsSubmitting(false);
      toast.error('Failed to create account. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required fields correctly.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Trigger Email OTP via backend
      const API_URL = '/api';
      await axios.post(`${API_URL}/auth/send-otp`, { email: form.email });
      
      // 2. Switch to OTP entry step
      setStep('otp');
      toast.success(`Verification code sent to ${form.email}`);
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      toast.error(err.response?.data?.error || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Verify OTP via backend
      const API_URL = '/api';
      await axios.post(`${API_URL}/auth/verify-otp`, { email: form.email, otp });
      
      // If verification successful, proceed to create user
      await addUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        designation: form.designation
      });
      
      setIsSubmitting(false);
      localStorage.setItem('inkopia_auth', 'true');
      localStorage.setItem('inkopia_user_name', form.name);
      localStorage.setItem('inkopia_user_email', form.email);
      toast.success(`Welcome to Inkopia, ${form.name.split(' ')[0]}. Your vault has been created.`);
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.response?.data?.error || 'Verification failed. Please check your code.');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!acceptTerms) {
      toast.error('You must accept the Terms and Policy to continue.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user) {
        const idToken = await user.getIdToken();
        const googleName = user.displayName || 'Google Collector';
        
        // Send secure sync request with Firebase ID Token
        const { data } = await axios.post('/api/auth/sync-user', {
          name: googleName,
          phone: user.phoneNumber || '',
          company: 'N/A',
          designation: 'Collector'
        }, {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });

        setIsSubmitting(false);
        localStorage.setItem('inkopia_auth', 'true');
        localStorage.setItem('inkopia_user_name', googleName);
        localStorage.setItem('inkopia_user_email', user.email || '');

        if (!data.user || !data.user.phone) {
          toast.success(`Google Auth successful. Please complete your profile.`);
          setTimeout(() => navigate('/complete-profile'), 500);
        } else {
          localStorage.setItem('inkopia_user_phone', data.user.phone);
          toast.success(`Welcome to your vault, ${googleName.split(' ')[0]}.`);
          setTimeout(() => navigate('/dashboard'), 700);
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('Google Auth Error:', err);
      toast.error(err.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  const inputClass = `w-full bg-transparent border-b pb-2 pt-1 font-sans text-sm text-ink-green placeholder-ink-green/30 focus:outline-none transition-colors duration-300`;

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center py-24 md:py-32 px-6">
      {/* Decorative borders — matching logo theme */}
      <div className="page-frame" />


      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-3xl border border-ink-green/10 bg-background/60 backdrop-blur-md p-6 md:p-14 shadow-xl rounded-xl mt-12 mb-12">

        {/* Logo — merged with background */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Inkopia"
            className="w-[160px] md:w-[260px] h-auto mb-2"
          />
          <p className="font-serif italic text-ink-green/70 text-sm md:text-base tracking-wide mt-1">
            "The Pen is The Mightiest Sword"
          </p>
        </div>

        {step === 'form' ? (
          <form className="max-w-2xl mx-auto space-y-8" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

              {/* Name */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.2em] text-ink-green font-medium mb-1">
                  Name <span className="text-gold">*</span>
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your full name"
                  className={`${inputClass} ${errors.name ? 'border-[hsl(var(--error))] shake-error' : 'border-ink-green/30 focus:border-gold'}`}
                  required
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="error-message"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.2em] text-ink-green font-medium mb-1">
                  Email <span className="text-gold">*</span>
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  className={`${inputClass} ${errors.email ? 'border-[hsl(var(--error))] shake-error' : 'border-ink-green/30 focus:border-gold'}`}
                  required
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="error-message"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Company Info */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.2em] text-ink-green font-medium mb-1">
                  Company / Estate
                </label>
                <input
                  id="signup-company"
                  type="text"
                  value={form.company}
                  onChange={set('company')}
                  placeholder="Organisation name"
                  className={`${inputClass} border-ink-green/30 focus:border-gold`}
                />
              </div>

              {/* Designation */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.2em] text-ink-green font-medium mb-1">
                  Designation
                </label>
                <input
                  id="signup-designation"
                  type="text"
                  value={form.designation}
                  onChange={set('designation')}
                  placeholder="Your title or role"
                  className={`${inputClass} border-ink-green/30 focus:border-gold`}
                />
              </div>



              {/* Phone No */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-[0.2em] text-ink-green font-medium mb-1">
                  Phone No
                </label>
                <input
                  id="signup-phone"
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

              <div id="recaptcha-container"></div>

            </div>

            <div className="flex items-start gap-3 mt-6 border border-ink-green/20 p-4 bg-ink-green/5 max-w-2xl mx-auto">
              <input 
                type="checkbox" 
                id="acceptTerms" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="acceptTerms" className="text-xs text-ink-green/80 font-sans leading-relaxed cursor-pointer select-none">
                I accept the <Link to="/terms" target="_blank" className="text-gold hover:underline">Terms of Service and Privacy Policy</Link>. I understand that I am commissioning a premium service.
              </label>
            </div>

            <div className="w-full pt-6 flex flex-col items-center gap-4">

              {/* Standard Sign Up Button */}
              <button
                id="signup-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-sm px-8 py-3 text-xs font-sans tracking-[0.3em] uppercase flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed btn-inkopia"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sending OTP…
                  </>
                ) : (
                  'Create Your Vault'
                )}
              </button>

              <div className="flex items-center w-full max-w-sm my-1">
                <div className="flex-1 border-t border-ink-green/20"></div>
                <span className="px-3 text-[9px] uppercase tracking-[0.2em] text-ink-green/60">Or sign in with</span>
                <div className="flex-1 border-t border-ink-green/20"></div>
              </div>

              {/* Google Auth Button */}
              <button
                id="signup-google"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full max-w-sm flex items-center justify-center gap-3 border border-ink-green/30 bg-transparent hover:bg-white/50 text-ink-green px-8 py-3 text-xs font-sans tracking-[0.3em] uppercase transition-all duration-300 shadow-sm rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <Link
                to="/"
                className="mt-8 text-[10px] font-sans tracking-[0.2em] uppercase text-ink-green/50 hover:text-ink-green transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-ink-green after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                Return to Experience
              </Link>
            </div>
          </form>
        ) : (
          <div className="max-w-md mx-auto flex flex-col items-center text-center">
            <h3 className="font-serif font-bold text-2xl text-ink-green mb-2">Verify Your Email</h3>
            <p className="text-xs text-ink-green/70 mb-8 font-medium leading-relaxed">
              Enter the 6-digit verification code sent to <br /> 
              <span className="text-gold font-bold">{form.email}</span>
            </p>
            
            <form onSubmit={handleVerifyOTP} className="flex flex-col items-center gap-10">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                containerClassName="group flex items-center gap-2"
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot 
                      key={index} 
                      index={index}
                      className="w-10 h-12 md:w-12 md:h-14 border border-ink-green/20 bg-white/30 text-ink-green font-serif text-xl focus:border-gold transition-colors"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <button
                type="submit"
                disabled={isSubmitting || otp.length < 6}
                className="w-full px-12 py-3 text-xs font-sans tracking-[0.3em] uppercase flex items-center justify-center gap-2 disabled:opacity-50 btn-inkopia"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm Identity'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep('form')}
                className="text-[9px] uppercase tracking-[0.2em] text-ink-green/50 hover:text-ink-green transition-colors border-b border-transparent hover:border-ink-green"
              >
                Change email address
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default SignUp;
