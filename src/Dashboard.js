import Navbar from "./Navbar";
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Comments from "./pages/shared/operations/Comments";
import ProgressNotes from "./pages/shared/operations/ProgressNotes";
import FileDetails from "./pages/shared/documents/FileDetails";
import StudyLogs from "./pages/shared/operations/StudyLogs";
import { getSubscription, saveSubscription } from "./services/subscriptionService";
function Dashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("Guest");
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  
  const [studies] = useState([
    {
      id: "747-303",
      title: "OBETICHOLIC ACID (OCA)",
      org: "Test Organization",
      location: "Cambridge, MA",
      enrolled: 1,
      image: null
    },
    {
      id: "05151",
      title: "SeptiTest",
      org: "Test Organization",
      location: "Cambridge, MA",
      enrolled: 8,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Abbott_Laboratories_logo.svg/2560px-Abbott_Laboratories_logo.svg.png"
    }
  ]);

  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: "Subject 01",
      visits: ["visit1", "visit2", "visit3"]
    }
  ]);

  const [openESource, setOpenESource] = useState(true);
  const [openSubject, setOpenSubject] = useState(1);
  const [openVisits, setOpenVisits] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedPage, setSelectedPage] = useState("home");
 
  const [searchText, setSearchText] = useState("");
  const [subscription, setSubscription] = useState(null);
const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const [subscriptionForm, setSubscriptionForm] = useState(null);
const [subscriptionErrors, setSubscriptionErrors] = useState({});
const [subscriptionSavedMessage, setSubscriptionSavedMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
	
    if (user && user.name) setName(user.name);
}, []);
useEffect(() => {
  setSubscription(getSubscription());
}, []);

const currentUser =
  JSON.parse(
	localStorage.getItem(
	  "currentUser"
	)
  );

const permissions =
  currentUser
	?.permissions || [];

const canViewSubjects =
  currentUser?.role ===
	"Admin" ||
  permissions.includes(
	"subject.view"
  );

const canViewVisits =
  currentUser?.role ===
	"Admin" ||
  permissions.includes(
	"visit.view"
  );

const canViewFiles =
  currentUser?.role ===
	"Admin" ||
  permissions.includes(
	"document.view"
  );
  
const addSubject = () => {
	
	const newId = subjects.length + 1;
    setSubjects([
      ...subjects,
      {
        id: newId,
        name: `Subject ${newId}`,
        visits: ["visit1", "visit2", "visit3"] // ✅ multiple visits
      }
    ]);
  };
  const removeSubject = (id) => {
  	  setSubjects(subjects.filter((sub) => sub.id !== id));
  	};
	const filteredFiles =
	  files[selectedVisit]?.filter((file) =>
	    file.name.toLowerCase().includes(searchText.toLowerCase())
	  ) || [];
	  const deleteFile = (indexToDelete) => {
	    setFiles((prev) => ({
	      ...prev,
	      [selectedVisit]: prev[selectedVisit].filter(
	        (_, index) => index !== indexToDelete
	      )
	    }));
	  };
	 const openSubscriptionModal = () => {
  setSubscriptionForm({ ...subscription });
  setSubscriptionErrors({});
  setShowSubscriptionModal(true);
};

const closeSubscriptionModal = () => {
  setShowSubscriptionModal(false);
  setSubscriptionForm(null);
  setSubscriptionErrors({});
};

const handleSubscriptionFieldChange = (field, value) => {
  setSubscriptionForm((prev) => ({
    ...prev,
    [field]: value
  }));
};

const validateSubscriptionForm = (form) => {
  const errors = {};

  if (!form.plan) errors.plan = "Subscription Plan is required";
  if (!form.status) errors.status = "Subscription Status is required";
  if (!form.startDate) errors.startDate = "Start Date is required";
  if (!form.endDate) errors.endDate = "End Date is required";

  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End Date cannot be earlier than Start Date";
  }

  if (!(Number(form.maxUsers) > 0)) {
    errors.maxUsers = "Maximum Users must be greater than 0";
  }

  if (!(Number(form.maxStudies) > 0)) {
    errors.maxStudies = "Maximum Studies must be greater than 0";
  }

  if (!(Number(form.storageLimitGb) > 0)) {
    errors.storageLimitGb = "Storage Limit must be greater than 0";
  }

  return errors;
};

const handleSaveSubscription = () => {
  const errors = validateSubscriptionForm(subscriptionForm);

  if (Object.keys(errors).length > 0) {
    setSubscriptionErrors(errors);
    return;
  }

  const updated = saveSubscription({
    plan: subscriptionForm.plan,
    status: subscriptionForm.status,
    startDate: subscriptionForm.startDate,
    endDate: subscriptionForm.endDate,
    maxStudies: Number(subscriptionForm.maxStudies),
    maxUsers: Number(subscriptionForm.maxUsers),
    storageLimitGb: Number(subscriptionForm.storageLimitGb),
    autoRenewal: subscriptionForm.autoRenewal,
    notes: subscriptionForm.notes || ""
  });

  setSubscription(updated);
  setShowSubscriptionModal(false);
  setSubscriptionForm(null);
  setSubscriptionSavedMessage("Subscription updated successfully");

  setTimeout(() => setSubscriptionSavedMessage(""), 3000);
};
	  
  return (
    <div className="dashboard">
	<Navbar
	  name={name}
	  setSelectedPage={setSelectedPage}
	  searchText={searchText}
	  setSearchText={setSearchText}
	/>

      <div className="main-layout">

        {/* SIDEBAR */}
        <div className="sidebar">

          <div
            className="menu-item"
            onClick={() => setOpenESource(!openESource)}
          >
            📂 eSource {openESource ? "▾" : "▸"}
          </div>

          {openESource && (
            <div className="submenu">

              {
				  canViewSubjects && (
				    <button
				      onClick={
				        addSubject
				      }
				    >
				      + Add Subject
				    </button>
				  )
				}

              {subjects.map((sub) => (
                <div key={sub.id}>
				

				<div className="submenu-item">
				  <div
				    style={{ display: "flex", justifyContent: "space-between", width: "100%" }}
				    onClick={() =>
				      setOpenSubject(openSubject === sub.id ? null : sub.id)
				    }
				  >
				  <span>📘 {sub.name}</span>

				  <button
				    type="button"
				    className="delete-btn"
				    onClick={(e) => {
				      e.stopPropagation();
				      removeSubject(sub.id);
				    }}
				  >
				    ✖
				  </button>
				  </div>
				</div>

                  {openSubject === sub.id && (
                    <div className="sub-submenu">

                      {/* Screening */}
                      <div
                        onClick={() => {
                          setSelectedPage("screening");
                          setSelectedVisit("screening");
                        }}
                      >
                        Screening
                      </div>

                      <div>Enrollment</div>

                      {/* Study Visits */}
                      <div onClick={() => setOpenVisits(!openVisits)}>
                        Study visits {openVisits ? "▾" : "▸"}
                      </div>

					  {openVisits && (
					    <div className="sub-submenu">
					      {
							canViewVisits &&
						  	sub.visits.map((visit, i) => (
					        <div
					          key={i}
					          className={`visit-item ${
					            selectedVisit === visit ? "active-visit" : ""
					          }`}
					          onClick={() => {
					            setSelectedVisit(visit);
					            setSelectedPage("dashboard");
					          }}
					        >
					          📄 {visit}
					        </div>
					      ))}
					    </div>
					  )}

                      <div>End of treatment</div>

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

          {/* OTHER MENU ITEMS */}
           {
			  canViewFiles && (
			    <div
			      className="menu-item"
			    >
			      📁 eISF
			    </div>
			  )
			}
          {
			  canViewFiles && (
			    <div
			      className="menu-item"
			    >
			      📄 ICF
			    </div>
			  )
			}
          {
			  currentUser?.role ===
			    "Admin" && (
			    <div
			      className="menu-item"
			    >
			      📦 Study Folder
			    </div>
			  )
			}

        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
         

          {/* HOME */}
          {selectedPage === "home" && (
            <div className="home-container">
				{subscription && (
  <div className="subscription-overview">
    <div className="subscription-overview-header">
      <h2>Subscription</h2>

      <button
        type="button"
        className="edit-subscription-btn"
        onClick={openSubscriptionModal}
      >
        Edit Subscription
      </button>
    </div>

    {subscriptionSavedMessage && (
      <div className="subscription-success-msg">
        {subscriptionSavedMessage}
      </div>
    )}

    <div className="subscription-details-grid">

      <div className="subscription-detail">
        <span className="subscription-detail-label">
          Current Plan
        </span>
        <span className="subscription-detail-value">
          {subscription.plan}
        </span>
      </div>

      <div className="subscription-detail">
        <span className="subscription-detail-label">
          Status
        </span>
        <span
          className={`subscription-status-badge subscription-status-${subscription.status.toLowerCase()}`}
        >
          {subscription.status}
        </span>
      </div>

      <div className="subscription-detail">
        <span className="subscription-detail-label">
          Expiry Date
        </span>
        <span className="subscription-detail-value">
          {subscription.endDate}
        </span>
      </div>

      <div className="subscription-detail">
        <span className="subscription-detail-label">
          Users
        </span>
        <span className="subscription-detail-value">
          {subjects.length} / {subscription.maxUsers}
        </span>
      </div>

      <div className="subscription-detail">
        <span className="subscription-detail-label">
          Studies
        </span>
        <span className="subscription-detail-value">
          {studies.length} / {subscription.maxStudies}
        </span>
      </div>

      <div className="subscription-detail">
        <span className="subscription-detail-label">
          Storage
        </span>
        <span className="subscription-detail-value">
          {subscription.storageLimitGb} GB limit
        </span>
      </div>

    </div>
  </div>
)}
 
              <h2>My Studies</h2>

              <div className="study-cards">
                {studies.map((study) => (
                  <div
                    className="card"
                    key={study.id}
					onClick={() => navigate(`/study/${study.id}`)}
                  >
                    <div className="card-header">{study.id}</div>

                    <div className="card-body">
                      {study.image ? (
                        <img src={study.image} alt="" />
                      ) : (
                        <div className="card-image">No Image</div>
                      )}
                      <h4>{study.title}</h4>
                    </div>

                    <div className="card-footer">
                      <p>{study.org}</p>
                      <p>{study.location}</p>
                      <span>{study.enrolled} ENROLLED</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

		  {/* UPLOAD SECTION */}
		  {(selectedPage === "dashboard" || selectedPage === "screening") 
		  && selectedVisit && (
		    <div className="upload-container">

		      {/* Upload Box */}
		      <div
		        className="upload-box"
		        onClick={() => document.getElementById("fileInput").click()}
		        onDragOver={(e) => e.preventDefault()}
		        onDrop={(e) => {
		          e.preventDefault();

		          if (!selectedVisit) return;

		          const droppedFiles = Array.from(e.dataTransfer.files);

		          setUploading(true);

		          setTimeout(() => {
		            setFiles((prev) => ({
		              ...prev,
		              [selectedVisit]: [
		                ...(prev[selectedVisit] || []),
		                ...droppedFiles
		              ]
		            }));

		            setUploading(false);
		          }, 800);
		        }}
		      >

		        {/* ✅ GitHub style UI */}
		        <div className="upload-content">
		          <div className="upload-icon">📄</div>

		          <h2>
		            {uploading
		              ? "Uploading..."
		              : "Drag files here to add them"}
		          </h2>

		          <p>
		            Or <span className="browse-text">choose your files</span>
		          </p>
		        </div>

		        {/* Hidden file input */}
		        <input
		          id="fileInput"
		          type="file"
		          multiple
		          onChange={(e) => {
		            if (!selectedVisit) return;

		            const selectedFiles = Array.from(e.target.files);

		            setUploading(true);

		            setTimeout(() => {
		              setFiles((prev) => ({
		                ...prev,
		                [selectedVisit]: [
		                  ...(prev[selectedVisit] || []),
		                  ...selectedFiles
		                ]
		              }));

		              setUploading(false);
		              e.target.value = "";
		            }, 800);
		          }}
		        />
		      </div>

		      {/* FILE LIST */}
			  {files[selectedVisit] && files[selectedVisit].length > 0 && (
			    <div className="file-list">
			      <h3>Uploaded Files</h3>

			      {filteredFiles.map((file, index) => (
					<div className="file-item" key={index}>
					  
					  {/* CLICK TO OPEN */}
					  <div
					    className="file-left"
					    onClick={() => {
					      const fileURL = URL.createObjectURL(file);
					      window.open(fileURL);
					    }}
					  >
					    📄 {file.name}
					  </div>

					  {/* RIGHT SIDE */}
					  <div className="file-right">
					    <span className="file-number">{index + 1}</span>

					    <button
					      className="delete-file-btn"
					      onClick={() => deleteFile(index)}
					    >
					      ✖
					    </button>
					  </div>

					</div>
			      ))}

			      {/* ✅ ADD HERE */}
			      {filteredFiles.length === 0 && searchText && (
			        <p style={{ textAlign: "center", color: "gray" }}>
			          No files found
			        </p>
			      )}

			    </div>
			  )}

		    </div>
		  )}
{/* COMMENTS */}
{selectedPage === "comments" && (
  <Comments />
)}

{/* PROGRESS NOTES */}
{selectedPage === "progress-notes" && (
  <ProgressNotes />
)}

{/* FILE DETAILS */}
{selectedPage === "files" && (
  <FileDetails />
)}

{/* STUDY LOGS */}
{selectedPage === "logs" && (
  <StudyLogs />
)}
        </div>

      </div>
	  {showSubscriptionModal && subscriptionForm && (
  <div className="modal-overlay">
    <div className="modal-box subscription-modal-box">

      ... Claude ichina modal code motham ...

    </div>
  </div>
)}
    </div>
  );
}

export default Dashboard;