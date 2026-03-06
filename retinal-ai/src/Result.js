import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";

function formatDiseaseName(name) {
  if (!name) return "";

  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Result() {

  const location = useLocation();
  const navigate = useNavigate();

  const prediction = location.state?.prediction;
  const originalImage = location.state?.originalImage;
  const gradcamImage = location.state?.gradcamImage;

  if (!prediction) {
    return (
      <div className="result-page">
        <div className="result-box">
          <h3>No Prediction Result Found</h3>

          <button
            className="btn-primary"
            onClick={() => navigate("/upload")}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isNormal = prediction === "Normal";

  return (
    <div className="result-page">

      <div className="result-box">

        <h2 className="title">
          AI Retinal Diagnosis Report
        </h2>

        <div className={`status ${isNormal ? "normal" : "disease"}`}>
          {isNormal
            ? "Eye Condition Normal"
            : "Retinal Disease Detected"}
        </div>

        {!isNormal && (
          <div className="disease-name">
            {formatDiseaseName(prediction)}
          </div>
        )}

        {isNormal && (
          <p className="normal-text">
            No retinal abnormality detected.
          </p>
        )}

        <div className="image-section">

          {originalImage && (
            <div className="image-card">
              <h4>Fundus Image</h4>
              <img src={originalImage} alt="Original" />
            </div>
          )}

          {!isNormal && gradcamImage && (
            <div className="image-card">
              <h4>AI Heatmap Explanation</h4>
              <img src={gradcamImage} alt="GradCAM" />
            </div>
          )}

        </div>

        <button
          className="btn-primary full"
          onClick={() => navigate("/upload")}
        >
          New Prediction
        </button>

      </div>
    </div>
  );
}

export default Result;