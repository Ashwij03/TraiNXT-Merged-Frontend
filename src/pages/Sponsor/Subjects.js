import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


import AppLayout from "./AppLayout";
import { resolveSiteDisplay } from "../../utils/siteDisplay";
import { getStudies } from "../../services/studyService";
import "./Subjects.css";


function Subjects() {
	const navigate = useNavigate();

	const [search, setSearch] = useState("");
	const [searchTerm, setSearchTerm] = useState("");;

	const siteSources = useMemo(() => getStudies(), []);
	const displaySite = (value) =>
	  value
	    ? resolveSiteDisplay(value, {
	        sources: siteSources,
	        fallback: value
	      })
	    : "—";
	

  
	const subjects = [
	  {
	    id: "SUB-1001",
	    study: "Diabetes Study",
	    site: "Apollo Hospital",
	    pi: "Dr Rao",
	    status: "Active",
	    screeningDate: "10-Jan-2026",
	    enrollmentDate: "15-Jan-2026",
	    visit: "Visit 3",
	    visitStatus: "Completed",
	  },
	  {
	    id: "SUB-1002",
	    study: "Oncology Trial",
	    site: "Care Hospital",
	    pi: "Dr Kumar",
	    status: "Enrolled",
	    screeningDate: "12-Jan-2026",
	    enrollmentDate: "18-Jan-2026",
	    visit: "Visit 2",
	    visitStatus: "Scheduled",
	  },
	  {
	    id: "SUB-1003",
	    study: "Cardio Study",
	    site: "AIG Hospital",
	    pi: "Dr Sharma",
	    status: "Screened",
	    screeningDate: "15-Jan-2026",
	    enrollmentDate: "-",
	    visit: "Screening",
	    visitStatus: "Pending",
	  }
	];
	const filteredSubjects = subjects.filter(
	  (subject) =>
	    subject.id
	      .toLowerCase()
	      .includes(searchTerm.toLowerCase()) ||

	    subject.study
	      .toLowerCase()
	      .includes(searchTerm.toLowerCase()) ||

	    subject.site
	      .toLowerCase()
	      .includes(searchTerm.toLowerCase())
	);
      

  return (

    <AppLayout>

      <div className="subjects-page">

	  <div className="page-header">
	    <div>
	      <h1>Subjects</h1>
	      <p>
	        Manage all subjects across sponsor studies
	      </p>
	    </div>
	  </div>
		<div className="subjects-toolbar">

		<input
		  type="text"
		  placeholder="Search Subject ID..."
		  value={search}
		  onChange={(e) => setSearch(e.target.value)}
		  onKeyDown={(e) => {
		    if (e.key === "Enter") {
		      setSearchTerm(search);
		    }
		  }}
		/>

		 

		</div>
          <h1>Subjects Management</h1>
        

        <div className="subjects-card">

          <table className="subjects-table">

            <thead>

              <tr>
			  <th>Subject ID</th>
			  <th>Study</th>
			  <th>Site</th>
			  <th>PI</th>
			  <th>Status</th>
			  <th>Screening Date</th>
			  <th>Enrollment Date</th>
			  <th>Current Visit</th>
			  <th>Visit Status</th>
			  <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredSubjects.map((subject) => (

                <tr key={subject.id}>

				<td>{subject.id}</td>
				<td>{subject.study}</td>
				<td>{displaySite(subject.site)}</td>
				<td>{subject.pi}</td>

				<td>
				  <span
				    className={
				      subject.status === "Active"
				        ? "status-active"
				        : subject.status === "Enrolled"
				        ? "status-enrolled"
				        : "status-screened"
				    }
				  >
				    {subject.status}
				  </span>
				</td>

				<td>{subject.screeningDate}</td>
				<td>{subject.enrollmentDate}</td>
				<td>{subject.visit}</td>
				<td>{subject.visitStatus}</td>

				<td>
				  <button
				    className="view-btn"
					onClick={() =>
					  navigate(`/subject/${subject.id}`, {
					    state: {
					      from: "/subjects"
					    }
					  })
					}
				  >
				    View
				  </button>
				</td>
                </tr>

              ))}

            </tbody>

          </table>

		          </div> {/* subjects-card */}

		        </div> {/* subjects-page */}

		      </AppLayout>

		    );

		  }

		  export default Subjects;