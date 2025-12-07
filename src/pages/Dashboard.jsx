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
  const [liveTime, setLiveTime] = useState("00:00:00");
  const [message, setMessage] = useState({ type: "", text: "" });

  const timerRef = useRef(null);
  const navigate = useNavigate();

  const toLocal = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString + " UTC");
  };

  useEffect(() => {
    fetchUser();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await API.get("/me");
      setUser(data.data);
      await fetchProjects();
      await fetchTasks(data.data.id);
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

  const formatDuration = (start) => {
    if (!start) return "00:00:00";
    const a = toLocal(start).getTime();
    const diff = Math.max(0, Math.floor((Date.now() - a) / 1000));
    const h = String(Math.floor(diff / 3600)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const startLiveTimer = (startTime) => {
    stopLiveTimer();
    const update = () => setLiveTime(formatDuration(startTime));
    update();
    timerRef.current = setInterval(update, 1000);
  };

  const stopLiveTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startSession = async () => {
    if (!selectedProjectId) {
      setMessage({ type: "error", text: "Selecciona un proyecto primero" });
      return;
    }
    try {
      const { data } = await API.post("/time-sessions/start", {
        project_id: selectedProjectId,
      });
      setActiveSessionId(data.data.id);
      startLiveTimer(data.data.start_time);
      setMessage({ type: "success", text: "Sesión iniciada 🎉" });
    } catch (err) {
      console.error("Error iniciando:", err);
      setMessage({ type: "error", text: "Error al iniciar sesión" });
    }
  };

  const stopSession = async () => {
    if (!activeSessionId) return;
    try {
      await API.post("/time-sessions/stop", { session_id: activeSessionId });
      setActiveSessionId(null);
      stopLiveTimer();
      setLiveTime("00:00:00");
      setMessage({ type: "success", text: "Sesión detenida ✅" });
    } catch (err) {
      console.error("Error deteniendo:", err);
      setMessage({ type: "error", text: "Error al detener sesión" });
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

      <div className="content flex-grow-1 p-3">
        <h2 className="fw-bold mb-3">Bienvenida, {user.name}</h2>

        {message.text && (
          <div
            className={`alert ${
              message.type === "success" ? "alert-success" : "alert-danger"
            } text-center fw-semibold`}
          >
            {message.text}
          </div>
        )}

        <h5 className="fw-semibold mb-2">Proyectos</h5>
        <div className="list-group mb-4">
          {projects.slice(0, 5).map((project) => (
            <div
              className="list-group-item d-flex justify-content-between align-items-center small-card"
              key={project.id}
            >
              <div>
                <strong>{project.title}</strong>
                <div className="text-muted small">
                  {project.description || "Sin descripción"}
                </div>
              </div>
              <small>
                Fin:{" "}
                {project.end_date
                  ? toLocal(project.end_date).toLocaleDateString()
                  : "--"}
              </small>
            </div>
          ))}
        </div>

        <h5 className="fw-semibold mb-2">Mis tareas</h5>
        <div className="list-group mb-4">
          {tasks.length === 0 && (
            <p className="text-muted">No tienes tareas asignadas.</p>
          )}
          {tasks.map((task) => (
            <div
              className="list-group-item d-flex justify-content-between align-items-center small-card"
              key={task.id}
            >
              <div>
                <strong>{task.title}</strong>
                <div className="text-muted small">
                  Proyecto: {task.project?.title || "Sin proyecto"}
                </div>
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
          ))}
        </div>

        <h5 className="fw-semibold mb-2">Control de tiempo</h5>
        <div className="card p-3 text-center small-card">
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

          <div className="d-flex justify-content-center align-items-center gap-3">
            {!activeSessionId ? (
              <button className="btn btn-success btn-sm" onClick={startSession}>
                <FaPlay /> Iniciar
              </button>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={stopSession}>
                <FaStop /> Detener
              </button>
            )}
            <div className="fw-bold">{liveTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
