
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';

import { AuthContext } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Authentication
import Login from './pages/Login';

// Dashboard
import Dashboard from './pages/Dashboard';

// Complaints
import Complaints from './pages/Complaints';
import ComplaintDetail from './pages/ComplaintDetail';

// Welfare
import Welfare from './pages/Welfare';
import WelfareDetail from './pages/WelfareDetail';

// Announcements
import Announcements from './pages/Announcements';

// Users & Staff
import Users from './pages/Users';
import Staff from './pages/Staff';
import Departments from './pages/Departments';

// Donations
import Donations from './pages/Donations';
import DonationDetail from './pages/DonationDetail';

// Other Modules
import Notifications from './pages/Notifications';
import Feedback from './pages/Feedback';
import Reports from './pages/Reports';
import ImpactStories from './pages/ImpactStories';
import Volunteers from './pages/Volunteers';
import BloodDonors from './pages/BloodDonors';
import Events from './pages/Events';
import Resources from './pages/Resources';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <Routes>

        {/* Login Route */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected Admin Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Complaints */}
          <Route path="/complaints" element={<Complaints />} />
          <Route
            path="/complaints/:id"
            element={<ComplaintDetail />}
          />

          {/* Welfare */}
          <Route path="/welfare" element={<Welfare />} />
          <Route
            path="/welfare/:id"
            element={<WelfareDetail />}
          />

          {/* Announcements */}
          <Route
            path="/announcements"
            element={<Announcements />}
          />

          {/* Users & Staff */}
          <Route path="/users" element={<Users />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/departments" element={<Departments />} />

          {/* Donations */}
          <Route path="/donations" element={<Donations />} />
          <Route
            path="/donations/:id"
            element={<DonationDetail />}
          />

          {/* Events */}
          <Route path="/events" element={<Events />} />

          {/* Volunteers */}
          <Route path="/volunteers" element={<Volunteers />} />

          {/* Blood Donors */}
          <Route
            path="/blood-donors"
            element={<BloodDonors />}
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* Feedback */}
          <Route path="/feedback" element={<Feedback />} />

          {/* Resources */}
          <Route path="/resources" element={<Resources />} />

          {/* Impact Stories */}
          <Route
            path="/impact-stories"
            element={<ImpactStories />}
          />

          {/* Reports */}
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* Invalid Routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </>
  );
}

export default App;
