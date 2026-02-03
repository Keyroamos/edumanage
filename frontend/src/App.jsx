import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';

const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const SuperuserRoute = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.is_superuser && user.role !== 'admin') {
    // Redirect non-superusers based on their role
    if (user.role === 'teacher' && user.teacher_id) {
      return <Navigate to={`/teacher/${user.teacher_id}`} replace />;
    }
    if (user.role === 'student' && user.student_id) {
      return <Navigate to={`/student/${user.student_id}`} replace />;
    }
    if (user.role === 'driver') {
      return <Navigate to="/driver-portal/dashboard" replace />;
    }
    if (user.role === 'staff' || user.role === 'accountant') {
      return <Navigate to="/finance-portal/dashboard" replace />;
    }
    if (user.role === 'food manager') {
      return <Navigate to="/food-portal/dashboard" replace />;
    }
    if (user.role === 'transport manager') {
      return <Navigate to="/transport-portal/dashboard" replace />;
    }
    // Default: redirect to login with error
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const StrictSuperuserRoute = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.is_superuser) {
    return <Navigate to="/super-login" replace />;
  }
  return <Outlet />;
};

import RestrictedAccess from './components/RestrictedAccess';

const FeatureRoute = ({ feature, requiredPlan, children }) => {
  const { hasFeature, loading } = useSchool();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hasFeature(feature)) {
    return <RestrictedAccess feature={feature.replace('_', ' ').toLowerCase()} requiredPlan={requiredPlan} />;
  }

  return children || <Outlet />;
};

// Loading Spinner Component
// Loading Spinner Component
const LoadingSpinner = () => null;

// Lazy Loaded Components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Students = React.lazy(() => import('./pages/Students'));
const StudentCreate = React.lazy(() => import('./pages/StudentCreate'));
const StudentEdit = React.lazy(() => import('./pages/StudentEdit'));
const StudentDetail = React.lazy(() => import('./pages/StudentDetail'));
const Teachers = React.lazy(() => import('./pages/Teachers'));
const TeacherCreate = React.lazy(() => import('./pages/TeacherCreate'));
const TeacherDetail = React.lazy(() => import('./pages/TeacherDetail'));
const TeacherScheduleManage = React.lazy(() => import('./pages/TeacherScheduleManage'));
const Finance = React.lazy(() => import('./pages/Finance'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const PaymentRecord = React.lazy(() => import('./pages/PaymentRecord'));
const Schedule = React.lazy(() => import('./pages/Schedule'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Academics = React.lazy(() => import('./pages/Academics'));
const StudentAcademicReport = React.lazy(() => import('./pages/StudentAcademicReport'));
const HRStaff = React.lazy(() => import('./pages/HRStaff'));
const StaffDetail = React.lazy(() => import('./pages/StaffDetail'));
const StaffCreate = React.lazy(() => import('./pages/StaffCreate'));
const StaffEdit = React.lazy(() => import('./pages/StaffEdit'));
const HRApprovals = React.lazy(() => import('./pages/HRApprovals'));
const Supervisors = React.lazy(() => import('./pages/Supervisors'));
const AcademicManagement = React.lazy(() => import('./pages/AcademicManagement'));
const Communication = React.lazy(() => import('./pages/Communication'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));

// New Finance Portal Pages
const FinanceLayout = React.lazy(() => import('./components/layout/FinanceLayout'));
const FinancePortalDashboard = React.lazy(() => import('./pages/finance/FinanceDashboard'));
const FinancePortalAccounts = React.lazy(() => import('./pages/finance/FinanceStudentList'));
const FinancePortalStudentDetail = React.lazy(() => import('./pages/finance/FinanceStudentDetail'));
const FinancePortalTransactionDetail = React.lazy(() => import('./pages/finance/FinanceTransactionDetail'));
const FinancePortalTransactions = React.lazy(() => import('./pages/finance/FinanceTransactionList'));
const FinancePortalReports = React.lazy(() => import('./pages/finance/FinanceReports'));
const FoodLayout = React.lazy(() => import('./components/layout/FoodLayout'));
const FoodDashboard = React.lazy(() => import('./pages/food/FoodDashboard'));
const FoodStudentList = React.lazy(() => import('./pages/food/FoodStudentList'));
const FoodStudentDetail = React.lazy(() => import('./pages/food/FoodStudentDetail'));
const FoodMealOptions = React.lazy(() => import('./pages/food/FoodMealOptions'));
const FoodServingList = React.lazy(() => import('./pages/food/FoodServingList'));

// Transport Portal Pages
const TransportLayout = React.lazy(() => import('./components/layout/TransportLayout'));
const TransportDashboard = React.lazy(() => import('./pages/transport/TransportDashboard'));
const TransportStudentList = React.lazy(() => import('./pages/transport/TransportStudentList'));
const TransportStudentDetail = React.lazy(() => import('./pages/transport/TransportStudentDetail'));
const TransportRoutes = React.lazy(() => import('./pages/transport/TransportRoutes'));
const TransportRouteDetail = React.lazy(() => import('./pages/transport/TransportRouteDetail'));
const TransportVehicles = React.lazy(() => import('./pages/transport/TransportVehicles'));
const TransportVehicleDetail = React.lazy(() => import('./pages/transport/TransportVehicleDetail'));
const TransportDrivers = React.lazy(() => import('./pages/transport/TransportDrivers'));
const TransportDriverDetail = React.lazy(() => import('./pages/transport/TransportDriverDetail'));
const DriverLayout = React.lazy(() => import('./components/layout/DriverLayout'));
const DriverLogin = React.lazy(() => import('./pages/driver/DriverLogin'));
const DriverDashboard = React.lazy(() => import('./pages/driver/DriverDashboard'));
const DriverExpenses = React.lazy(() => import('./pages/driver/DriverExpenses'));
const DriverProfile = React.lazy(() => import('./pages/driver/DriverProfile'));

// Teacher Portal
const TeacherLogin = React.lazy(() => import('./pages/teacher/TeacherLogin'));
const FinanceLogin = React.lazy(() => import('./pages/finance/FinanceLogin'));
const FoodLogin = React.lazy(() => import('./pages/food/FoodLogin'));
const TransportLogin = React.lazy(() => import('./pages/transport/TransportLogin'));
const TeacherLayout = React.lazy(() => import('./components/layout/TeacherLayout'));
const TeacherProfile = React.lazy(() => import('./pages/teacher/TeacherProfile'));
const TeacherClasses = React.lazy(() => import('./pages/teacher/TeacherClasses'));
const TeacherAttendance = React.lazy(() => import('./pages/teacher/TeacherAttendance'));
const TeacherSchedule = React.lazy(() => import('./pages/teacher/TeacherSchedule'));
const TeacherStudentDetail = React.lazy(() => import('./pages/teacher/TeacherStudentDetail'));
const TeacherAcademics = React.lazy(() => import('./pages/teacher/TeacherAcademics'));
const TeacherRequests = React.lazy(() => import('./pages/teacher/TeacherRequests'));

const Salaries = React.lazy(() => import('./pages/finance/Salaries'));
const FoodFinance = React.lazy(() => import('./pages/finance/FoodFinance'));
const TransportFinance = React.lazy(() => import('./pages/finance/TransportFinance'));
const FinanceExpenses = React.lazy(() => import('./pages/finance/FinanceExpenses'));

import { SchoolProvider, useSchool } from './context/SchoolContext';

// SaaS Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const SchoolSignup = React.lazy(() => import('./pages/SchoolSignup'));
const SchoolLogin = React.lazy(() => import('./pages/SchoolLogin'));
const LegalPage = React.lazy(() => import('./pages/LegalPage'));

// Portal Router
const PortalRouter = React.lazy(() => import('./components/PortalRouter'));

// Student Portal
const StudentLogin = React.lazy(() => import('./pages/student/StudentLogin'));
const SuperAdminPortal = React.lazy(() => import('./pages/SuperAdminPortal'));
const SystemPortals = React.lazy(() => import('./pages/SystemPortals'));
const PlatformHealth = React.lazy(() => import('./pages/PlatformHealth'));
const SuperAdminSubscriptions = React.lazy(() => import('./pages/SuperAdminSubscriptions'));
const SuperAdminSettings = React.lazy(() => import('./pages/SuperAdminSettings'));
const SuperAdminDashboard = React.lazy(() => import('./pages/SuperAdminDashboard'));
const SuperAdminLogin = React.lazy(() => import('./pages/SuperAdminLogin'));
const SuperAdminLayout = React.lazy(() => import('./components/layout/SuperAdminLayout'));
import { Toaster } from 'react-hot-toast';
import { AppStatusProvider, useAppStatus } from './context/AppStatusContext';
import MaintenancePage from './pages/MaintenancePage';

const AppInsideRouter = ({ children }) => {
  const { config } = useSchool();
  const { maintenance_mode, loading: statusLoading } = useAppStatus();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (config?.school_name) {
      document.title = `${config.school_name} | EduManage`;
    }
  }, [config]);

  // If maintenance mode is ON, and user is NOT a superuser, show maintenance page
  // IMPORTANT: We must allow Super Admins to bypass this to turn it off!
  if (!statusLoading && maintenance_mode && (!user || !user.is_superuser)) {
    return <MaintenancePage />;
  }

  return children;
};

function App() {
  // Initialize theme on app load - Forcing LIGHT mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <AppStatusProvider>
      <SchoolProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <AppInsideRouter>
            <React.Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/signup" element={<SchoolSignup />} />
                <Route path="/login" element={<SchoolLogin />} />
                <Route path="/super-login" element={<SuperAdminLogin />} />
                <Route path="/legal/:type" element={<LegalPage />} />

                <Route path="/driver-login" element={<DriverLogin />} />
                <Route path="/teacher-login" element={<TeacherLogin />} />
                <Route path="/finance-login" element={<FinanceLogin />} />
                <Route path="/food-login" element={<FoodLogin />} />
                <Route path="/transport-login" element={<TransportLogin />} />
                <Route path="/student-login" element={<StudentLogin />} />

                {/* Portal Access Routes - School-specific portals */}
                <Route path="/portal/:slug/:role" element={<PortalRouter />} />

                {/* Protected Admin Area - Superuser Only */}
                <Route element={<SuperuserRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/students/template" element={<Navigate to="/students" replace />} />
                    <Route path="/students/create" element={<StudentCreate />} />
                    <Route path="/students/:id" element={<StudentDetail />} />
                    <Route path="/students/:id/edit" element={<StudentEdit />} />
                    <Route path="/teachers" element={<Teachers />} />
                    <Route path="/teachers/create" element={<TeacherCreate />} />
                    <Route path="/teachers/:id" element={<TeacherDetail />} />
                    <Route path="/teachers/:id/schedule" element={<TeacherScheduleManage />} />

                    {/* Standard+ Features */}
                    <Route element={<FeatureRoute feature="FINANCE_MANAGEMENT" requiredPlan="Standard" />}>
                      <Route path="/finance" element={<Finance />} />
                      <Route path="/finance/transactions" element={<Transactions />} />
                      <Route path="/finance/record" element={<PaymentRecord />} />
                      <Route path="/finance/transport-expenses" element={<TransportFinance />} />
                      <Route path="/finance/salaries" element={<Salaries />} />
                    </Route>

                    <Route element={<FeatureRoute feature="SCHEDULE" requiredPlan="Basic" />}>
                      <Route path="/schedule" element={<Schedule />} />
                    </Route>

                    <Route element={<FeatureRoute feature="ACADEMIC_MANAGEMENT" requiredPlan="Basic" />}>
                      <Route path="/academics" element={<Academics />} />
                      <Route path="/academic-management" element={<AcademicManagement />} />
                    </Route>

                    <Route element={<FeatureRoute feature="HR_MANAGEMENT" requiredPlan="Standard" />}>
                      <Route path="/hr/staff" element={<HRStaff />} />
                      <Route path="/hr/staff/create" element={<StaffCreate />} />
                      <Route path="/hr/staff/:id/edit" element={<StaffEdit />} />
                      <Route path="/hr/staff/:id" element={<StaffDetail />} />
                      <Route path="/hr/approvals" element={<HRApprovals />} />
                      <Route path="/hr/supervisors" element={<Supervisors />} />
                    </Route>

                    <Route element={<FeatureRoute feature="COMMUNICATION" requiredPlan="Standard" />}>
                      <Route path="/communication" element={<Communication />} />
                    </Route>

                    <Route path="/settings" element={<Settings />} />
                    <Route path="/subscription" element={<SubscriptionPage />} />
                  </Route>
                  <Route element={<StrictSuperuserRoute />}>
                    <Route element={<SuperAdminLayout />}>
                      <Route path="/ultimate-control-center" element={<SuperAdminDashboard />} />
                      <Route path="/ultimate-control-center/schools" element={<SuperAdminPortal />} />
                      <Route path="/ultimate-control-center/portals" element={<SystemPortals />} />
                      <Route path="/ultimate-control-center/health" element={<PlatformHealth />} />
                      <Route path="/ultimate-control-center/billing" element={<SuperAdminSubscriptions />} />
                      <Route path="/ultimate-control-center/settings" element={<SuperAdminSettings />} />
                    </Route>
                  </Route>
                </Route>

                {/* Other Protected Routes */}
                <Route element={<ProtectedRoute />}>

                  {/* Finance Independent Portal */}
                  <Route element={<FeatureRoute feature="FINANCE_MANAGEMENT" requiredPlan="Standard" />}>
                    <Route path="/finance-portal" element={<FinanceLayout />}>
                      <Route path="dashboard" element={<FinancePortalDashboard />} />
                      <Route path="accounts" element={<FinancePortalAccounts />} />
                      <Route path="accounts/:id" element={<FinancePortalStudentDetail />} />
                      <Route path="transactions" element={<FinancePortalTransactions />} />
                      <Route path="transactions/:id" element={<FinancePortalTransactionDetail />} />
                      <Route path="reports" element={<FinancePortalReports />} />
                      <Route path="transport-expenses" element={<TransportFinance />} />
                      <Route path="salaries" element={<Salaries />} />
                      <Route path="food" element={<FoodFinance />} />
                      <Route path="expenses" element={<FinanceExpenses />} />
                      {/* Redirect root of portal to dashboard */}
                      <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                  </Route>

                  {/* Food Management Portal */}
                  <Route element={<FeatureRoute feature="FOOD_MANAGEMENT" requiredPlan="Enterprise" />}>
                    <Route path="/food-portal" element={<FoodLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<FoodDashboard />} />
                      <Route path="students" element={<FoodStudentList />} />
                      <Route path="students/:id" element={<FoodStudentDetail />} />
                      <Route path="menu" element={<FoodMealOptions />} />
                      <Route path="serving-list" element={<FoodServingList />} />
                    </Route>
                  </Route>

                  {/* Transport Management Portal */}
                  <Route element={<FeatureRoute feature="TRANSPORT_MANAGEMENT" requiredPlan="Enterprise" />}>
                    <Route path="/transport-portal" element={<TransportLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<TransportDashboard />} />
                      <Route path="students" element={<TransportStudentList />} />
                      <Route path="students/:id" element={<TransportStudentDetail />} />
                      <Route path="routes" element={<TransportRoutes />} />
                      <Route path="routes/:id" element={<TransportRouteDetail />} />
                      <Route path="vehicles" element={<TransportVehicles />} />
                      <Route path="vehicles/:id" element={<TransportVehicleDetail />} />
                      <Route path="drivers" element={<TransportDrivers />} />
                      <Route path="drivers/:id" element={<TransportDriverDetail />} />
                    </Route>
                  </Route>

                  {/* Driver Portal */}
                  <Route path="/driver-portal" element={<DriverLayout />}>
                    <Route path="dashboard" element={<DriverDashboard />} />
                    <Route path="expenses" element={<DriverExpenses />} />
                    <Route path="profile" element={<DriverProfile />} />
                  </Route>

                  {/* Teacher Portal Routes */}
                  <Route path="/teacher/:id" element={<TeacherLayout />}>
                    <Route index element={<TeacherProfile />} />
                    <Route path="class" element={<TeacherClasses />} />
                    <Route path="student/:id" element={<TeacherStudentDetail />} />
                    <Route path="student/:id/report" element={<StudentAcademicReport />} />
                    <Route path="academics" element={<TeacherAcademics />} />
                    <Route path="attendance" element={<TeacherAttendance />} />
                    <Route path="schedule" element={<TeacherSchedule />} />
                    <Route path="requests" element={<TeacherRequests />} />
                  </Route>
                  <Route path="/student/:id" element={<StudentDetail />} />
                  <Route path="/students/:id/academic-report" element={<StudentAcademicReport />} />
                </Route>
              </Routes>
            </React.Suspense>
          </AppInsideRouter>
        </Router>
      </SchoolProvider >
    </AppStatusProvider>
  );
}

export default App;
