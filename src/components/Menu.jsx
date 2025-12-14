import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFolderOpen,
  FaCalendarAlt,
  FaStickyNote,
  FaClock,      
  FaSignOutAlt,
  FaComments,
} from "react-icons/fa";
import logo from "../assets/logo_web.svg";
import "../App.css";

export default function Menu({ onLogout, active = "inicio" }) {
  const location = useLocation();

  const menuItems = [
    { name: "Inicio", path: "/", icon: <FaHome /> },
    { name: "Proyectos", path: "/projects", icon: <FaFolderOpen /> },
    { name: "Calendario", path: "/calendar", icon: <FaCalendarAlt /> },
    { name: "Notas", path: "/notes", icon: <FaStickyNote /> },
    { name: "Tiempo", path: "/tiempo", icon: <FaClock /> }, 
    {name:"Mensajes", path:"/projects/:id/chat", icon:<FaComments />},
  ];

  return (
    <>
      <div className="sidebar d-flex flex-column justify-content-between p-4 desktop-sidebar">
        <div>
          <div className="logo-container mb-4 text-center">
            <div className="logo-circle mx-auto mb-2">
              <img src={logo} alt="Logo" className="logo-img" />
            </div>
            <h5 className="fw-bold text-white">Gestya</h5>
          </div>

          <div className="flex-grow-1">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                active.toLowerCase() === item.name.toLowerCase();
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`menu-item d-flex align-items-center py-2 px-3 rounded mb-2 ${
                    isActive ? "active" : ""
                  }`}
                >
                  <span className="me-2">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="menu-item logout-btn d-flex align-items-center py-2 px-3 rounded mt-3"
        >
          <FaSignOutAlt className="me-2" />
          Cerrar sesión
        </button>
      </div>

      <nav className="mobile-bottom-nav">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            active.toLowerCase() === item.name.toLowerCase();
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`mobile-nav-item ${isActive ? "active" : ""}`}
              title={item.name}
            >
              <div className="mobile-icon">{item.icon}</div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
