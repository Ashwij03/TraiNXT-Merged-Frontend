import SiteStaffDashboardLayout from "../../Components/dashboard/SiteStaffDashboardLayout";
import RoleLiveChatPage from "../../Components/common/RoleLiveChatPage";
import ROLES from "../../constants/roles";
import useLiveChatNavigation from "../../hooks/useLiveChatNavigation";

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
