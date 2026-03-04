import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">

      <div className="background-shape one"></div>
      <div className="background-shape two"></div>

      <div className="hero">

        <h1>
          Deep Learning-Based
          <br />
          <span>Retinal Disease Detection</span>
        </h1>

        <p>
          AI-powered automated screening of fundus images
          using advanced CNN models and Grad-CAM visualization.
        </p>

        <div className="buttons">
          <button
            className="primary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="secondary"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>

      </div>

    </div>
  );
}

export default Home;