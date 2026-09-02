import SiteStaffDashboardLayout from "../components/SiteStaffDashboardLayout";
import RoleLiveChatPage from "../../shared/components/RoleLiveChatPage";
import ROLES from "../../shared/constants/roles";
import useLiveChatNavigation from "../../shared/hooks/useLiveChatNavigation";

function SiteStaffLiveChat() {
  const { returnFromLiveChat, backLabel } = useLiveChatNavigation(
    "/site-staff-livechat"
  );

  return (
    <SiteStaffDashboardLayout>
      <RoleLiveChatPage
        role={ROLES.SITE_STAFF}
        onBack={returnFromLiveChat}
        backLabel={backLabel}
      />
    </SiteStaffDashboardLayout>
  );
}

export default SiteStaffLiveChat;
