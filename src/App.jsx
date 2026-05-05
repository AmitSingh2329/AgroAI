import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CropRecommendation from "./pages/CropRecommendation";
import Navbar from "./component/Navbar";
import ProtectedRoute from "./component/ProtectedRoute";
import WeatherAlertsPage from "./pages/WeatherAlert";
import DiseaseDetection from "./pages/DiseaseDetection";
import YieldPrediction from "./pages/YieldPrediction";

/* 🔥 Page Wrapper (FINAL) */
const PageWrapper = ({ children, noScroll = false }) => {
  return (
    <motion.div
      className={`relative ${
        noScroll
          ? "h-[calc(100vh-64px)] overflow-hidden"
          : "min-h-[calc(100vh-64px)]"
      }`}
      initial={{ opacity: 0, scale: 0.97, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(10px)" }}
      transition={{ duration: 0.4 }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-900 to-black z-0" />

      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black z-10 pointer-events-none"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 0.6 }}
        transition={{ duration: 0.4 }}
      />

      {/* Content */}
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
};

/* 🔥 Animated Routes */
function AnimatedRoutes({ user, setUser }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Scrollable Pages */}
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />

        <Route
          path="/crop"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <CropRecommendation />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <Dashboard user={user} setUser={setUser} />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/disease"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <DiseaseDetection />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* No Scroll Pages */}

        <Route
          path="/login"
          element={
            <PageWrapper noScroll>
              <Login setUser={setUser} />
            </PageWrapper>
          }
        />

        <Route
          path="/register"
          element={
            <PageWrapper noScroll>
              <Register />
            </PageWrapper>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper noScroll>
                <WeatherAlertsPage />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/yield"
          element={
            <ProtectedRoute user={user}>
              <PageWrapper>
                <YieldPrediction />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/profile", {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <AnimatedRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;
