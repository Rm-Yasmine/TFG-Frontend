import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { FaPlay, FaStop } from "react-icons/fa";
import "../App.css";

export default function TimeControl() {
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [liveTime, setLiveTime] = useState("00:00:00");
  const [message, setMessage] = useState({ type: "", text: "" });

  const timerRef = useRef(null);

  useEffect(() => {
    fetchProjects();
    fetchSessions();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toLocal = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString + " UTC");
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

  const fetchSessions = async () => {
    try {
      const { data } = await API.get("/time-sessions");
      if (data.status === "success") {
        const list = (data.data || []).sort(
          (a, b) => new Date(b.start_time) - new Date(a.start_time)
        );
        setSessions(list);

        const active = list.find((s) => !s.end_time);
        if (active) {
          setActiveSessionId(active.id);
          startLiveTimer(active.start_time);
        } else {
          setActiveSessionId(null);
          stopLiveTimer();
          setLiveTime("00:00:00");
        }
      }
    } catch (error) {
      console.error("Error sesiones:", error);
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
      fetchSessions();
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
      fetchSessions();
      setMessage({ type: "success", text: "Sesión detenida ✅" });
    } catch (err) {
      console.error("Error deteniendo:", err);
      setMessage({ type: "error", text: "Error al detener sesión" });
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">⏱ Control de tiempo</h2>

      {message.text && (
        <div
          className={`alert ${
            message.type === "success" ? "alert-success" : "alert-danger"
          } text-center fw-semibold`}
        >
          {message.text}
        </div>
      )}

      {/* Selector de proyecto */}
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

      {/* Botones + contador */}
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4 flex-wrap">
        {!activeSessionId ? (
          <button className="btn btn-success btn-sm" onClick={startSession}>
            <FaPlay /> Iniciar
          </button>
        ) : (
          <button className="btn btn-danger btn-sm" onClick={stopSession}>
            <FaStop /> Detener
          </button>
        )}
        <div className="fw-bold fs-5">{liveTime}</div>
      </div>

      {/* Historial */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Proyecto</th>
              <th>Descripción</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.project?.title || "Sin título"}</td>
                <td>{s.project?.description || "Sin descripción"}</td>
                <td>{toLocal(s.start_time).toLocaleString()}</td>
                <td>
                  {s.end_time ? toLocal(s.end_time).toLocaleString() : "—"}
                </td>
                <td>{formatDuration(s.start_time, s.end_time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
