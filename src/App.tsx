
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { useEffect } from "react";
import './lib/i18n'; // Import i18n configuration
import { useTranslation } from "react-i18next";

// Auth pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";

// App pages
import Dashboard from "./pages/Dashboard";
import Rentals from "./pages/Rentals";
import NewRental from "./pages/NewRental";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set the language from localStorage or default to 'en'
    const storedLanguage = localStorage.getItem('language') || 'en';
    i18n.changeLanguage(storedLanguage);
  }, [i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* App Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/rentals/new" element={<NewRental />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/customers" element={<Customers />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
