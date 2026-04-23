import React, { useEffect } from 'react'
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import Navbar from './Navbar';
import SideMenu from "./SideMenu";
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, activeMenu}) => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      navigate("/login"); // force login redirect
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
    
  return (
    <div className="">
        <Navbar activeMenu={activeMenu}/>
        {user && (
            <div className="flex">
                <div className="max-[1080px]:hidden">
                    <SideMenu activeMenu={activeMenu} />
                </div>
        
                <div className="grow mx-5">{children}</div>
            </div>
        )}
    </div>
  );
};

export default DashboardLayout