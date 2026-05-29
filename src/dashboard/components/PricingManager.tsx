import { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Plus, Trash2, Tag, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export const PricingManager = () => {
  const { brandPricings, addBrandPricing, updateBrandPricing, deleteBrandPricing } = useOrders();
  const [isAdding, setIsAdding] = useState(false);
  const [newBrand, setNewBrand] = useState({ brand: '', price: 2500 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ brand: '', price: 2500 });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.brand.trim()) return;
    try {
      await addBrandPricing(newBrand);
      setNewBrand({ brand: '', price: 2500 });
      setIsAdding(false);
      toast.success('Pricing tier added');
    } catch (err: any) {
      toast.error('Failed to add tier. Brand might already exist.');
    }
  };

  const handleEdit = (pricing: any) => {
    setEditingId(pricing.id);
    setEditForm({ brand: pricing.brand, price: Number(pricing.price) });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await updateBrandPricing(editingId, editForm);
      setEditingId(null);
      toast.success('Pricing tier updated');
    } catch (err) {
      toast.error('Failed to update tier.');
    }
  };

  const groupedTiers = brandPricings.reduce((acc: Record<number, any[]>, curr: any) => {
    const price = Number(curr.price);
    if (!acc[price]) acc[price] = [];
    acc[price].push(curr);
    return acc;
  }, {});

  // Sort prices ascending
  const sortedPrices = Object.keys(groupedTiers).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Service Price Tiers</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-ink-green border border-ink-green/20 px-4 py-2 hover:bg-ink-green hover:text-white transition-all"
        >
          {isAdding ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isAdding ? 'Close' : 'Create New Tier'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-6 border border-ink-green/20 bg-white/10 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-ink-green mb-2">Create New Pricing Tier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">First Brand Name</label>
              <input 
                required
                type="text" 
                value={newBrand.brand} 
                onChange={e => setNewBrand({...newBrand, brand: e.target.value})}
                placeholder="e.g. Lamy"
                className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Tier Base Price (₹)</label>
              <input 
                required
                type="number" 
                min="0"
                step="0.01"
                value={newBrand.price} 
                onChange={e => setNewBrand({...newBrand, price: parseFloat(e.target.value) || 0})}
                className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors font-mono"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-ink-green text-white py-3 mt-2 text-[10px] uppercase tracking-widest font-bold hover:bg-ink-green/90 transition-colors">Create Tier</button>
        </form>
      )}

      {brandPricings.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-ink-green/30 bg-ink-green/5 text-ink-green">
          <p className="font-serif text-lg mb-2">No Service Tiers Defined</p>
          <p className="text-xs font-sans opacity-70">Create your first pricing tier to start categorized brand pricing.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedPrices.map(price => (
            <div key={price} className="border border-ink-green/15 bg-white/30 overflow-hidden">
              <div className="bg-ink-green text-white px-6 py-3 flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg tracking-wide">
                  Tier: ₹{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-[10px] uppercase tracking-widest opacity-80">{groupedTiers[price].length} Brands</span>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-3 mb-6">
                  {groupedTiers[price].map(pricing => (
                    <div key={pricing.id} className="group relative flex items-center gap-2 bg-[#D5C8AD] border border-ink-green/20 px-3 py-1.5 shadow-sm">
                      {editingId === pricing.id ? (
                        <form onSubmit={handleUpdate} className="flex items-center gap-2">
                          <input 
                            type="text" 
                            autoFocus
                            value={editForm.brand}
                            onChange={e => setEditForm({...editForm, brand: e.target.value})}
                            className="bg-transparent border-b border-ink-green/50 text-sm focus:outline-none w-24"
                            required
                          />
                          <button type="submit" className="text-emerald-700 hover:text-emerald-900"><Save className="w-3 h-3" /></button>
                          <button type="button" onClick={() => setEditingId(null)} className="text-red-700 hover:text-red-900"><X className="w-3 h-3" /></button>
                        </form>
                      ) : (
                        <>
                          <span className="text-sm font-serif font-bold text-ink-green">{pricing.brand}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 border-l border-ink-green/20 pl-2">
                            <button onClick={() => handleEdit(pricing)} className="text-ink-green/60 hover:text-ink-green" title="Edit Brand">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteBrandPricing(pricing.id)} className="text-red-400 hover:text-red-600" title="Remove Brand">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Inline Add Form for this specific tier */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('newBrandName') as HTMLInputElement;
                    if (input.value.trim()) {
                      addBrandPricing({ brand: input.value.trim(), price });
                      input.value = '';
                    }
                  }} 
                  className="flex items-center gap-3 border-t border-ink-green/10 pt-4 mt-2"
                >
                  <input 
                    name="newBrandName"
                    type="text" 
                    placeholder="Type brand name to add to this tier..."
                    className="flex-1 bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green text-ink-green"
                    required
                  />
                  <button type="submit" className="bg-ink-green/10 text-ink-green border border-ink-green/20 px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold hover:bg-ink-green hover:text-white transition-colors">
                    Add Brand
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
