import AdminDashboardLayout from "../../Components/dashboard/AdminDashboardLayout";
import RoleLiveChatPage from "../../Components/common/RoleLiveChatPage";
import ROLES from "../../constants/roles";
import useLiveChatNavigation from "../../hooks/useLiveChatNavigation";

function AdminLiveChat() {
  const { returnFromLiveChat, backLabel } = useLiveChatNavigation("/admin-livechat");

  return (
    <AdminDashboardLayout>
      <RoleLiveChatPage
        role={ROLES.ADMIN}
        onBack={returnFromLiveChat}
        backLabel={backLabel}
      />
    </AdminDashboardLayout>
  );
}

export default AdminLiveChat;
