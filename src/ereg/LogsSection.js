import { useState } from "react";
import "./LogsSection.css";

export default function LogsSection() {
  const [active, setActive] = useState("Medical History");

  const menu = [
    "Medical History",
    "Adverse Events",
    "Concomitant Medications",
    "Adverse Event Log",
    "eDiary Review"
  ];

  return (
    <div className="logs-container">

      {/* LEFT SIDEBAR */}
      <div className="sidebar">
        {menu.map((item) => (
          <div
            key={item}
            className={`menu ${active === item ? "active" : ""}`}
            onClick={() => setActive(item)}
          >
            ✔ {item}
          </div>
        ))}
      </div>

      {/* RIGHT CONTENT */}
      <div className="content">

        {/* ORANGE HEADER */}
        <div className="content-header">
          {active}
        </div>

        {/* INSTRUCTIONS */}
        <div className="instructions">
          <b>Instructions</b>
          <p>Check here if no relevant history</p>
        </div>

        {/* TABLE */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Which Body System?</th>
              <th>Condition/Diagnosis</th>
              <th>Start</th>
              <th>Stop</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Gastrointestinal</td>
              <td>Constipation</td>
              <td>00-JAN-2017</td>
              <td>ONGOING</td>
            </tr>

            <tr>
              <td>2</td>
              <td>Musculoskeletal</td>
              <td>Osteoarthritis</td>
              <td>00-JAN-2008</td>
              <td>ONGOING</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}