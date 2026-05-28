import { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Plus, Trash2, Megaphone, Check } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationManager = () => {
  const { notifications, addNotification, deleteNotification, users } = useOrders();
  const [newNotif, setNewNotif] = useState({ title: '', message: '', target: 'all' });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotif.title.trim() || !newNotif.message.trim()) {
      toast.error('Title and message are required.');
      return;
    }
    
    try {
      await addNotification(newNotif);
      setNewNotif({ title: '', message: '', target: 'all' });
      setIsAdding(false);
      toast.success('Broadcast announcement posted successfully');
    } catch (err) {
      toast.error('Failed to post announcement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-serif font-bold text-ink-green">Broadcast Announcements</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-ink-green border border-ink-green/20 px-4 py-2 hover:bg-ink-green hover:text-white transition-all bg-white/20"
        >
          <Plus className="w-3 h-3" />
          {isAdding ? 'Cancel' : 'Post Broadcast'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-6 border border-ink-green/20 bg-white/35 backdrop-blur-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Announcement Title *</label>
              <input 
                required
                type="text" 
                value={newNotif.title} 
                onChange={e => setNewNotif({...newNotif, title: e.target.value})}
                placeholder="e.g. Server Maintenance Notice or Special Offer"
                className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Announcement Content *</label>
              <textarea 
                required
                rows={3}
                value={newNotif.message} 
                onChange={e => setNewNotif({...newNotif, message: e.target.value})}
                placeholder="Write the clear details of your message here..."
                className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-widest text-ink-green/60 mb-1">Target Audience</label>
              <select 
                value={newNotif.target} 
                onChange={e => setNewNotif({...newNotif, target: e.target.value})}
                className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-sm focus:outline-none focus:border-ink-green transition-colors appearance-none cursor-pointer"
              >
                <option value="all" className="bg-[#D5C8AD]">All Users (Global Broadcast)</option>
                {users.map(user => (
                  <option key={user.email} value={user.email} className="bg-[#D5C8AD]">{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-ink-green text-white py-3 text-[10px] uppercase tracking-widest font-bold mt-4 hover:opacity-90 transition-opacity">Post Announcement</button>
        </form>
      )}

      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="p-6 border border-ink-green/10 bg-white/20 flex flex-col md:flex-row items-start md:items-center justify-between group gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 bg-gold/20 text-gold border border-gold/10">
                  Target: {notif.target === 'all' ? 'GLOBAL' : notif.target}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-ink-green/40 font-mono">
                  {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h3 className="text-base font-serif font-bold text-ink-green">{notif.title}</h3>
              <p className="text-xs text-ink-green/75 leading-relaxed">{notif.message}</p>
            </div>
            <button 
              onClick={() => notif.id && deleteNotification(notif.id)}
              className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 self-end md:self-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-12 border border-dashed border-ink-green/20 bg-white/10 text-center">
            <Megaphone className="w-6 h-6 text-ink-green/30 mx-auto mb-2" />
            <p className="text-xs text-ink-green/50 italic font-serif">No announcements posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
