import { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Plus, Trash2, Droplets } from 'lucide-react';
import { toast } from 'sonner';

export const InkManager = () => {
  const { inks, addInk, deleteInk } = useOrders();
  const [newInk, setNewInk] = useState({ name: '', hex: '#000000' });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInk.name.trim()) return;
    await addInk(newInk);
    setNewInk({ name: '', hex: '#000000' });
    setIsAdding(false);
    toast.success('Ink added successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Ink Management</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-ink-green border border-ink-green/20 px-4 py-2 hover:bg-ink-green hover:text-white transition-all"
        >
          <Plus className="w-3 h-3" />
          {isAdding ? 'Cancel' : 'Add New Ink'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-6 border border-ink-green/20 bg-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Ink Name</label>
              <input 
                required
                type="text" 
                value={newInk.name} 
                onChange={e => setNewInk({...newInk, name: e.target.value})}
                placeholder="e.g. Royal Blue"
                className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Color (Hex)</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={newInk.hex} 
                  onChange={e => setNewInk({...newInk, hex: e.target.value})}
                  className="w-8 h-8 rounded-full border-none cursor-pointer"
                />
                <input 
                  type="text" 
                  value={newInk.hex} 
                  onChange={e => setNewInk({...newInk, hex: e.target.value})}
                  placeholder="#000000"
                  className="flex-1 bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors font-mono"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-ink-green text-white py-2 text-[10px] uppercase tracking-widest font-bold">Add to Collection</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inks.map((ink) => (
          <div key={ink.backendId} className="p-4 border border-ink-green/10 bg-white/20 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: ink.hex }} />
              <div>
                <p className="text-sm font-serif font-bold text-ink-green">{ink.name}</p>
                <p className="text-[9px] uppercase tracking-widest text-ink-green/40 font-mono">{ink.hex}</p>
              </div>
            </div>
            <button 
              onClick={() => ink.backendId && deleteInk(ink.backendId)}
              className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
