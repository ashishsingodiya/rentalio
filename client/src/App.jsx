import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import BrowsePage from "./pages/BrowsePage";
import Footer from "./components/Footer";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import Header from "./components/Header/Header";
import ShortlistedPage from "./pages/ShortlistedPage";
import OwnerCreateListing from "./pages/owner/OwnerCreateListing";
import OwnerListings from "./pages/owner/OwnerListings";
import OwnerVisits from "./pages/owner/OwnerVisits";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import TenantVisits from "./pages/tenant/TenantVisits";
import TenantMoveIns from "./pages/tenant/TenantMoveIns";
import TenantMoveInDetail from "./pages/tenant/TenantMoveInDetail";
import OwnerMoveIns from "./pages/owner/OwnerMoveIns";
import OwnerMoveInDetail from "./pages/owner/OwnerMoveInDetail";
import TenantSupport from "./pages/tenant/TenantSupport";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminListings from "./pages/admin/AdminListings";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminTicketDetail from "./pages/admin/AdminTicketDetail";

function App() {
  return (
    <>
      <Toaster />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/dashboard" element={<TenantDashboard />} />
        <Route path="/property/:id" element={<PropertyDetailsPage />} />
        <Route path="/shortlisted" element={<ShortlistedPage />} />
        <Route path="/visits" element={<TenantVisits />} />
        <Route path="/move-in" element={<TenantMoveIns />} />
        <Route path="/move-in/:id" element={<TenantMoveInDetail />} />
        <Route path="/support" element={<TenantSupport />} />

        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/create" element={<OwnerCreateListing />} />
        <Route path="/owner/listings" element={<OwnerListings />} />
        <Route path="/owner/visits" element={<OwnerVisits />} />
        <Route path="/owner/move-in" element={<OwnerMoveIns />} />
        <Route path="/owner/move-in/:id" element={<OwnerMoveInDetail />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/tickets/:id" element={<AdminTicketDetail />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
