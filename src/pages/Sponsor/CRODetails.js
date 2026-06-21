import React from "react";
import AppLayout from "./AppLayout";
import { useLocation, useNavigate } from "react-router-dom";


const CRODetails = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const croData = location.state || {
    croName: "IQVIA",
    studies: 12,
    sites: 45,
    performance: "95%"
  };

  const {
    croName,
    studies,
    sites,
    performance
  } = croData;

  return (
    <AppLayout>

      <div style={{ padding: "24px" }}>
<button
  onClick={() => navigate(-1)}
  style={{
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "20px"
  }}
>
  Back
</button>
        <h1>{croName} Details</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "20px"
          }}
        >

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center"
            }}
          >
            <h3>Studies</h3>
            <h2>{studies}</h2>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center"
            }}
          >
            <h3>Sites</h3>
            <h2>{sites}</h2>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center"
            }}
          >
            <h3>Performance</h3>
            <h2>{performance}</h2>
          </div>

        </div>

      </div>

    </AppLayout>
  );
};

export default CRODetails;