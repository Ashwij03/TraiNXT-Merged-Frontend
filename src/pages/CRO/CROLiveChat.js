import CROLayout from "./CROLayout";
import RoleLiveChatPage from "../../components/common/RoleLiveChatPage";
import ROLES from "../../constants/roles";
import useLiveChatNavigation from "../../hooks/useLiveChatNavigation";

function CROLiveChat() {
  const { returnFromLiveChat, backLabel } = useLiveChatNavigation("/cro-livechat");

  return (
    <CROLayout>
      <RoleLiveChatPage
        role={ROLES.CRO}
        onBack={returnFromLiveChat}
        backLabel={backLabel}
      />
    </CROLayout>
  );
}

export default CROLiveChat;
