import AppLayout from "./AppLayout";
import RoleLiveChatPage from "../../components/common/RoleLiveChatPage";
import ROLES from "../../constants/roles";
import useLiveChatNavigation from "../../hooks/useLiveChatNavigation";

function LiveChat() {
  const { returnFromLiveChat, backLabel } = useLiveChatNavigation("/live-chat");

  return (
    <AppLayout>
      <RoleLiveChatPage
        role={ROLES.SPONSOR}
        onBack={returnFromLiveChat}
        backLabel={backLabel}
      />
    </AppLayout>
  );
}

export default LiveChat;
