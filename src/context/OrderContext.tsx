import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataApi, schemaApi } from '@/lib/api';
import axios from 'axios';

export interface BookingData {
  id: string;
  clientName: string;
  location: string;
  date: string;
  service: string;
  instrument: string;
  ink?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  paymentMethod?: string;
  bookingTime?: string;
  amount?: number;
  createdAt: string;
  backendId?: string;
}

export interface UserData {
  name: string;
  email: string;
  address: string;
  phone: string;
  company: string;
  designation: string;
  backendId?: string;
}

export interface InkData {
  name: string;
  hex: string;
  backendId?: string;
}

interface OrderContextType {
  orders: BookingData[];
  pens: any[];
  users: UserData[];
  inks: InkData[];
  agents: any[];
  isLoading: boolean;
  addOrder: (order: Omit<BookingData, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateOrderStatus: (id: string, status: BookingData['status']) => Promise<void>;
  addPen: (pen: any) => Promise<void>;
  addUser: (user: UserData) => Promise<void>;
  updateUser: (backendId: string, updates: Partial<UserData>) => Promise<void>;
  deleteUser: (backendId: string) => Promise<void>;
  addInk: (ink: Omit<InkData, 'backendId'>) => Promise<void>;
  deleteInk: (backendId: string) => Promise<void>;
  addAgent: (agent: any) => Promise<void>;
  deleteAgent: (backendId: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<BookingData[]>([]);
  const [pens, setPens] = useState<any[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [inks, setInks] = useState<InkData[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schemaId, setSchemaId] = useState<string | null>(null);
  const [vaultSchemaId, setVaultSchemaId] = useState<string | null>(null);
  const [userSchemaId, setUserSchemaId] = useState<string | null>(null);
  const [inkSchemaId, setInkSchemaId] = useState<string | null>(null);
  const [agentSchemaId, setAgentSchemaId] = useState<string | null>(null);

  useEffect(() => {
    const initOrders = async (retries = 3) => {
      try {
        // 1. Get or create schemas
        const response = await schemaApi.getAll();
        const schemas = response?.data || [];
        
        if (!Array.isArray(schemas)) {
          console.error('Expected schemas array from backend, got:', schemas);
          setIsLoading(false);
          return;
        }
        
        let orderSchema = schemas.find((s: any) => s.collectionName === 'orders');
        if (!orderSchema) {
          try {
            const { data: newSchema } = await schemaApi.create({
              collectionName: 'orders',
              displayName: 'Customer Orders',
              fields: [
                { name: 'id', label: 'Order ID', type: 'text' },
                { name: 'clientName', label: 'Client Name', type: 'text' },
                { name: 'clientPhone', label: 'Phone', type: 'text' },
                { name: 'location', label: 'Location', type: 'text' },
                { name: 'date', label: 'Date', type: 'date' },
                { name: 'service', label: 'Service', type: 'text' },
                { name: 'instrument', label: 'Instrument', type: 'text' },
                { name: 'ink', label: 'Ink', type: 'text' },
                { name: 'status', label: 'Status', type: 'text' },
                { name: 'paymentMethod', label: 'Payment Method', type: 'text' },
                { name: 'bookingTime', label: 'Booking Time', type: 'text' },
                { name: 'amount', label: 'Amount', type: 'number' },
                { name: 'createdAt', label: 'Created At', type: 'date' }
              ]
            });
            orderSchema = newSchema;
          } catch (err) {
            console.error('Failed to create orders schema:', err);
          }
        }
        if (orderSchema?._id) setSchemaId(orderSchema._id);

        let vSchema = schemas.find((s: any) => s.collectionName === 'vault');
        if (!vSchema) {
          try {
            const { data: newSchema } = await schemaApi.create({
              collectionName: 'vault',
              displayName: 'Customer Vault',
              fields: [
                { name: 'brand', label: 'Brand', type: 'text' },
                { name: 'model', label: 'Model', type: 'text' },
                { name: 'nib', label: 'Nib', type: 'text' },
                { name: 'silhouette', label: 'Silhouette', type: 'text' },
                { name: 'imageUrl', label: 'Image URL', type: 'text' },
                { name: 'ownerName', label: 'Owner Name', type: 'text' }
              ]
            });
            vSchema = newSchema;
          } catch (err) {
            console.error('Failed to create vault schema:', err);
          }
        }
        if (vSchema?._id) setVaultSchemaId(vSchema._id);

        let uSchema = schemas.find((s: any) => s.collectionName === 'users');
        if (!uSchema) {
          try {
            const { data: newSchema } = await schemaApi.create({
              collectionName: 'users',
              displayName: 'Registered Users',
              fields: [
                { name: 'name', label: 'Name', type: 'text' },
                { name: 'email', label: 'Email', type: 'text' },
                { name: 'address', label: 'Address', type: 'text' },
                { name: 'phone', label: 'Phone', type: 'text' },
                { name: 'company', label: 'Company', type: 'text' },
                { name: 'designation', label: 'Designation', type: 'text' }
              ]
            });
            uSchema = newSchema;
          } catch (err) {
            console.error('Failed to create users schema:', err);
          }
        }
        if (uSchema?._id) setUserSchemaId(uSchema._id);

        let iSchema = schemas.find((s: any) => s.collectionName === 'inks');
        if (!iSchema) {
          try {
            const { data: newSchema } = await schemaApi.create({
              collectionName: 'inks',
              displayName: 'Available Inks',
              fields: [
                { name: 'name', label: 'Ink Name', type: 'text' },
                { name: 'hex', label: 'Hex Code', type: 'text' }
              ]
            });
            iSchema = newSchema;
          } catch (err) {
            console.error('Failed to create inks schema:', err);
          }
        }
        if (iSchema?._id) setInkSchemaId(iSchema._id);
        
        let aSchema = schemas.find((s: any) => s.collectionName === 'agents');
        if (!aSchema) {
          try {
            const { data: newSchema } = await schemaApi.create({
              collectionName: 'agents',
              displayName: 'Concierge Agents',
              fields: [
                { name: 'name', label: 'Name', type: 'text' },
                { name: 'role', label: 'Role', type: 'text' },
                { name: 'type', label: 'Type', type: 'text' }
              ]
            });
            aSchema = newSchema;
          } catch (err) {
            console.error('Failed to create agents schema:', err);
          }
        }
        if (aSchema?._id) setAgentSchemaId(aSchema._id);

        if (iSchema?._id) {
          const { data: inksData } = await dataApi.getBySchema(iSchema._id);
          if (inksData) {
            setInks(inksData.map((item: any) => ({ ...item.data, backendId: item._id })));
          }
        }

        if (aSchema?._id) {
          const { data: agentsData } = await dataApi.getBySchema(aSchema._id);
          if (agentsData) {
            setAgents(agentsData.map((item: any) => ({ ...item.data, backendId: item._id })));
          }
        }
        
        const isAdmin = localStorage.getItem('inkopia_admin_token') || localStorage.getItem('inkopia_auth_role') === 'admin';
        const userEmail = localStorage.getItem('inkopia_user_email');
        
        try {
          const { data: allOrders } = await axios.get('/api/orders', {
            params: {
              role: isAdmin ? 'admin' : 'user',
              email: userEmail
            }
          });
          
          setOrders(allOrders.map((o: any) => ({
            id: o.order_id,
            clientName: o.customer_name,
            clientEmail: o.customer_email,
            location: o.pickup_address,
            service: o.services,
            instrument: o.notes, // Map notes or other fields as needed
            status: o.status,
            createdAt: o.created_at,
            backendId: o.id,
            conciergeName: o.concierge_name,
            conciergePhone: o.concierge_phone
          })));
        } catch (orderErr) {
          console.error('Failed to fetch orders from custom API:', orderErr);
        }

        if (vSchema?._id) {
          const userName = localStorage.getItem('inkopia_user_name');
          const { data: vaultData } = await dataApi.getBySchema(vSchema._id);
          
          if (vaultData) {
            const allPens = vaultData.map((item: any) => ({ ...item.data, id: item._id }));
            
            // If admin, show all pens. If user, filter by email/name.
            if (isAdmin) {
              setPens(allPens);
            } else {
              const userPens = allPens.filter((pen: any) => {
                return (userEmail && pen.ownerEmail === userEmail) || (userName && pen.ownerName === userName);
              });
              setPens(userPens);
            }
          }
        }

        if (uSchema?._id) {
          const { data: usersData } = await dataApi.getBySchema(uSchema._id);
          if (usersData) {
            const fetchedUsers = usersData.map((item: any) => ({
              ...item.data,
              backendId: item._id
            }));
            setUsers(fetchedUsers);
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch orders from backend:', err);
        if (retries > 0) {
          console.log(`Retrying... (${retries} attempts left)`);
          setTimeout(() => initOrders(retries - 1), 2000);
        } else {
          import('sonner').then(({ toast }) => {
            toast.error('Backend connection failed. Please ensure the backend is reachable.');
          });
          setIsLoading(false);
        }
      }
    };

    initOrders();
    const interval = setInterval(initOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const addOrder = async (orderData: any) => {
    try {
      const { data: savedData } = await axios.post('/api/orders', {
        customer_name: orderData.clientName,
        customer_email: orderData.clientEmail,
        customer_phone: orderData.clientPhone,
        services: orderData.service,
        pickup_address: orderData.location,
        notes: orderData.instrument,
        voucher_code: orderData.voucherCode || orderData.voucher_code,
        base_amount: orderData.baseAmount || orderData.amount || orderData.base_amount
      });
      const o = savedData.order;
      const newOrder = {
        id: o.order_id,
        clientName: o.customer_name,
        clientEmail: o.customer_email,
        location: o.pickup_address,
        service: o.services,
        instrument: o.notes,
        status: o.status,
        createdAt: o.created_at,
        backendId: o.id,
        conciergeName: o.concierge_name,
        conciergePhone: o.concierge_phone,
        amount: o.total_amount ? parseFloat(o.total_amount) : (o.amount || 2500)
      };
      setOrders([ newOrder, ...orders ]);
    } catch (err) {
      console.error('Failed to save order to backend:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: BookingData['status']) => {
    // Left empty or we can add PUT /api/orders/:id later
    const orderToUpdate = orders.find(o => o.id === id);
    if (!orderToUpdate || !orderToUpdate.backendId) return;

    try {
      await axios.put(`/api/orders/${orderToUpdate.backendId}/status`, { status });
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status } : order
      ));
    } catch (err) {
      console.error('Failed to update order status on backend:', err);
    }
  };

  const addPen = async (penData: any) => {
    if (!vaultSchemaId) return;
    try {
      const { data: savedData } = await dataApi.upsert({
        schemaId: vaultSchemaId,
        data: {
          ...penData,
          ownerEmail: localStorage.getItem('inkopia_user_email')
        }
      });
      setPens([...pens, { ...penData, id: savedData._id }]);
    } catch (err: any) {
      console.error('Failed to save pen to vault:', err.response?.data || err.message);
    }
  };

  const addUser = async (userData: UserData) => {
    if (!userSchemaId) {
      import('sonner').then(({ toast }) => toast.error('Backend disconnected. Please refresh the page and try again.'));
      return;
    }
    
    // Check if user already exists by email
    const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    
    try {
      if (existingUser && existingUser.backendId) {
        // Update existing user instead of creating a new one
        await dataApi.upsert({
          schemaId: userSchemaId,
          uniqueId: existingUser.backendId,
          data: userData
        });
        setUsers(prev => prev.map(u => u.backendId === existingUser.backendId ? { ...userData, backendId: existingUser.backendId } : u));
        console.log(`[AUTH] Updated existing user: ${userData.email}`);
      } else {
        // Create new user
        const { data: savedData } = await dataApi.upsert({
          schemaId: userSchemaId,
          data: userData
        });
        setUsers(prev => [...prev, { ...userData, backendId: savedData._id }]);
        console.log(`[AUTH] Created new user: ${userData.email}`);
      }
    } catch (err) {
      console.error('Failed to save user:', err);
      import('sonner').then(({ toast }) => toast.error('Failed to save user data.'));
    }
  };

  const updateUser = async (backendId: string, updates: Partial<UserData>) => {
    if (!userSchemaId) return;
    const existing = users.find(u => u.backendId === backendId);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    try {
      await dataApi.upsert({
        schemaId: userSchemaId,
        uniqueId: backendId,
        data: updated
      });
      setUsers(users.map(u => u.backendId === backendId ? updated : u));
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const deleteUser = async (backendId: string) => {
    if (!userSchemaId) return;
    try {
      await dataApi.delete(backendId);
      setUsers(users.filter(u => u.backendId !== backendId));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const addInk = async (inkData: Omit<InkData, 'backendId'>) => {
    if (!inkSchemaId) return;
    try {
      const { data: savedData } = await dataApi.upsert({
        schemaId: inkSchemaId,
        data: inkData
      });
      setInks(prev => [...prev, { ...inkData, backendId: savedData._id }]);
    } catch (err) {
      console.error('Failed to add ink:', err);
    }
  };

  const deleteInk = async (backendId: string) => {
    if (!inkSchemaId) return;
    try {
      await dataApi.delete(backendId);
      setInks(prev => prev.filter(ink => ink.backendId !== backendId));
    } catch (err) {
      console.error('Failed to delete ink:', err);
    }
  };

  const addAgent = async (agentData: any) => {
    if (!agentSchemaId) return;
    try {
      const { data: savedData } = await dataApi.upsert({
        schemaId: agentSchemaId,
        data: agentData
      });
      setAgents(prev => [...prev, { ...agentData, backendId: savedData._id }]);
    } catch (err) {
      console.error('Failed to add agent:', err);
    }
  };

  const deleteAgent = async (backendId: string) => {
    if (!agentSchemaId) return;
    try {
      await dataApi.delete(backendId);
      setAgents(prev => prev.filter(a => a.backendId !== backendId));
    } catch (err) {
      console.error('Failed to delete agent:', err);
    }
  };

  return (
    <OrderContext.Provider value={{ 
      orders, pens, users, inks, agents, isLoading,
      addOrder, updateOrderStatus, addPen, addUser, updateUser, deleteUser,
      addInk, deleteInk, addAgent, deleteAgent
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
