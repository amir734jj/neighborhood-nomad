import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../common";
import {useAuthStore} from "../../../state";
import {logout} from "../../../api";
import {pages} from "../../../data";

export const Logout = () => {
  const authContext = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await logout();
      authContext.logout();
      navigate(pages.root);
    };

    handleLogout();
  }, [authContext]);

  return <Spinner />;
};