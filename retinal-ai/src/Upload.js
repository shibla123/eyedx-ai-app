import React, { useState } from "react";
import "./Upload.css";
import { Link, useNavigate } from "react-router-dom";

function Upload() {
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePredict = () => {
    // Replace this later with backend API result
    const prediction = "Diabetic Retinopathy";

    navigate("/result", {
      state: {
        prediction: prediction,
        gradcamImage: preview
      }
    });
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h1>Upload Fundus Image</h1>
        <p className="subtitle">
          AI-based detection of retinal diseases using CNN & Grad-CAM
        </p>

        <label className="upload-box">
          Choose Image
          <input type="file" onChange={handleFileChange} hidden />
        </label>

        {preview && (
          <img src={preview} alt="Preview" className="preview-image" />
        )}

        <button 
          className="predict-btn"
          onClick={handlePredict}
          disabled={!preview}
        >
          Predict
        </button>

        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Upload;