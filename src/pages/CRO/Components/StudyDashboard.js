import React, { useState } from "react";
import CROSidebar from "./CROSidebar";
import CRONavbar from "./CRONavbar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {
  FaUserPlus,
  FaEdit,
  FaEye,
  FaFileExport,
  FaCalendarAlt
} from "react-icons/fa";

function StudyDashboard() {

  const [activeTab, setActiveTab] = useState("overview");
  const [study, setStudy] =
    useState("OBETICHOLIC ACID (OCA)");

  const [selectedSite, setSelectedSite] =
    useState("Apollo");

  const [selectedSubject, setSelectedSubject] =
    useState("SUB-001");
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);

  
  const currentSiteData =
    dashboardData[study]?.[selectedSite];

  const currentSubjects =
    currentSiteData?.subjects || [];
  
  const dashboardData = {
    "OBETICHOLIC ACID (OCA)": {
      Apollo: {
        subjects: [
          {
            id: "SUB-001",
            status: "Active",
            visit: "Visit 3",
            queries: 2
          },
          {
            id: "SUB-002",
            status: "Screening",
            visit: "Screening",
            queries: 0
          }
        ]
      },

      Yashoda: {
        subjects: [
          {
            id: "SUB-003",
            status: "Active",
            visit: "Visit 2",
            queries: 1
          }
        ]
      }
    },

    SeptiTest: {
      Care: {
        subjects: [
          {
            id: "SUB-006",
            status: "Active",
            visit: "Visit 1",
            queries: 0
          }
        ]
      }
    }
  };

  const [subjectForm, setSubjectForm] = useState({
    subjectId: "",
    site: "",
    status: "Screening",
    lastVisit: "",
    nextVisit: "",
    queries: ""
  });
  
  const enrollmentData = [
    { month: "Jan", enrolled: 12 },
    { month: "Feb", enrolled: 18 },
    { month: "Mar", enrolled: 25 },
    { month: "Apr", enrolled: 32 },
    { month: "May", enrolled: 41 },
    { month: "Jun", enrolled: 55 }
  ];

  const queryData = [
    { name: "Open", value: 18 },
    { name: "Closed", value: 45 },
    { name: "Pending", value: 6 }
  ];

  const COLORS = [
    "#2563eb",
    "#22c55e",
    "#f59e0b"
  ];
  
  const tabStyle = (tab) => ({
    background:
      activeTab === tab
        ? "#073B52"
        : "#fff",

    color:
      activeTab === tab
        ? "#fff"
        : "#000",

    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600"
  });
  
  const [studies, setStudies] = useState([
    {
      subjectId: "SUB-001",
      site: "Apollo",
      status: "Active",
      screeningDate: "01-Jun-2026",
      enrollmentDate: "05-Jun-2026",
      lastVisit: "Visit 3",
      nextVisit: "15 Jun 2026",
      queries: "2 Open"
    },

    {
      subjectId: "SUB-002",
      site: "Yashoda",
      status: "Screening",
      screeningDate: "08-Jun-2026",
      enrollmentDate: "-",
      lastVisit: "Screening",
      nextVisit: "Pending",
      queries: "0"
    }
  ]);
  
  const handleAddStudy = () => {
    const newStudy = {
      id: studies.length + 1,
      title: `New Study ${studies.length + 1}`,
      site: "Apollo Hospital",
      enrolled: 0
    };

    setStudies([...studies, newStudy]);
  };
  
  const handleSaveSubject = () => {

	const newSubject = {
	  subjectId: subjectForm.subjectId,
	  site: subjectForm.site,
	  status: subjectForm.status,
	  screeningDate: subjectForm.screeningDate,
	  enrollmentDate: subjectForm.enrollmentDate,
	  lastVisit: "-",
	  nextVisit: "-",
	  queries: "0"
	};

    setStudies([...studies, newSubject]);

    setSubjectForm({
      subjectId: "",
      site: "",
      status: "Screening",
      lastVisit: "",
      nextVisit: "",
	  screeningDate: "",
	  enrollmentDate: "",
      queries: ""
    });

    setShowAddSubjectModal(false);
  };
  return (
    <div className="dashboard-layout">

	<CROSidebar />

	<div className="main-content">

	<CRONavbar
	  study={study}
	  setStudy={setStudy}

	  selectedSite={selectedSite}
	  setSelectedSite={setSelectedSite}

	  selectedSubject={selectedSubject}
	  setSelectedSubject={setSelectedSubject}
	/>

	  <div style={{ padding: "30px" }}>
		
		{activeTab === "overview" && (
		  <>
		    <div
		      style={{
		        background: "#073B52",
		        color: "#fff",
		        padding: "25px",
		        borderRadius: "12px",
		        marginBottom: "20px"
		      }}
		    >
		      <h1>OBETICHOLIC ACID (OCA)</h1>
		      <p>Protocol: OCA-001</p>
		      <p>Sponsor: Pfizer</p>
		      <p>Status: Active</p>
			  <p>Phase: III</p>
			  <p>Sites: 3</p>
			  <p>PI: Dr. Rajesh Kumar</p>
		    </div>

		    <div
		      style={{
		        display: "grid",
		        gridTemplateColumns: "repeat(4,1fr)",
		        gap: "20px",
		        marginBottom: "20px"
		      }}
		    >
		      <div className="stat-card">
		        <h2>2</h2>
		        <p>Total Studies</p>
		      </div>

		      <div className="stat-card">
		        <h2>9</h2>
		        <p>Total Subjects</p>
		      </div>

		      <div className="stat-card">
		        <h2>18</h2>
		        <p>Open Queries</p>
		      </div>

		      <div className="stat-card">
		        <h2>36</h2>
		        <p>Site Visits</p>
		      </div>
		    </div>

			<div
			  style={{
			    display: "flex",
			    gap: "10px",
			    marginBottom: "20px"
			  }}
			>
		      <button style={tabStyle("overview")} onClick={() => setActiveTab("overview")}>Overview</button>
		      <button style={tabStyle("subjects")} onClick={() => setActiveTab("subjects")}>Subjects</button>
		      <button style={tabStyle("screening")} onClick={() => setActiveTab("screening")}>Screening</button>
		      <button style={tabStyle("enrollment")} onClick={() => setActiveTab("enrollment")}>Enrollment</button>
		      <button style={tabStyle("visits")} onClick={() => setActiveTab("visits")}>Visits</button>
		      <button style={tabStyle("documents")} onClick={() => setActiveTab("documents")}>Documents</button>
		      <button style={tabStyle("queries")} onClick={() => setActiveTab("queries")}>Queries</button>
		      <button style={tabStyle("reports")} onClick={() => setActiveTab("reports")}>Reports</button>
			  
			  </div>
		
		<h3 style={{ marginBottom: "15px" }}>
		  Recent Subjects
		</h3>

		<table
		  style={{
		    width: "100%",
		    marginBottom: "30px",
		    borderCollapse: "collapse"
		  }}
		>
		  <thead>
		    <tr>
		      <th>Subject ID</th>
		      <th>Site</th>
		      <th>Status</th>
		      <th>Visit</th>
		    </tr>
		  </thead>

		  <tbody>
		    {currentSubjects.map((subject) => (
		      <tr key={subject.id}>
		        <td>{subject.id}</td>
		        <td>{selectedSite}</td>
		        <td>{subject.status}</td>
		        <td>{subject.visit}</td>
		      </tr>
		    ))}
		  </tbody>
		</table>
		
		<div
		  style={{
		    display: "grid",
		    gridTemplateColumns: "1fr 1fr",
		    gap: "20px"
		  }}
		>
		
		<div className="tab-card">
		  <h3>Enrollment Progress</h3>

		  <ResponsiveContainer width="100%" height={300}>
		    <BarChart data={enrollmentData}>

		      <XAxis dataKey="month" />
		      <YAxis />
		      <Tooltip />

		      <Bar
		        dataKey="enrolled"
		        fill="#2563eb"
		      />

		    </BarChart>
		  </ResponsiveContainer>

		  <div style={{ marginTop: "15px" }}>
		    <p>Target: 50 Subjects</p>
		    <p>Current: 9 Subjects</p>

		    <progress
		      value="18"
		      max="100"
		      style={{ width: "100%" }}
		    />
		  </div>
		</div>
		
		<div className="tab-card">
		  <h3>Query Status</h3>

		  <ResponsiveContainer width="100%" height={300}>
		    <PieChart>
		      <Pie
		        data={queryData}
		        dataKey="value"
		        nameKey="name"
		        outerRadius={100}
		        label
		      >
		        {queryData.map((entry, index) => (
		          <Cell
		            key={index}
		            fill={COLORS[index % COLORS.length]}
		          />
		        ))}
		      </Pie>

		      <Tooltip />
		    </PieChart>
		  </ResponsiveContainer>
		</div>
		</div>
		
		<div
		  style={{
		    display: "grid",
		    gridTemplateColumns: "1fr 1fr",
		    gap: "20px",
		    marginTop: "20px"
		  }}
		>
		
		  {/* Open Queries */}
		  <div className="tab-card">
		    <h3>Open Queries</h3>

		    <div
		      style={{
		        padding: "15px",
		        border: "1px solid #eee",
		        borderRadius: "10px",
		        marginBottom: "10px"
		      }}
		    >
		      <strong>Q-101</strong>
		      <p>SUB-001</p>
		      <p>Open</p>
		    </div>

		    <div
		      style={{
		        padding: "15px",
		        border: "1px solid #eee",
		        borderRadius: "10px"
		      }}
		    >
		      <strong>Q-102</strong>
		      <p>SUB-003</p>
		      <p>Pending Review</p>
		    </div>
		  </div>
		  
		  <div className="tab-card">
		    <h3>Upcoming Visits</h3>

		    <div style={{ marginBottom: "12px" }}>
		      <strong>SUB-001</strong>
		      <p>Visit 4</p>
		      <p>15 Jun 2026</p>
		    </div>

		    <div style={{ marginBottom: "12px" }}>
		      <strong>SUB-003</strong>
		      <p>Visit 2</p>
		      <p>18 Jun 2026</p>
		    </div>

		    <div>
		      <strong>SUB-005</strong>
		      <p>EOS Visit</p>
		      <p>20 Jun 2026</p>
		    </div>
		  </div>  {/* Open Queries + Upcoming Visits grid close */}
		  </div>
		  
		  <div
		    style={{
		      display: "grid",
		      gridTemplateColumns: "1fr 1fr",
		      gap: "20px",
		      marginTop: "20px"
		    }}
		  >
		    <div className="tab-card">
		      <h3>Visit Calendar</h3>
		      <Calendar value={new Date()} />
		    </div>

		    <div className="tab-card">
		      <h3>Site Performance</h3>

		      <table style={{ width: "100%" }}>
		        <thead>
		          <tr>
		            <th>Site</th>
		            <th>Subjects</th>
		          </tr>
		        </thead>

		        <tbody>
		          <tr>
		            <td>Apollo</td>
		            <td>5</td>
		          </tr>

		          <tr>
		            <td>Yashoda</td>
		            <td>3</td>
		          </tr>

		          <tr>
		            <td>Care</td>
		            <td>1</td>
		          </tr>
		        </tbody>
		      </table>
		    </div>
		  </div>
		  
		  <div
		    style={{
		      display: "grid",
		      gridTemplateColumns: "1fr 1fr",
		      gap: "20px",
		      marginTop: "20px"
		    }}
		  >
		  
		  <div className="tab-card">
		    <h3>Recent Activities</h3>

		    <p>✓ SUB-001 Enrolled</p>

		    <p>✓ Visit 3 Completed</p>

		    <p>✓ Query Q-102 Closed</p>

		    <p>✓ New Subject Added</p>
		  </div>
		  
		  <div
		    className="tab-card"
		    style={{
		      width: "100%"
		    }}
		  >
		    <h3>Quick Actions</h3>

			<button
			 className="action-btn"
			 style={{
			   width:"100%",
			   marginBottom:"10px"
			 }}
			>
		      <FaUserPlus /> Add Subject
		    </button>

		    <button
		      className="action-btn"
		      style={{ marginLeft: "10px" }}
		    >
		      <FaCalendarAlt /> Schedule Visit
		    </button>

		    <button
		      className="action-btn"
		      style={{ marginLeft: "10px" }}
		    >
		      <FaFileExport /> Export Report
		    </button>
		  </div>

		  </div> {/* Recent Activities + Quick Actions grid close */}

		  </>
		  )}
				
		{activeTab === "subjects" && (
			
		  <div className="tab-card">

		    <h3>Subjects</h3>
			<button
			  onClick={() => setActiveTab("overview")}
			  style={{
			    background: "#073B52",
			    color: "#fff",
			    border: "none",
			    padding: "10px 20px",
			    borderRadius: "8px",
			    marginBottom: "20px",
			    cursor: "pointer"
			  }}
			>
			  ← Back
			</button>

			<div
			  style={{
			    display: "grid",
			    gridTemplateColumns: "repeat(4,1fr)",
			    gap: "20px",
			    marginBottom: "20px"
			  }}
			>
			  <div className="stat-card">
			    <h2>{studies.length}</h2>
			    <p>Total Subjects</p>
			  </div>

			  <div className="stat-card">
			    <h2>
			      {studies.filter(s => s.status === "Active").length}
			    </h2>
			    <p>Active</p>
			  </div>

			  <div className="stat-card">
			    <h2>
			      {studies.filter(s => s.status === "Screening").length}
			    </h2>
			    <p>Screening</p>
			  </div>

			  <div className="stat-card">
			    <h2>
			      {studies.filter(s => s.status === "Completed").length}
			    </h2>
			    <p>Completed</p>
			  </div>
			</div>

			<div
			  style={{
			    display: "flex",
			    justifyContent: "space-between",
			    alignItems: "center",
			    marginBottom: "20px"
			  }}
			>  
			    <input
			      placeholder="Search Subject ID, Site, Status..."
			      style={{
			        width: "350px",
			        padding: "12px",
			        border: "1px solid #ccc",
			        borderRadius: "8px"
			      }}
			    />

				<button
				  className="action-btn"
				  onClick={() => setShowAddSubjectModal(true)}
				  style={{
				    width: "auto",
				    minWidth: "140px",
				    padding: "10px 18px"
				  }}
				>
				  + Add Subject
				</button>
			  </div>

			  <table
			    style={{
			      width: "100%",
			      borderCollapse: "collapse"
			    }}
			  >
			    <thead>
			      <tr>
				  <th>Subject ID</th>
				  <th>Status</th>
				  <th>Site</th>
				  <th>Screening Date</th>
				  <th>Enrollment Date</th>
				  <th>Current Visit</th>
				  <th>Queries</th>
				  <th>Action</th>
			      </tr>
			    </thead>

			    <tbody>
			      {studies.map((subject, index) => (
			        <tr key={index}>
					<td>{subject.subjectId}</td>
					<td>{subject.status}</td>
					<td>{subject.site}</td>
					<td>{subject.screeningDate || "-"}</td>
					<td>{subject.enrollmentDate || "-"}</td>
					<td>{subject.lastVisit}</td>
					<td>{subject.queries}</td>
			          <td>
			            <button>✏ Edit</button>

			            <button style={{ marginLeft: "8px" }}>
			              👁 View
			            </button>
			          </td>
			        </tr>
			      ))}
			    </tbody>
			  </table>

		  </div>

		)}
			  
		{activeTab === "screening" && (

		  <div className="tab-card">

		    <h3>Screening Subjects</h3>

		    <table>
		      <thead>
		        <tr>
		          <th>Subject ID</th>
		          <th>Screening Date</th>
		          <th>Status</th>
		        </tr>
		      </thead>

		      <tbody>
		        <tr>
		          <td>SUB-001</td>
		          <td>2026-06-01</td>
		          <td>Eligible</td>
		        </tr>

		        <tr>
		          <td>SUB-002</td>
		          <td>2026-06-05</td>
		          <td>Pending</td>
		        </tr>
		      </tbody>
		    </table>

		  </div>

		)}
		
		{activeTab === "enrollment" && (

		  <div className="tab-card">

		    <h3>Enrollment</h3>

		    <table>
		      <thead>
		        <tr>
		          <th>Subject ID</th>
		          <th>Enrollment Date</th>
		          <th>Status</th>
		        </tr>
		      </thead>

		      <tbody>
		        <tr>
		          <td>SUB-001</td>
		          <td>2026-06-02</td>
		          <td>Enrolled</td>
		        </tr>

		        <tr>
		          <td>SUB-003</td>
		          <td>2026-06-08</td>
		          <td>Enrolled</td>
		        </tr>
		      </tbody>
		    </table>

		  </div>

		)}
		
		<input
		  type="date"
		  value={subjectForm.screeningDate}
		  onChange={(e) =>
		    setSubjectForm({
		      ...subjectForm,
		      screeningDate: e.target.value
		    })
		  }
		/>

		<input
		  type="date"
		  value={subjectForm.enrollmentDate}
		  onChange={(e) =>
		    setSubjectForm({
		      ...subjectForm,
		      enrollmentDate: e.target.value
		    })
		  }
		/>

		{activeTab === "visits" && (

		  <div className="tab-card">

		    <h3>Upcoming Visits</h3>

		    <p>
		      SUB-001 Visit 3
		    </p>

		    <p>
		      SUB-002 Screening Review
		    </p>

		  </div>

		)}
		{activeTab === "documents" && (

		  <div className="tab-card">

		    <h3>Documents</h3>

		    <ul>
		      <li>Protocol.pdf</li>
		      <li>ICF.pdf</li>
		    </ul>

		  </div>

		)}
		{activeTab === "queries" && (

		  <div className="tab-card">

		    <h3>Pending Queries</h3>

		    <p>Q-101 Open</p>

		    <p>Q-102 In Review</p>

		  </div>

		)}
		
		{activeTab === "regulatory" && (

		  <div className="tab-card">

		    <h3>Regulatory Documents</h3>

		    <p>IEC Approval</p>

		    <p>Site License</p>

		  </div>

		)}
		{activeTab === "reports" && (
		  <div className="tab-card">
		    <h3>Reports</h3>
		    <button>Enrollment Report</button>
		  </div>
		)}

		{showAddSubjectModal && (
		  <div className="modal-overlay">
		    <div className="modal-box">

		      <h2>Add New Subject</h2>

		      <input
		        placeholder="Subject ID"
		        value={subjectForm.subjectId}
		        onChange={(e) =>
		          setSubjectForm({
		            ...subjectForm,
		            subjectId: e.target.value
		          })
		        }
		      />

		      <input
		        placeholder="Site"
		        value={subjectForm.site}
		        onChange={(e) =>
		          setSubjectForm({
		            ...subjectForm,
		            site: e.target.value
		          })
		        }
		      />

		      <select
		        value={subjectForm.status}
		        onChange={(e) =>
		          setSubjectForm({
		            ...subjectForm,
		            status: e.target.value
		          })
		        }
		      >
		        <option>Screening</option>
		        <option>Active</option>
		        <option>Enrolled</option>
		        <option>Completed</option>
		      </select>

		      <div style={{ marginTop: "20px" }}>
		        <button
		          onClick={() =>
		            setShowAddSubjectModal(false)
		          }
		        >
		          Cancel
		        </button>

				<button
				  style={{ marginLeft: "10px" }}
				  onClick={handleSaveSubject}
				>
				  Save Subject
				</button>
		      </div>

		    </div>
		  </div>
		)}
		
		{showEditSubjectModal && selectedSubject && (
		  <div className="modal-overlay">
		    <div className="modal-box">

		      <h2>Edit Subject</h2>

		      <input
		        value={selectedSubject.subjectId}
		        readOnly
		      />

		      <input
		        value={selectedSubject.site}
		      />

		      <select value={selectedSubject.status}>
		        <option>Screening</option>
		        <option>Active</option>
		        <option>Enrolled</option>
		        <option>Completed</option>
		      </select>

		      <div style={{ marginTop: "20px" }}>
		        <button
		          onClick={() => setShowEditSubjectModal(false)}
		        >
		          Close
		        </button>

		        <button style={{ marginLeft: "10px" }}>
		          Update
		        </button>
		      </div>

		    </div>
		  </div>
		)}
			        

		</div>
         </div>
		 </div>
			  );
			  }

export default StudyDashboard;