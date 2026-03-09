import { useAppContext } from "../../context/AppContext";
import AdminHeader from "./AdminHeader";
import OwnerHeader from "./OwnerHeader";
import PublicHeader from "./PublicHeader";
import TenantHeader from "./TenantHeader";

const Header = () => {
  const { user, logout, appLoading } = useAppContext();
  // if (appLoading) return null;

  if (!user) return <PublicHeader />;
  switch (user.role) {
    case "owner":
      return <OwnerHeader user={user} logout={logout} />;
    case "admin":
      return <AdminHeader user={user} logout={logout}/>
    case "tenant":
    default:
      return <TenantHeader user={user} logout={logout} />;
  }
};

export default Header;
