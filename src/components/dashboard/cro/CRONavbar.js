import ROLES from "../../../constants/roles";
import EnterpriseNavbarBase from "../shared/EnterpriseNavbarBase";

function CRONavbar(props) {
  return (
    <EnterpriseNavbarBase
      {...props}
      layoutRole={ROLES.CRO}
      liveChatPath="/cro-livechat"
      navbarClassName="cro-navbar enterprise-header--role-branded"
    />
  );
}

export default CRONavbar;
