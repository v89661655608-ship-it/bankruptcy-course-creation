
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Oferta from "./pages/Oferta";
import Privacy from "./pages/Privacy";
import PersonalDataConsent from "./pages/PersonalDataConsent";
import Requisites from "./pages/Requisites";
import Payment from "./pages/Payment";
import PaymentForm from "./pages/PaymentForm";
import PaymentSuccess from "./pages/PaymentSuccess";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminResendToken from "./pages/AdminResendToken";
import ChatAccess from "./pages/ChatAccess";
import Support from "./pages/Support";
import AdminSupport from "./pages/AdminSupport";
import DocumentConstructor from "./pages/DocumentConstructor";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-resend-token" element={<AdminResendToken />} />
            <Route path="/chat-access" element={<ChatAccess />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin-support" element={<AdminSupport />} />
            <Route path="/document-constructor" element={<DocumentConstructor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/oferta" element={<Oferta />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/personal-data-consent" element={<PersonalDataConsent />} />
            <Route path="/requisites" element={<Requisites />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-form" element={<PaymentForm />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;