import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaTachometerAlt,
  FaBook,
  FaChartLine,
  FaFileAlt,
  FaBell,
  FaCog,
  FaFolderOpen,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";
function CROSidebar() {
	
const [studiesOpen, setStudiesOpen] = useState(true);
const [studyBinderOpen, setStudyBinderOpen] = useState(true);

	return (
	  <div className="cro-sidebar">

	    <div className="sidebar-logo">
	      TriaNXT
	    </div>

	    <ul className="sidebar-menu">

	      <li>
	        <NavLink to="/cro-dashboard">
	          <FaTachometerAlt />
	          Dashboard
	        </NavLink>
	      </li>

		  <div
		    className="sidebar-link"
		    onClick={() => setStudiesOpen(!studiesOpen)}
		  >
		    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
		      <FaBook />
		      <span>Studies</span>
		    </div>

		    {studiesOpen ? (
		      <FaChevronDown />
		    ) : (
		      <FaChevronRight />
		    )}
		  </div>
		  
		  {studiesOpen && (
		    <div className="sidebar-submenu">

			<div
			  className="submenu-parent"
			  onClick={() =>
			    setStudyBinderOpen(!studyBinderOpen)
			  }
			>
			  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
			    <FaFolderOpen />
			    <span>Study Binder</span>
			  </div>

			  {studyBinderOpen ? (
			    <FaChevronDown />
			  ) : (
			    <FaChevronRight />
			  )}
			</div>
		      
			  {studyBinderOpen && (
			    <div className="nested-submenu">

			      <NavLink
			        to="/subjects"
			        className="submenu-item"
			      >
			        Subjects
			      </NavLink>

			      <NavLink
			        to="/screening"
			        className="submenu-item"
			      >
			        Screening
			      </NavLink>

			      <NavLink
			        to="/enrollment"
			        className="submenu-item"
			      >
			        Enrollment
			      </NavLink>

			      <NavLink
			        to="/visits"
			        className="submenu-item"
			      >
			        Visits
			      </NavLink>

			      <NavLink
			        to="/comments"
			        className="submenu-item"
			      >
			        Comments
			      </NavLink>

			      <NavLink
			        to="/files"
			        className="submenu-item"
			      >
			        Files
			      </NavLink>

			    </div>
			  )}
		    </div>
		  )}
		  <li>
		    <NavLink to="/site-performance">
		      <FaChartLine />
		      Site Performance
		    </NavLink>
		  </li>

		  <li>
		    <NavLink to="/reports">
		      <FaFileAlt />
		      Reports
		    </NavLink>
		  </li>

		  <li>
		    <NavLink to="/notifications">
		      <FaBell />
		      Notifications
		    </NavLink>
		  </li>

		  <li>
		    <NavLink to="/settings">
		      <FaCog />
		      Settings
		    </NavLink>
		  </li>
		  
	    </ul>

	  </div>
	
  );
}

export default CROSidebar;