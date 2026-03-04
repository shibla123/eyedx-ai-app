import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();  
    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* Top Bar */}
      <div className="top-bar">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Card */}
      <div className="dashboard-card">
        <h1>Retinal AI Detection System</h1>
        <p className="dashboard-subtitle">
          AI-powered early screening of retinal diseases using 
          Convolutional Neural Networks and Grad-CAM visualization.
        </p>

        <button 
          className="dashboard-btn"
          onClick={() => navigate("/upload")}
        >
          Upload Fundus Image
        </button>
      </div>

      {/* How It Works */}
      <div className="how-section">
        <h2>How It Works</h2>

        <div className="steps-container">
          <div className="step-card">
            <span className="step-number">1</span>
            <p>Upload Retinal Image</p>
          </div>

          <div className="step-card">
            <span className="step-number">2</span>
            <p>Image Preprocessing</p>
          </div>

          <div className="step-card">
            <span className="step-number">3</span>
            <p>CNN Feature Extraction</p>
          </div>

          <div className="step-card">
            <span className="step-number">4</span>
            <p>Disease Classification</p>
          </div>

          <div className="step-card">
            <span className="step-number">5</span>
            <p>Grad-CAM Visualization</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;