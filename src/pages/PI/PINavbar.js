import ROLES from "../../constants/roles";
import EnterpriseNavbarBase from "../../Components/dashboard/EnterpriseNavbarBase";

function PINavbar(props) {
  console.log("PINavbar props =", props);

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