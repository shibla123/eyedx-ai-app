import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";   // 👈 ADD THIS
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Upload from "./Upload";
import Result from "./Result";

function App() {
  return (
    <Routes>

      {/* FIRST PAGE */}
      <Route path="/" element={<Home />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* APP PAGES */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/result" element={<Result />} />

    </Routes>
  );
}

export default App;