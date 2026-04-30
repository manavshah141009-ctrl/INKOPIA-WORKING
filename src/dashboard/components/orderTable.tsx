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
import { MoreHorizontal, CheckCircle2, Clock, PlayCircle } from "lucide-react";

export const OrderTable = () => {
  const { orders, updateOrderStatus } = useOrders();

  return (
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
              <TableCell colSpan={11} className="text-center py-8 text-ink-green/50">
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
              <TableCell className="text-sm italic">{order.instrument}</TableCell>
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
