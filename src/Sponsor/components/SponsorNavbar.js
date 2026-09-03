<import ROLES from "../../../constants/roles";
import EnterpriseNavbarBase from "../../shared/components/dashboard/shared/EnterpriseNavbarBase.js";

import ROLES from "../../shared/constants/roles";
import EnterpriseNavbarBase from "../../shared/components/dashboard/shared/EnterpriseNavbarBase";

function SponsorNavbar(props) {
  return (
    <EnterpriseNavbarBase
      {...props}
      layoutRole={ROLES.SPONSOR}
      liveChatPath="/live-chat"
      navbarClassName="sponsor-navbar enterprise-header--role-branded"
    />
  );
}

export default SponsorNavbar;
