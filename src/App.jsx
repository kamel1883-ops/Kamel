import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "next-themes"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Attendance from "@/pages/Attendance";
import Approvals from "@/pages/Approvals";
import Leaves from "@/pages/Leaves";
import BusinessTrips from "@/pages/BusinessTrips";
import MyRequests from "@/pages/MyRequests";
import OwnerPortal from "@/pages/OwnerPortal";
import ExitInterviews from "@/pages/ExitInterviews";
import Surveys from "@/pages/Surveys";
import Warnings from "@/pages/Warnings";
import Payroll from "@/pages/Payroll";
import Gosi from "@/pages/Gosi";
import SettingsPage from "@/pages/Settings";
import Fleet from "@/pages/Fleet";
import EndOfService from "@/pages/EndOfService";
import Performance from "@/pages/Performance";
import Succession from "@/pages/Succession";
import OrgStructure from "@/pages/OrgStructure";
import WorkforcePlanning from "@/pages/WorkforcePlanning";
import Recruitment from "@/pages/Recruitment";
import Training from "@/pages/Training";
import JobApply from "@/pages/public/JobApply";
import Analytics from "@/pages/Analytics";
import Licenses from "@/pages/Licenses";
import PlatformSubscriptions from "@/pages/PlatformSubscriptions";
import GovIntegrations from "@/pages/GovIntegrations";
import Landing from "@/pages/Landing";
import Discounts from "@/pages/Discounts";
import ImportAttendance from "@/pages/ImportAttendance";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Quote from "@/pages/Quote";
import CompanyLogin from "@/pages/CompanyLogin";
import CompanyForgotPassword from "@/pages/CompanyForgotPassword";
import CompanyRegister from "@/pages/CompanyRegister";
import QiwaMudadPage from "@/pages/landings/QiwaMudadPage";
import WpsMudadPage from "@/pages/landings/WpsMudadPage";
import EosCalculatorPage from "@/pages/landings/EosCalculatorPage";
import ContractsPage from "@/pages/landings/ContractsPage";
import Blog from "@/pages/Blog";
import BlogArticle from "@/pages/BlogArticle";
import CustomerSurveys from "@/pages/CustomerSurveys";
import CustomerSurveyTake from "@/pages/public/CustomerSurveyTake";
import ContractSample from "@/pages/ContractSample";
import HrSystemPage from "@/pages/landings/HrSystemPage";
import PayrollSystemPage from "@/pages/landings/PayrollSystemPage";
import AttendanceSystemPage from "@/pages/landings/AttendanceSystemPage";
import PerformanceSystemPage from "@/pages/landings/PerformanceSystemPage";
import { PortalLangProvider } from "@/lib/portalI18n";

const PUBLIC_PATHS = ["/", "/about", "/contact", "/quote", "/login", "/register", "/forgot-password", "/reset-password", "/company-login", "/company-forgot-password", "/company-register", "/portal", "/owner-portal", "/qiwa-mudad", "/wps-mudad", "/eos-calculator", "/contracts", "/contract-sample", "/hr-system", "/payroll-system", "/attendance-system", "/performance-system"];

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const path = window.location.pathname;
  const isRestricted = user && user.role !== "admin";
  const isPublicPage = PUBLIC_PATHS.includes(path) || path.startsWith("/blog") || path.startsWith("/jobs") || path.startsWith("/c");

  if (!isPublicPage && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError && !isPublicPage) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  if (isRestricted && !isPublicPage) return <Navigate to="/portal" replace />;

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/contract-sample" element={<ContractSample />} />
        <Route path="/hr-system" element={<HrSystemPage />} />
        <Route path="/payroll-system" element={<PayrollSystemPage />} />
        <Route path="/attendance-system" element={<AttendanceSystemPage />} />
        <Route path="/performance-system" element={<PerformanceSystemPage />} />
        <Route path="/company-login" element={<CompanyLogin />} />
        <Route path="/company-forgot-password" element={<CompanyForgotPassword />} />
        <Route path="/company-register" element={<CompanyRegister />} />
        <Route path="/qiwa-mudad" element={<QiwaMudadPage />} />
        <Route path="/wps-mudad" element={<WpsMudadPage />} />
        <Route path="/eos-calculator" element={<EosCalculatorPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/jobs/:id" element={<JobApply />} />
        <Route path="/c/:surveyId" element={<CustomerSurveyTake />} />
        <Route path="/portal" element={<PortalLangProvider><MyRequests /></PortalLangProvider>} />
        <Route path="/owner-portal" element={<OwnerPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Render the main app (authenticated)
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/recruitment" element={<Recruitment />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/import-attendance" element={<ImportAttendance />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/business-trips" element={<BusinessTrips />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/gosi" element={<Gosi />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/end-of-service" element={<EndOfService />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/training" element={<Training />} />
        <Route path="/succession" element={<Succession />} />
        <Route path="/org-structure" element={<OrgStructure />} />
        <Route path="/workforce-planning" element={<WorkforcePlanning />} />
        <Route path="/exit-interviews" element={<ExitInterviews />} />
        <Route path="/surveys" element={<Surveys />} />
        <Route path="/warnings" element={<Warnings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/licenses" element={<Licenses />} />
        <Route path="/platform-subscriptions" element={<PlatformSubscriptions />} />
        <Route path="/gov-integrations" element={<GovIntegrations />} />
        <Route path="/customer-surveys" element={<CustomerSurveys />} />
        <Route path="/discounts" element={<Discounts />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    <AuthProvider>
      <LanguageProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App