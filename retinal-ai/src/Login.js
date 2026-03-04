import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/login",
        {
          email,
          password,
        }
      );

      // ✅ Store JWT Token
      localStorage.setItem("token", response.data.token);

      alert(response.data.message);

      // ✅ Redirect to dashboard
      navigate("/dashboard");

    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server error. Please try again.");
      }
    }
  };

  return (
    <div className="auth-container">

      {/* Left Side Branding */}
      <div className="auth-left">
        <h1>Retinal AI</h1>
        <p>
          AI-powered early detection of retinal diseases using
          Convolutional Neural Networks and Grad-CAM visualization.
        </p>
      </div>

      {/* Right Side Form */}
      <div className="auth-right">
        <form onSubmit={handleLogin} className="auth-form">
          <h2>Login</h2>

          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>

          <p>
            Don’t have an account?{" "}
            <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>

    </div>
  );
}

export default Login;