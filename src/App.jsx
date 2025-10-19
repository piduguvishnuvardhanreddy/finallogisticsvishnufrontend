import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { DriversProvider } from "./context/DriversContext";
import { VehiclesProvider } from "./context/VehiclesContext";
import { DeliveriesProvider } from "./context/DeliveriesContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import DeliveryTracking from "./pages/DeliveryTracking";
import ProtectedRoute from "./components/ProtectedRoute";
import Vehicles from "./pages/Vehicles";
import Deliveries from "./pages/Deliveries";
import DriverTracking from "./pages/DriverTracking";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDeliveries from "./pages/DriverDeliveries";
import AdminAssignDelivery from "./pages/AdminAssignDelivery";
import AdminReports from "./pages/AdminReports";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerBooking from "./pages/CustomerBooking";
import DriverDashboard from "./pages/DriverDashboard";
import CustomerDashboardEnhanced from "./pages/CustomerDashboardEnhanced";
import CustomerBookingEnhanced from "./pages/CustomerBookingEnhanced";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerDeliveries from "./pages/CustomerDeliveries";
import DriverDashboardEnhanced from "./pages/DriverDashboardEnhanced";
import DriverEarnings from "./pages/DriverEarnings";
import AdminDashboardEnhanced from "./pages/AdminDashboardEnhanced";
import AdminDrivers from "./pages/AdminDrivers";
import AdminDriverDetail from "./pages/AdminDriverDetail";
import AdminDeliveryList from "./pages/AdminDeliveryList";
import AdminProfile from "./pages/AdminProfile";
import AdminFeedback from "./pages/AdminFeedback";
import AdminAssignDeliveryNew from "./pages/AdminAssignDeliveryNew";
import AdminVehiclesNew from "./pages/AdminVehiclesNew";
import AdminVehicles from "./pages/AdminVehicles";
import RealTimeTracking from "./pages/RealTimeTracking";
import RealTimeTrackingEnhanced from "./pages/RealTimeTrackingEnhanced";
import CustomerWallet from "./pages/CustomerWallet";
import CustomerBookingWithPayment from "./pages/CustomerBookingWithPayment";
import DriverProfile from "./pages/DriverProfile";
import DriverDashboardNew from "./pages/DriverDashboardNew";
import AddMoneyPage from "./pages/AddMoneyPage";
import PageTransition from "./components/PageTransition";
import HomeRedirect from "./components/HomeRedirect";

function RoutesWithAnimation() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Protected home - redirects based on role */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageTransition>
                <HomeRedirect />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Delivery Tracking */}
        <Route
          path="/track/:deliveryId"
          element={
            <ProtectedRoute>
              <PageTransition>
                <RealTimeTrackingEnhanced />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-old/:deliveryId"
          element={
            <ProtectedRoute>
              <PageTransition>
                <RealTimeTracking />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-old/:deliveryId"
          element={
            <ProtectedRoute>
              <PageTransition>
                <DeliveryTracking />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminVehicles />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles-new"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminVehiclesNew />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles-old"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <Vehicles />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/deliveries"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <Deliveries />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/deliveries"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminDeliveryList />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Driver"]}>
              <PageTransition>
                <DriverDashboardNew />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/dashboard-old"
          element={
            <ProtectedRoute allowedRoles={["Driver"]}>
              <PageTransition>
                <DriverDashboardEnhanced />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/profile"
          element={
            <ProtectedRoute allowedRoles={["Driver"]}>
              <PageTransition>
                <DriverProfile />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/earnings"
          element={
            <ProtectedRoute allowedRoles={["Driver"]}>
              <PageTransition>
                <DriverEarnings />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/wallet"
          element={
            <ProtectedRoute allowedRoles={["Driver"]}>
              <PageTransition>
                <DriverEarnings />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/tracking/:deliveryId/:vehicleId/:driverId"
          element={
            <ProtectedRoute allowedRoles={["Driver"]}>
              <PageTransition>
                <DriverTracking />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminDashboardEnhanced />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/drivers"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminDrivers />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/drivers/:driverId"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminDriverDetail />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminFeedback />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminProfile />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <PageTransition>
                <CustomerDashboardEnhanced />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/book"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <PageTransition>
                <CustomerBooking />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/book-enhanced"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <PageTransition>
                <CustomerBookingWithPayment />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/book-old"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <PageTransition>
                <CustomerBookingEnhanced />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/wallet"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <PageTransition>
                <CustomerWallet />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/add-money"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <PageTransition>
                <AddMoneyPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <PageTransition>
                <CustomerProfile />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/deliveries"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <PageTransition>
                <CustomerDeliveries />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/deliveries"
          element={
            <ProtectedRoute allowedRoles={["Driver"]}>
              <PageTransition>
                <DriverDeliveries />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assign"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminAssignDeliveryNew />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assign-old"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminAssignDelivery />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PageTransition>
                <AdminAssignDelivery />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <DriversProvider>
        <VehiclesProvider>
          <DeliveriesProvider>
            <BrowserRouter>
              <RoutesWithAnimation />
            </BrowserRouter>
          </DeliveriesProvider>
        </VehiclesProvider>
      </DriversProvider>
    </AuthProvider>
  );
}

export default App;
