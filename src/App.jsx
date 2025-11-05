import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Webinars from "./pages/Webinars";
import Workshops from "./pages/Workshops";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}