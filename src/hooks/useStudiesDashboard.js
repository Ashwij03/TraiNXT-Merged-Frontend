import { useCallback, useEffect, useState } from "react";
import { getStudiesDashboard } from "../shared/pages/EISF/services/dashboardService.js";

function useStudiesDashboard() {
  const [data, setData] = useState(() => getStudiesDashboard());

  const refresh = useCallback(() => {
    setData(getStudiesDashboard());
  }, []);

  useEffect(() => {
    window.addEventListener("comments-updated", refresh);
    window.addEventListener("sponsor-data-updated", refresh);

    return () => {
      window.removeEventListener("comments-updated", refresh);
      window.removeEventListener("sponsor-data-updated", refresh);
    };
  }, [refresh]);

  return {
    data,
    refresh,
  };
}

export default useStudiesDashboard;
