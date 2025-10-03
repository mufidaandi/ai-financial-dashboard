// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Insights from "./pages/Insights";

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with sidebar */}
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
        
        {/* Placeholder routes for future pages */}
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
        

      </Routes>
    </>
  );
}

export default App;
