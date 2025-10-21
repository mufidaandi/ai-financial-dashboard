// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Settings from "./pages/Settings";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import { OnboardingProvider } from "./context/OnboardingContext";
import TourTooltip from "./components/ui/TourTooltip";
import WelcomeModal from "./components/ui/WelcomeModal";

function App() {
  return (
    <OnboardingProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Sidebar>
                <Dashboard />
              </Sidebar>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Sidebar>
                <Transactions />
              </Sidebar>
            </PrivateRoute>
          }
        />
        

        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Sidebar>
                <Categories />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/accounts"
          element={
            <PrivateRoute>
              <Sidebar>
                <Accounts />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/budgets"
          element={
            <PrivateRoute>
              <Sidebar>
                <Budgets />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Sidebar>
                <Settings />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/insights"
          element={
            <PrivateRoute>
              <Sidebar>
                <Insights />
              </Sidebar>
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Sidebar>
                <Profile />
              </Sidebar>
            </PrivateRoute>
          }
        />
        

      </Routes>
      
      {/* Onboarding components */}
      <WelcomeModal />
      <TourTooltip />
    </OnboardingProvider>
  );
}

export default App;
