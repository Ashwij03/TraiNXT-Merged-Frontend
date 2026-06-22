import { useMemo } from "react";
import { getStudiesDashboard } from "../services/dashboardService";

function useStudiesDashboard() {
  const data = useMemo(() => getStudiesDashboard(), []);

  return {
    data
  };
}

export default useStudiesDashboard;
