import React, { useState } from "react";
import "./Upload.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Upload() {

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();

  // Select Image
  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Predict API
  const handlePredict = async () => {

    if (!selectedFile) {
      alert("Please upload image");
      return;
    }

    try {

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post(
        "http://localhost:5000/predict",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Prediction Response:", response.data);

      let gradcamImage = null;

      if (response.data.gradcam) {
        gradcamImage = `data:image/jpeg;base64,${response.data.gradcam}`;
      }

      // Navigate to Result Page
      navigate("/result", {
        state: {
          prediction:
            response.data.status === "Normal"
              ? "Normal"
              : response.data.disease,

          originalImage: preview,

          gradcamImage: gradcamImage
        }
      });

    } catch (error) {

      console.error("Prediction Error:", error);
      alert("Prediction failed");

    }
  };

  return (
    <div className="upload-page">

      <div className="upload-card">

        <h1>Upload Fundus Image</h1>

        <p className="subtitle">
          AI-based detection of retinal diseases
        </p>

        <label className="upload-box">
          Choose Image
          <input
            type="file"
            onChange={handleFileChange}
            hidden
            accept="image/*"
          />
        </label>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="preview-image"
          />
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