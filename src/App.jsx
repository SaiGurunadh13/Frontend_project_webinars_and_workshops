import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Webinars from "./pages/Webinars";
import Workshops from "./pages/Workshops";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Signup from "./pages/Signup";

function RequireAdmin({ children }) {
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  if (role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  if (!role) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/webinars" replace />;
}

function RequireAuth({ children }) {
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  if (!role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/webinars" element={<RequireAuth><Webinars /></RequireAuth>} />
          <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
          <Route path="/workshops" element={<RequireAuth><Workshops /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}