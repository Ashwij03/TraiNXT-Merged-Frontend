
// newly added

import { useEffect, useState } from "react";
import { getStudiesDashboard } from "../services/dashboardService";

function useStudiesDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const response =
      await getStudiesDashboard();

    setData(response);
  };

  return {
    data,
  };
}

export default useStudiesDashboard;