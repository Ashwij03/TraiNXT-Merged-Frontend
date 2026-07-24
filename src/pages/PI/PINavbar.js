import ROLES from "../../constants/roles";
import EnterpriseNavbarBase from "../../components/dashboard/shared/EnterpriseNavbarBase";

function PINavbar(props) {
 

  return (
    <EnterpriseNavbarBase
      {...props}
      layoutRole={ROLES.PI}
      liveChatPath="/pi-livechat"
      navbarClassName="pi-navbar enterprise-header--role-branded"
    />
  );
}

export default PINavbar;