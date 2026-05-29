import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useOrders, UserData } from "@/context/OrderContext";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

export const ClientGrid = () => {
  const { users, pens, deleteUser, updateUser } = useOrders();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});

  const startEdit = (user: UserData) => {
    setEditingId(user.backendId!);
    setEditForm(user);
  };

  const saveEdit = async () => {
    if (editingId) {
      await updateUser(editingId, editForm);
      setEditingId(null);
      toast.success("User updated successfully.");
    }
  };

  const clients = users.map(user => {
    // Count how many pens this user has (matching by email or name)
    const userPens = pens.filter(p => 
      (user.email && p.ownerEmail === user.email) || 
      (user.name && p.ownerName === user.name)
    ).length;
    return {
      ...user,
      pensCount: userPens,
      initials: user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.length === 0 && (
        <div className="col-span-full text-center py-12 text-ink-green/40">
          No clients registered yet.
        </div>
      )}
      {clients.map((client) => (
        <Card key={client.backendId} className="bg-white/50 backdrop-blur-sm border-ink-green/10 hover:border-gold/50 transition-all group relative overflow-hidden">
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {editingId === client.backendId ? (
              <>
                <button onClick={saveEdit} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
              </>
            ) : (
              <>
                <button onClick={() => startEdit(client)} className="text-ink-green/50 hover:text-ink-green"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => {
                  if(confirm('Are you sure you want to remove this client?')) deleteUser(client.backendId!);
                }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </>
            )}
          </div>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-12 w-12 border-2 border-ink-green/5 transition-colors">
              <AvatarFallback className="bg-ink-green text-parchment font-serif">{client.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 pr-12">
              {editingId === client.backendId ? (
                <>
                  <input className="text-base font-serif text-ink-green border-b border-ink-green/30 bg-transparent focus:outline-none mb-1" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  <input className="text-xs text-ink-green/50 border-b border-ink-green/30 bg-transparent focus:outline-none" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </>
              ) : (
                <>
                  <CardTitle className="text-base font-serif text-ink-green truncate">{client.name}</CardTitle>
                  <p className="text-xs text-ink-green/50 truncate">{client.email}</p>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingId === client.backendId ? (
              <div className="flex flex-col gap-2 mt-2">
                <div className="space-y-1">
                  <label className="text-[8px] uppercase tracking-widest text-ink-green/50">Address</label>
                  <input placeholder="Address" className="w-full text-xs text-ink-green/70 border-b border-ink-green/30 bg-transparent focus:outline-none" value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase tracking-widest text-ink-green/50">Phone</label>
                  <input placeholder="Phone" className="w-full text-xs text-ink-green/70 border-b border-ink-green/30 bg-transparent focus:outline-none" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase tracking-widest text-ink-green/50">Company</label>
                  <input placeholder="Company" className="w-full text-xs text-ink-green/70 border-b border-ink-green/30 bg-transparent focus:outline-none" value={editForm.company || ''} onChange={e => setEditForm({...editForm, company: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase tracking-widest text-ink-green/50">Designation</label>
                  <input placeholder="Designation" className="w-full text-xs text-ink-green/70 border-b border-ink-green/30 bg-transparent focus:outline-none" value={editForm.designation || ''} onChange={e => setEditForm({...editForm, designation: e.target.value})} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2 text-[10px] uppercase tracking-widest font-bold text-ink-green/70">
                <div className="flex justify-between items-center">
                  <span className="text-ink-green/40">Instruments</span>
                  <span>{client.pensCount} Registered</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-green/40">Company</span>
                  <span className="truncate max-w-[150px]">{client.company || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-green/40">Designation</span>
                  <span className="truncate max-w-[150px]">{client.designation || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-ink-green/40">Location</span>
                  <span className="break-words max-w-[200px] leading-relaxed">{client.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-green/40">Phone</span>
                  <span>{client.phone || 'N/A'}</span>
                </div>
                
                {/* User's registered instruments list */}
                <div className="mt-4 pt-3 border-t border-ink-green/10 space-y-2">
                  <span className="text-[8px] text-gold tracking-widest uppercase font-bold">Instrument Portfolio</span>
                  {pens.filter(p => 
                    (client.email && p.ownerEmail === client.email) || 
                    (client.name && p.ownerName === client.name)
                  ).length === 0 ? (
                    <p className="text-[9px] text-ink-green/40 italic font-medium normal-case">No instruments registered in this vault.</p>
                  ) : (
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                      {pens.filter(p => 
                        (client.email && p.ownerEmail === client.email) || 
                        (client.name && p.ownerName === client.name)
                      ).map((p, idx) => (
                        <div key={idx} className="bg-black/5 p-1.5 border border-ink-green/5 text-[9px] font-semibold text-ink-green flex gap-2 items-center normal-case">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={`${p.brand} ${p.model}`} className="w-8 h-8 object-contain bg-white/40 p-0.5 border border-ink-green/10" />
                          ) : (
                            <div className="w-8 h-8 bg-ink-green/5 border border-ink-green/10 flex items-center justify-center text-[7px] text-ink-green/30 uppercase tracking-tighter">No Pic</div>
                          )}
                          <div className="flex-1 flex flex-col truncate">
                            <span className="truncate font-serif font-bold">{p.brand} {p.model}</span>
                            {p.mechanism && <span className="text-[8px] text-gold uppercase tracking-wider">{p.mechanism}</span>}
                          </div>
                          <span className="text-[8px] text-ink-green/60 uppercase font-mono tracking-wider whitespace-nowrap">{p.nib}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
