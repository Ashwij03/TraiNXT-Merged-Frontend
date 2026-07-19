
// newly added

import {
  FiUserPlus,
  FiCalendar,
  FiUpload,
  FiFileText
} from "react-icons/fi";

import "./dashboard.css";

function QuickActionsWidget() {

  return (

    <div className="dashboard-widget">

      <h3>
        Quick Actions
      </h3>

      <div className="quick-grid">

        <button>
          <FiUserPlus />
          Add Subject
        </button>

        <button>
          <FiCalendar />
          Schedule Visit
        </button>

        <button>
          <FiUpload />
          Upload File
        </button>

        <button>
          <FiFileText />
          Create Report
        </button>

      </div>

    </div>

  );
}

export default QuickActionsWidget;