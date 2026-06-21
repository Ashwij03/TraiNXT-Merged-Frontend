import "./StudyVisits.css";

function StudyVisits({ setActiveTab }) {

  const visits = [
    {
      id: "VIS-001",
      subject: "SUB-001",
      visit: "Screening",
      date: "2026-06-10",
      status: "Completed"
    },
    {
      id: "VIS-002",
      subject: "SUB-002",
      visit: "Baseline",
      date: "2026-06-15",
      status: "Scheduled"
    },
    {
      id: "VIS-003",
      subject: "SUB-003",
      visit: "Week 4",
      date: "2026-06-20",
      status: "Pending"
    }
  ];

  return (

    <div className="visits-page">

      <button
        className="back-btn"
        onClick={() =>
          setActiveTab("Overview")
        }
      >
        ← Back
      </button>

      <h2>
        Visits Management
      </h2>

      <div className="visit-table-wrapper">

        <table className="visit-table">

          <thead>
            <tr>
              <th>Visit ID</th>
              <th>Subject</th>
              <th>Visit</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {visits.map((visit) => (

              <tr key={visit.id}>

                <td>{visit.id}</td>

                <td>{visit.subject}</td>

                <td>{visit.visit}</td>

                <td>{visit.date}</td>

                <td>
                  <span
                    className={`status-badge ${visit.status.toLowerCase()}`}
                  >
                    {visit.status}
                  </span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default StudyVisits;