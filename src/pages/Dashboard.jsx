import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import "../App.css";
import { FaPlay, FaStop } from "react-icons/fa";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);

  const [visibleSessions, setVisibleSessions] = useState(5);
  const [showAll, setShowAll] = useState(false);

  const [liveTime, setLiveTime] = useState("00:00:00");
  const timerRef = useRef(null);

  const navigate = useNavigate();

  const toLocal = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString + " UTC");
  };

  
  useEffect(() => {
    fetchUser();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const active = sessions.find((s) => !s.end_time);
    if (active) {
      setActiveSessionId(active.id);
      startLiveTimer(active.start_time);
    } else {
      setActiveSessionId(null);
      stopLiveTimer();
      setLiveTime("00:00:00");
    }
  }, [sessions]);

  const fetchUser = async () => {
    try {
      const { data } = await API.get("/me");
      setUser(data.data);
      await fetchProjects();
      await fetchTasks(data.data.id);
      await fetchSessions();
    } catch {
      navigate("/login");
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await API.get("/projects/sorted-by-end-date");
      if (data.status === "success") {
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error("Error proyectos:", error);
    }
  };

  const fetchTasks = async (userId) => {
    try {
      const { data } = await API.get(`/tasks?assignee_id=${userId}`);
      if (data.status === "success") {
        setTasks(data.data || []);
      }
    } catch (error) {
      console.error("Error tareas:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data } = await API.get("/time-sessions");
      if (data.status === "success") {
        const list = (data.data || []).sort(
          (a, b) => new Date(b.start_time) - new Date(a.start_time)
        );
        setSessions(list);
      }
    } catch (error) {
      console.error("Error sesiones:", error);
    }
  };


  const startSession = async () => {
    if (!selectedProjectId) return alert("Selecciona un proyecto");

    try {
      const { data } = await API.post("/time-sessions/start", {
        project_id: selectedProjectId,
      });

      setActiveSessionId(data.data.id);
      await fetchSessions();
    } catch (err) {
      console.error("Error iniciando:", err);
    }
  };

  const stopSession = async () => {
    if (!activeSessionId) return;

    try {
      await API.post("/time-sessions/stop", { session_id: activeSessionId });
      setActiveSessionId(null);
      await fetchSessions();
    } catch (err) {
      console.error("Error deteniendo:", err);
    }
  };

  const formatDuration = (start, end) => {
    if (!start) return "--";

    const a = toLocal(start).getTime();
    const b = end ? toLocal(end).getTime() : Date.now();

    const diff = Math.max(0, Math.floor((b - a) / 1000));
    const h = String(Math.floor(diff / 3600)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");

    return `${h}:${m}:${s}`;
  };

  const startLiveTimer = (startTime) => {
    stopLiveTimer();
    const update = () => setLiveTime(formatDuration(startTime, null));
    update();
    timerRef.current = setInterval(update, 1000);
  };

  const stopLiveTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };


  const toggleSessions = () => {
    if (showAll) {
      setVisibleSessions(5);
      setShowAll(false);
    } else {
      setVisibleSessions(sessions.length);
      setShowAll(true);
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

  if (!user) return <p className="text-center mt-5">Cargando...</p>;

  return (
    <div className="dashboard-container d-flex page-enter">
      <Menu active="inicio" onLogout={handleLogout} />

      <div className="content flex-grow-1 p-4">
        <h2 className="fw-bold mb-4">Bienvenida, {user.name}</h2>

        {/* PROYECTOS */}
        <h5 className="fw-semibold mb-3">Proyectos recientes</h5>
        <div className="projects-container mb-4">
          {projects.slice(0, 4).map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-header">
                <h5 className="project-title">{project.title}</h5>
              </div>

              <p className="project-desc">
                {project.description || "Sin descripción"}
              </p>

              <div className="project-dates">
                <small>
                  <strong>Fin:</strong>{" "}
                  {project.end_date
                    ? toLocal(project.end_date).toLocaleDateString()
                    : "--"}
                </small>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* TAREAS */}
          <div className="col-md-7">
            <div className="card dashboard-card p-3">
              <h5 className="fw-semibold mb-3">Mis tareas asignadas</h5>

              {tasks.length === 0 && (
                <p className="text-muted">No tienes tareas asignadas.</p>
              )}

              {tasks.map((task) => (
                <div className="task-item" key={task.id}>
                  <div>
                    <div className="task-title">{task.title}</div>
                    <div className="task-project">
                      Proyecto: {task.project?.title || "Sin proyecto"}
                    </div>
                  </div>
                  <span
                    className={`task-status ${
                      task.status === "COMPLETED"
                        ? "status-completed"
                        : task.status === "IN_PROGRESS"
                        ? "status-progress"
                        : "status-pending"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CONTROL DE TIEMPO */}
          <div className="col-md-5">
            <div className="card dashboard-card p-3">
              <h5 className="fw-semibold mb-3">Control de tiempo</h5>

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

              <div className="time-control-center">
                <div className="time-control-buttons">
                  {!activeSessionId ? (
                    <button className="time-btn play" onClick={startSession}>
                      <FaPlay />
                    </button>
                  ) : (
                    <button className="time-btn stop" onClick={stopSession}>
                      <FaStop />
                    </button>
                  )}
                </div>

                <div className="time-counter mt-2">
                  {activeSessionId ? liveTime : "00:00:00"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HISTORIAL */}
        <div className="card dashboard-card mt-4 p-3">
          <h5 className="fw-semibold mb-3">Historial de sesiones</h5>

          <div className="sessions-table-wrap">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, visibleSessions).map((s) => (
                  <tr key={s.id}>
                    <td>{s.project?.title || "Proyecto desconocido"}</td>
                    <td>{toLocal(s.start_time).toLocaleString()}</td>
                    <td>
                      {s.end_time
                        ? toLocal(s.end_time).toLocaleString()
                        : "—"}
                    </td>
                    <td>{formatDuration(s.start_time, s.end_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTÓN: CARGAR MÁS / OCULTAR */}
          {sessions.length > 5 && (
            <div className="mt-3 text-center">
              <button className="btn btn-outline-more" onClick={toggleSessions}>
                {showAll ? "Ocultar historial" : "Cargar más"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
