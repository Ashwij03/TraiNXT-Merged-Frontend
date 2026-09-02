import AppLayout from "./AppLayout";
import RoleLiveChatPage from "../../shared/components/RoleLiveChatPage";
import ROLES from "../../shared/constants/roles";
import useLiveChatNavigation from "../../shared/hooks/useLiveChatNavigation";

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
