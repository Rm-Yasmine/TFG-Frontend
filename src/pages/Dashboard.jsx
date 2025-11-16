import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import "../App.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await API.get("/me");
      setUser(data.data);
      fetchProjects();
      fetchTasks(data.data.id);
      fetchSessions();
    } catch {
      navigate("/login");
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await API.get("/projects/sorted-by-end-date");
      if (data.status === "success") {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
    }
  };

  const fetchTasks = async (userId) => {
    try {
      const { data } = await API.get(`/tasks?assignee_id=${userId}`);
      if (data.status === "success") {
        setTasks(data.data);
      }
    } catch (error) {
      console.error("Error al obtener tareas:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data } = await API.get("/time-sessions");
      if (data.status === "success") {
        setSessions(data.data);
      }
    } catch (error) {
      console.error("Error al obtener sesiones:", error);
    }
  };

  const startSession = async () => {
    if (!selectedProjectId) return alert("Selecciona un proyecto");
    try {
      const { data } = await API.post("/time-sessions/start", {
        project_id: selectedProjectId,
      });
      setActiveSessionId(data.data.id);
      fetchSessions();
    } catch (err) {
      console.error("Error iniciando sesión:", err);
    }
  };

  const stopSession = async () => {
    try {
      const { data } = await API.post("/time-sessions/stop", {
        session_id: activeSessionId,
      });
      setActiveSessionId(null);
      fetchSessions();
    } catch (err) {
      console.error("Error deteniendo sesión:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/logout");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const formatDuration = (start, end) => {
    if (!end) return "En curso...";
    const diff = (new Date(end) - new Date(start)) / 1000;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = Math.floor(diff % 60);
    return `${h}h ${m}m ${s}s`;
  };

  if (!user) return <p className="text-center mt-5">Cargando...</p>;

  return (
    <div className="dashboard-container d-flex">
      <Menu active="inicio" onLogout={handleLogout} />

      <div className="content flex-grow-1 p-4">
        <h2 className="fw-bold mb-4">Bienvenida, {user.name}</h2>

        <h5 className="fw-semibold mb-3">Proyectos recientes</h5>
        <div className="projects-scroll d-flex overflow-auto mb-4 w-100">
          {projects.length > 0 ? (
            projects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="card shadow-sm border-0 me-3 flex-shrink-0 project-card"
              >
                <div className="card-body d-flex flex-column justify-content-between h-100">
                  <div>
                    <h5 className="fw-bold text-purple mb-2">
                      {project.title}
                    </h5>
                    <p className="text-muted small mb-3">
                      {project.description || "Sin descripción"}
                    </p>
                  </div>
                  <div>
                    <p className="small mb-1">
                      <strong>Inicio:</strong>{" "}
                      {new Date(project.start_date).toLocaleDateString()}
                    </p>
                    <p className="small mb-0">
                      <strong>Fin:</strong>{" "}
                      {new Date(project.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-secondary">No tienes proyectos todavía.</div>
          )}
        </div>

        {/* Tareas asignadas */}
        <div className="row g-3">
          <div className="col-md-8">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="fw-semibold mb-3">Mis tareas asignadas</h5>
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border-bottom py-2 d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">{task.title}</div>
                        <small className="text-muted">
                          Proyecto: {task.project?.title || "Sin proyecto"}
                        </small>
                      </div>
                      <span
                        className={`badge ${
                          task.status === "COMPLETED"
                            ? "bg-success"
                            : task.status === "IN_PROGRESS"
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No tienes tareas asignadas.</p>
                )}
              </div>
            </div>
          </div>

          {/* Control de tiempo */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">Control de tiempo</h6>
                <select
                  className="form-select mb-3"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">Selecciona un proyecto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                {activeSessionId ? (
                  <button
                    className="btn btn-danger w-100"
                    onClick={stopSession}
                  >
                    Detener
                  </button>
                ) : (
                  <button
                    className="btn btn-primary w-100"
                    onClick={startSession}
                  >
                    Iniciar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="card shadow-sm border-0 rounded-4 mt-4">
          <div className="card-body">
            <h6 className="fw-semibold mb-3">Historial de sesiones</h6>
            {sessions.length > 0 ? (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className="border-bottom py-2 d-flex justify-content-between"
                >
                  <div>
                    <strong>
                      {s.project?.title || "Proyecto desconocido"}
                    </strong>
                    <div className="text-muted small">
                      Inicio: {new Date(s.start_time).toLocaleString()}
                      {s.end_time && (
                        <> — Fin: {new Date(s.end_time).toLocaleString()}</>
                      )}
                    </div>
                  </div>
                  <span className="badge bg-light text-dark">
                    {formatDuration(s.start_time, s.end_time)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted">No hay sesiones registradas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
