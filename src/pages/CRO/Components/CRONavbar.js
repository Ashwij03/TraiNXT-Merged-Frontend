import React, { useState } from "react";
import {
  FaHome,
  FaComments,
  FaBell,
  FaChevronDown
} from "react-icons/fa";

function CRONavbar({
  name,
  search,
  setSearch,

  study,
  setStudy,

  selectedSite,
  setSelectedSite,

  selectedSubject,
  setSelectedSubject
}) {
	const [indication, setIndication] =
	  useState("Gastroenterology");
	
	const [selectedStudy, setSelectedStudy] =
	  useState("OCA Study");
	  
	const studyData = {
	  "OCA Study": {
	    sites: {
	      Apollo: ["SUB-001", "SUB-002", "SUB-003"],
	      Yashoda: ["SUB-004", "SUB-005"]
	    }
	  },

	  "SeptiTest": {
	    sites: {
	      Care: ["SUB-006", "SUB-007"],
	      AIG: ["SUB-008", "SUB-009"]
	    }
	  },

	  "Diabetes Trial": {
	    sites: {
	      KIMS: ["SUB-010", "SUB-011"]
	    }
	  },

	  "Cardio Study": {
	    sites: {
	      Sunshine: ["SUB-012", "SUB-013"]
	    }
	  },

	  "Oncology Trial": {
	    sites: {
	      NIMS: ["SUB-014", "SUB-015"]
	    }
	  }
	};
	
  return (
    <div
      style={{
        background: "#fff",
        padding: "15px 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e5e7eb"
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center"
        }}
      >
	  <div>
	    <div
	      style={{
	        fontSize: "11px",
	        color: "#6b7280",
	        fontWeight: "700",
	        textTransform: "uppercase",
	        marginBottom: "6px"
	      }}
	    >
		Indication
	    </div>

	    <div
	      style={{
	        display: "flex",
	        alignItems: "center",
	        gap: "8px",
	        fontSize: "16px",
	        fontWeight: "600",
	        color: "#1f2937",
	        cursor: "pointer"
	      }}
	    >
		<select
		  value={indication}
		  onChange={(e) => setIndication(e.target.value)}
		  style={{
			width: "180px",
		    border: "none",
		    fontSize: "16px",
		    fontWeight: "600",
		    background: "transparent",
		    cursor: "pointer"
		  }}
		>
		<option>Gastroenterology</option>
		<option>Dermatology</option>
		<option>Oncology</option>
		<option>Cardiology</option>
		<option>Diabetes</option>
		</select>
	    </div>
	  </div>  
	  
	  <select
	    value={selectedStudy}
	    onChange={(e) => {
	      setSelectedStudy(e.target.value);

	      const firstSite =
	        Object.keys(
	          studyData[e.target.value].sites
	        )[0];

	      setSelectedSite(firstSite);

	      setSelectedSubject(
	        studyData[e.target.value]
	          .sites[firstSite][0]
	      );
	    }}
	  >
	    {Object.keys(studyData).map((study) => (
	      <option key={study}>
	        {study}
	      </option>
	    ))}
	  </select>


	  <div>
	    <div
	      style={{
	        fontSize: "11px",
	        color: "#6b7280",
	        fontWeight: "700",
	        textTransform: "uppercase",
	        marginBottom: "6px"
	      }}
	    >
	      Studies
	    </div>
		
		<div
		  style={{
		    fontSize: "16px",
		    fontWeight: "600"
		  }}
		>
		</div>

	    <div
	      style={{
	        display: "flex",
	        alignItems: "center",
	        gap: "8px",
	        fontSize: "16px",
	        fontWeight: "600",
	        color: "#1f2937",
	        cursor: "pointer"
	      }}
	    >
		<select
		  value={study}
		  onChange={(e) => setStudy(e.target.value)}
		  style={{
		    border: "none",
		    fontSize: "16px",
		    fontWeight: "600",
		    background: "transparent",
		    cursor: "pointer",
		    width: "250px"
		  }}
		>
		  <option>OBETICHOLIC ACID (OCA)</option>
		  <option>SeptiTest</option>
		</select>
	    </div>
	  </div>
      </div>
	  
	  <div>
	    <div
	      style={{
	        fontSize: "11px",
	        color: "#6b7280",
	        fontWeight: "700",
	        textTransform: "uppercase",
	        marginBottom: "6px"
	      }}
	    >
	      Sites
	    </div>

	    <select
	      value={selectedSite}
	      onChange={(e) =>
	        setSelectedSite(e.target.value)
	      }
	      style={{
	        border: "none",
	        fontSize: "16px",
	        fontWeight: "600",
	        background: "transparent",
	        cursor: "pointer"
	      }}
	    >
		<option value="Apollo">Apollo Hospital</option>
		 <option value="Yashoda">Yashoda Hospital</option>
		 <option value="AIG">AIG Hospital</option>
		 <option value="Care">Care Hospital</option>
		 <option value="KIMS">KIMS Hospital</option>
	    </select>
	  </div>
	  
	  <div>
	    <div
	      style={{
	        fontSize: "11px",
	        color: "#6b7280",
	        fontWeight: "700",
	        textTransform: "uppercase",
	        marginBottom: "6px"
	      }}
	    >
	      Subjects
	    </div>

	    <select
	      value={selectedSubject}
	      onChange={(e) =>
	        setSelectedSubject(e.target.value)
	      }
	      style={{
	        border: "none",
	        fontSize: "16px",
	        fontWeight: "600",
	        background: "transparent",
	        cursor: "pointer"
	      }}
	    >
		<option value="SUB001">SUB-001</option>
		 <option value="SUB002">SUB-002</option>
		 <option value="SUB003">SUB-003</option>
		 <option value="SUB004">SUB-004</option>
		 <option value="SUB005">SUB-005</option>
	    </select>
	  </div>

      <input
        type="text"
        placeholder="Search Subject ID, Visit, Query..."
        style={{
          width: "320px",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "8px"
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}
      >
	  <div
	    onClick={() => window.location.href="/cro-dashboard"}
	    style={{
	      display:"flex",
	      alignItems:"center",
	      gap:"6px",
	      cursor:"pointer"
	    }}
	  >
	    <FaHome />
	    <span>Home</span>
	  </div>
	  <FaComments
	    style={{ cursor:"pointer" }}
	    onClick={() => alert("Live Chat Coming Soon")}
	  />
	  <FaBell
	    style={{ cursor:"pointer" }}
	    onClick={() => alert("Notifications")}
	  />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#2563eb",
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold"
            }}
          >
            C
          </div>

		  <div>
		    <div
		      style={{
		        fontWeight: "600",
		        color: "#111827"
		      }}
		    >
		      CRO User
		    </div>

		    <div
		      style={{
		        fontSize: "13px",
		        color: "#6b7280"
		      }}
		    >
		      Clinical Research Org
		    </div>
		  </div>

          <FaChevronDown />
        </div>
      </div>
    </div>
  );
}

export default CRONavbar;