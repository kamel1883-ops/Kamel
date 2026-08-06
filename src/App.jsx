import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Attendance from "@/pages/Attendance";
import Approvals from "@/pages/Approvals";
import MyRequests from "@/pages/MyRequests";
import Payroll from "@/pages/Payroll";
import SettingsPage from "@/pages/Settings";
import Fleet from "@/pages/Fleet";
import EndOfService from "@/pages/EndOfService";
import Performance from "@/pages/Performance";
import Succession from "@/pages/Succession";
import Analytics from "@/pages/Analytics";
import Licenses from "@/pages/Licenses";
import Landing from "@/pages/Landing";
import OwnerAdmin from "@/pages/OwnerAdmin";
import ImportAttendance from "@/pages/ImportAttendance";
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Public landing page — accessible without login
  if (window.location.pathname === "/") return <Landing />;

  // Render the main app (authenticated)
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/import-attendance" element={<ImportAttendance />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/end-of-service" element={<EndOfService />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/succession" element={<Succession />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/licenses" element={<Licenses />} />
        <Route path="/owner" element={<OwnerAdmin />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App