import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import SignUp from "./pages/SignUp.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import { AdminDashboard } from "./dashboard/AdminDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import DynamicPage from "./pages/DynamicPage.tsx";
import CompleteProfile from "./pages/CompleteProfile.tsx";
import MyOrders from "./pages/MyOrders.tsx";
import { SiteProvider } from "./context/SiteContext";
import { OrderProvider } from "./context/OrderContext";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('inkopia_admin_token');
  if (!token) return <Navigate to="/admin-login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SiteProvider>
        <OrderProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/p/:slug" element={<DynamicPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OrderProvider>
      </SiteProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
