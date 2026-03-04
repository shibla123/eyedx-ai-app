import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const prediction = location.state?.prediction;
  const confidence = location.state?.confidence;
  const originalImage = location.state?.originalImage;
  const gradcamImage = location.state?.gradcamImage;

  if (!prediction) {
    return (
      <div className="result-page">
        <div className="result-card">
          <h3>No result data found.</h3>
          <button onClick={() => navigate("/upload")} className="new-btn">
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page">

      <h2 className="result-title">AI Diagnostic Report</h2>

      <div className="result-container">

        {/* Left Side - Details */}
        <div className="details-card">
          <h3 className="status-badge">RESULT : DISEASED ⚠</h3>

          <h2 className="prediction-text">
            {prediction.replace("_", " ")}
          </h2>

          <div className="confidence-box">
            Confidence: <span>{confidence}%</span>
          </div>

          <button
            className="new-btn"
            onClick={() => navigate("/upload")}
          >
            Start New Prediction
          </button>
        </div>

        {/* Right Side - Images */}
        <div className="image-section">

          <div className="image-card">
            <h4>Original Image</h4>
            {originalImage && (
              <img src={originalImage} alt="Original" />
            )}
          </div>

          <div className="image-card">
            <h4>Grad-CAM Visualization</h4>
            {gradcamImage && (
              <img src={gradcamImage} alt="GradCAM" />
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default Result;