import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  // Fetch user from server
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("api/user/data");

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        logout();
      } 
    } catch (error) {
      toast.error(error.message);
      logout();
    } finally {
      setAppLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    axios.defaults.headers.common["Authorization"] = "";

    toast.success("You have been logged out");
    navigate("/");
  };

  // Load cached auth on startup
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = storedToken;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedToken) {
      fetchUser();
    } else {
      setAppLoading(false);
    }
  }, []);

  const value = {
    navigate,
    axios,
    user,
    setUser,
    token,
    setToken,
    fetchUser,
    logout,
    appLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};