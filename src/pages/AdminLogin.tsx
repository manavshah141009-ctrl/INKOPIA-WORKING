import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import axios from 'axios';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/admin-login', { username, password });
      if (response.data.success) {
        localStorage.setItem('inkopia_admin_token', response.data.token);
        toast.success("Architect Access Granted");
        navigate('/admin');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Access Denied");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#002B18] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37] blur-[120px]" />
      </div>

      <Card className="w-full max-w-md bg-[#001F11] border-[#D5C8AD]/20 text-[#D5C8AD] shadow-2xl relative z-10">
        <CardHeader className="text-center pb-8 border-b border-[#D5C8AD]/10">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center border border-[#D4AF37] rounded-full">
            <span className="text-[#D4AF37] text-2xl font-serif">I</span>
          </div>
          <CardTitle className="text-2xl font-serif tracking-[0.2em] text-[#D4AF37]">SYSTEM ARCHITECT</CardTitle>
          <p className="text-sm opacity-60 mt-2">Enter credentials to access the command center</p>
        </CardHeader>
        <CardContent className="pt-8 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest opacity-70">Username</label>
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#002B18] border-[#D5C8AD]/20 focus:border-[#D4AF37] text-[#D5C8AD]"
                placeholder="Architect ID"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest opacity-70">Passkey</label>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#002B18] border-[#D5C8AD]/20 focus:border-[#D4AF37] text-[#D5C8AD]"
                placeholder="••••••••"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#D4AF37] hover:bg-[#C5A028] text-[#002B18] font-bold tracking-widest py-6"
              disabled={isLoading}
            >
              {isLoading ? "AUTHENTICATING..." : "GRANT ACCESS"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pt-4 opacity-40 text-[10px] tracking-[0.3em]">
          INKOPIA EXPERIENCE v1.0.4
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
