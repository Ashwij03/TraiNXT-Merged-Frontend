import ROLES from "../../shared/constants/roles";
import EnterpriseNavbarBase from "../../shared/components/dashboard/shared/EnterpriseNavbarBase.js";


function AdminNavbar(props) {
  return (
    <EnterpriseNavbarBase
      {...props}
      layoutRole={ROLES.ADMIN}
      liveChatPath="/admin-livechat"
      navbarClassName="admin-navbar enterprise-header--role-branded"
    />
  );
}

export default AdminNavbar;
