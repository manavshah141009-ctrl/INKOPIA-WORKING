import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Pincode {
  id: number;
  pincode: string;
  region: string;
}

export const PincodeManager = () => {
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newPincode, setNewPincode] = useState('');
  const [newRegion, setNewRegion] = useState('Western');

  const fetchPincodes = async () => {
    try {
      const { data } = await axios.get('/api/pincodes');
      setPincodes(data);
    } catch (err) {
      toast.error('Failed to load serviceable pincodes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPincode.trim() || newPincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode.');
      return;
    }
    setAdding(true);
    try {
      await axios.post('/api/pincodes', {
        pincode: newPincode.trim(),
        region: newRegion
      });
      toast.success('Pincode added successfully.');
      setNewPincode('');
      fetchPincodes();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add pincode.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this pincode?')) return;
    try {
      await axios.delete(`/api/pincodes/${id}`);
      toast.success('Pincode removed successfully.');
      fetchPincodes();
    } catch (err) {
      toast.error('Failed to remove pincode.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="bg-white/50 backdrop-blur-sm border-ink-green/10 rounded-none">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-ink-green">Add Serviceable Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1 w-full">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Mumbai Pincode</label>
              <Input 
                maxLength={6}
                placeholder="400001"
                value={newPincode}
                onChange={e => setNewPincode(e.target.value.replace(/\D/g, ''))}
                className="bg-white/50 border-ink-green/20 rounded-none h-11"
              />
            </div>
            <div className="flex-1 space-y-1 w-full">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Coverage Region</label>
              <select 
                value={newRegion}
                onChange={e => setNewRegion(e.target.value)}
                className="w-full bg-white/50 border border-ink-green/20 h-11 px-3 text-sm focus:outline-none rounded-none text-ink-green"
              >
                <option value="Western">Western Corridor</option>
                <option value="Central">Central (Till Ghatkopar)</option>
                <option value="Town">Town (Till Colaba)</option>
              </select>
            </div>
            <Button 
              type="submit" 
              disabled={adding}
              className="bg-ink-green text-parchment hover:bg-ink-green/90 h-11 px-6 rounded-none text-xs uppercase tracking-widest font-bold w-full md:w-auto"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Zone
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border-ink-green/10 rounded-none">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-ink-green">Serviceable Mumbai Pincodes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-ink-green" /></div>
          ) : pincodes.length === 0 ? (
            <p className="text-xs text-ink-green/50 italic py-4">No serviceable pincodes configured yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-ink-green/15 text-[10px] uppercase tracking-widest font-bold text-ink-green/50">
                    <th className="py-3 px-2">Pincode</th>
                    <th className="py-3 px-2">Region</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pincodes.map(p => (
                    <tr key={p.id} className="border-b border-ink-green/5 hover:bg-ink-green/5 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold">{p.pincode}</td>
                      <td className="py-3 px-2 font-medium">{p.region}</td>
                      <td className="py-3 px-2 text-right">
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
