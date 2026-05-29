import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/context/OrderContext";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle2, Clock, PlayCircle, Trash2, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const OrderTable = () => {
  const { orders, updateOrderStatus, deleteOrder, addOrder } = useOrders();
  const [isAddingOffline, setIsAddingOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offlineBooking, setOfflineBooking] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    date: "",
    bookingTime: "12:00",
    service: "Concierge Commission (Offline)",
    instrument: "",
    ink: "",
    amount: 2500,
    paymentMethod: "Cash on Service"
  });

  const handleAddOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineBooking.clientName.trim() || !offlineBooking.clientPhone.trim() || !offlineBooking.streetAddress.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const fullLocation = `${offlineBooking.streetAddress}, ${offlineBooking.city}, ${offlineBooking.state} - ${offlineBooking.postalCode}`;
      await addOrder({
        clientName: offlineBooking.clientName,
        clientEmail: offlineBooking.clientEmail || "offline@inkopia.in",
        clientPhone: offlineBooking.clientPhone,
        location: fullLocation,
        date: offlineBooking.date,
        bookingTime: offlineBooking.bookingTime,
        service: offlineBooking.service,
        instrument: offlineBooking.instrument || "Offline Fountain Pen",
        ink: offlineBooking.ink || "Not Specified",
        amount: Number(offlineBooking.amount),
        paymentMethod: offlineBooking.paymentMethod,
        baseAmount: Number(offlineBooking.amount)
      });
      toast.success("Offline service added successfully.");
      setIsAddingOffline(false);
      setOfflineBooking({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        streetAddress: "",
        city: "",
        state: "",
        postalCode: "",
        date: "",
        bookingTime: "12:00",
        service: "Concierge Commission (Offline)",
        instrument: "",
        ink: "",
        amount: 2500,
        paymentMethod: "Cash on Service"
      });
    } catch (err) {
      toast.error("Failed to add offline service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this commission? This action is permanent.")) {
      try {
        await deleteOrder(id);
        toast.success("Commission deleted successfully.");
      } catch (err) {
        toast.error("Failed to delete commission.");
      }
    }
  };

  const inputBase = "w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green text-sm placeholder:text-ink-green/40";
  const labelBase = "block text-[9px] font-bold uppercase tracking-widest text-ink-green/70 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold text-ink-green">Concierge Commissions</h2>
        <Button 
          onClick={() => setIsAddingOffline(true)}
          className="bg-ink-green text-[#D5C8AD] flex items-center gap-2 hover:bg-ink-green/90 transition-colors text-[10px] uppercase font-bold tracking-widest px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Offline Commission</span>
        </Button>
      </div>

      <div className="rounded-md border border-ink-green/10 bg-white/50 backdrop-blur-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-ink-green/5">
            <TableRow>
              <TableHead className="font-bold text-ink-green/70">Order ID</TableHead>
              <TableHead className="font-bold text-ink-green/70">Call Received</TableHead>
              <TableHead className="font-bold text-ink-green/70">Client</TableHead>
              <TableHead className="font-bold text-ink-green/70">Phone</TableHead>
              <TableHead className="font-bold text-ink-green/70">Location</TableHead>
              <TableHead className="font-bold text-ink-green/70">Service</TableHead>
              <TableHead className="font-bold text-ink-green/70">Instrument</TableHead>
              <TableHead className="font-bold text-ink-green/70">Payment</TableHead>
              <TableHead className="font-bold text-ink-green/70">Appt. Time</TableHead>
              <TableHead className="font-bold text-ink-green/70">Amount</TableHead>
              <TableHead className="font-bold text-ink-green/70">Status</TableHead>
              <TableHead className="font-bold text-ink-green/70 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-ink-green/50">
                  No orders have been commissioned yet.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-ink-green/5 border-ink-green/5">
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell className="text-[10px] text-ink-green/60">
                  {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </TableCell>
                <TableCell className="font-medium">{order.clientName}</TableCell>
                <TableCell className="text-sm font-mono text-gold">{order.clientPhone || 'N/A'}</TableCell>
                <TableCell className="text-sm max-w-[200px] break-words whitespace-normal">{order.location}</TableCell>
                <TableCell className="text-sm">{order.service}</TableCell>
                <TableCell className="text-sm italic text-ink-green">
                  {order.instrument}
                  {order.ink && <span className="block text-[10px] text-ink-green/50 not-italic">Ink: {order.ink}</span>}
                </TableCell>
                <TableCell className="text-sm">{order.paymentMethod || 'N/A'}</TableCell>
                <TableCell className="text-sm font-mono whitespace-nowrap">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#666] mb-0.5">Scheduled For</p>
                    <p className="text-sm text-ink-green font-bold mb-0.5">
                      {order.date ? new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                    <p className="text-lg font-mono text-gold font-black tracking-tighter">
                      {order.bookingTime || 'N/A'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-bold text-gold">₹{(order.amount || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${order.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${order.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      ${order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                    `}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-ink-green/10">
                      <DropdownMenuItem 
                        onClick={() => updateOrderStatus(order.id, 'Pending')}
                        className="flex items-center gap-2 text-amber-700"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Set as Pending</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateOrderStatus(order.id, 'In Progress')}
                        className="flex items-center gap-2 text-blue-700"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Set as In Progress</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateOrderStatus(order.id, 'Completed')}
                        className="flex items-center gap-2 text-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Complete</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(order.id)}
                        className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Commission</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Offline Modal */}
      <AnimatePresence>
        {isAddingOffline && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#D5C8AD]/85 backdrop-blur-md flex justify-center items-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#D5C8AD] border border-ink-green w-full max-w-lg p-8 relative shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setIsAddingOffline(false)} className="absolute top-6 right-6 text-ink-green/60 hover:text-ink-green transition-colors z-20">✕</button>
              
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.3em] font-bold uppercase text-ink-green/60 mb-2">Manual Entry</p>
                <h3 className="font-serif font-black text-2xl text-ink-green leading-tight">Offline Service Log</h3>
                <p className="text-xs text-ink-green/80 mt-1">Record a concierge commission booked offline or via phone call.</p>
              </div>

              <form onSubmit={handleAddOffline} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>Client Name *</label>
                    <input required type="text" value={offlineBooking.clientName} onChange={e => setOfflineBooking({...offlineBooking, clientName: e.target.value})} placeholder="Vaibhav Shah" className={inputBase} />
                  </div>
                  <div>
                    <label className={labelBase}>Client Phone *</label>
                    <input required type="tel" value={offlineBooking.clientPhone} onChange={e => setOfflineBooking({...offlineBooking, clientPhone: e.target.value})} placeholder="9876543210" className={inputBase} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>Client Email</label>
                    <input type="email" value={offlineBooking.clientEmail} onChange={e => setOfflineBooking({...offlineBooking, clientEmail: e.target.value})} placeholder="client@example.com" className={inputBase} />
                  </div>
                  <div>
                    <label className={labelBase}>Service Type</label>
                    <input type="text" value={offlineBooking.service} onChange={e => setOfflineBooking({...offlineBooking, service: e.target.value})} className={inputBase} />
                  </div>
                </div>

                <div className="space-y-4 border-t border-ink-green/10 pt-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Location Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelBase}>Street Address *</label>
                      <input required type="text" value={offlineBooking.streetAddress} onChange={e => setOfflineBooking({...offlineBooking, streetAddress: e.target.value})} placeholder="Building, Street Name" className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}>City *</label>
                      <input required type="text" value={offlineBooking.city} onChange={e => setOfflineBooking({...offlineBooking, city: e.target.value})} placeholder="Mumbai" className={inputBase} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelBase}>State *</label>
                        <input required type="text" value={offlineBooking.state} onChange={e => setOfflineBooking({...offlineBooking, state: e.target.value})} placeholder="MH" className={inputBase} />
                      </div>
                      <div>
                        <label className={labelBase}>Postal Code *</label>
                        <input required type="text" value={offlineBooking.postalCode} onChange={e => setOfflineBooking({...offlineBooking, postalCode: e.target.value})} placeholder="400001" className={inputBase} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-ink-green/10 pt-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Appointment & Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Date *</label>
                      <input required type="date" value={offlineBooking.date} onChange={e => setOfflineBooking({...offlineBooking, date: e.target.value})} className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}>Time *</label>
                      <input required type="time" value={offlineBooking.bookingTime} onChange={e => setOfflineBooking({...offlineBooking, bookingTime: e.target.value})} className={inputBase} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Fountain Pen Instrument</label>
                      <input type="text" value={offlineBooking.instrument} onChange={e => setOfflineBooking({...offlineBooking, instrument: e.target.value})} placeholder="e.g. Montblanc Meisterstück 149" className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}>Ink Selection</label>
                      <input type="text" value={offlineBooking.ink} onChange={e => setOfflineBooking({...offlineBooking, ink: e.target.value})} placeholder="e.g. Iroshizuku Kon-Peki" className={inputBase} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Amount (₹) *</label>
                      <input required type="number" value={offlineBooking.amount} onChange={e => setOfflineBooking({...offlineBooking, amount: Number(e.target.value)})} className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}>Payment Method</label>
                      <select value={offlineBooking.paymentMethod} onChange={e => setOfflineBooking({...offlineBooking, paymentMethod: e.target.value})} className="w-full bg-transparent border-b border-ink-green/30 pb-1 text-ink-green focus:outline-none focus:border-ink-green text-sm appearance-none cursor-pointer">
                        <option value="Cash on Service" className="bg-[#D5C8AD]">Cash on Service</option>
                        <option value="UPI" className="bg-[#D5C8AD]">UPI</option>
                        <option value="Card" className="bg-[#D5C8AD]">Card / NetBanking</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-ink-green text-[#D5C8AD] py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-ink-green/90 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Offline Service"
                  )}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
