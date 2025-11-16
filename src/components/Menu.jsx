import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFolderOpen,
  FaCalendarAlt,
  FaStickyNote,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Menu({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { name: "inicio", path: "/", icon: <FaHome /> },
    { name: "proyectos", path: "/projects", icon: <FaFolderOpen /> },
    { name: "calendario", path: "/calendar", icon: <FaCalendarAlt /> },
    { name: "notas", path: "/notes", icon: <FaStickyNote /> },
  ];

  return (
    <div className="sidebar d-flex flex-column justify-content-between p-3">
      <div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`menu-item d-flex align-items-center mb-2 ${
                isActive ? "active" : ""
              }`}
            >
              <span className="icon me-2">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>

      <button onClick={onLogout} className="menu-item logout-btn mt-3">
        <FaSignOutAlt className="me-2" /> Cerrar sesión
      </button>
    </div>
  );
}
