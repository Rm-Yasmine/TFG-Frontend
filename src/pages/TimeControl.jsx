import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { FaPlay, FaStop } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import "../App.css";

export default function TimeControl() {
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [liveTime, setLiveTime] = useState("00:00:00");

  const timerRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    fetchProjects();
    fetchSessions();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const toDate = (value) => new Date(value);

  const formatDuration = (start, end) => {
    const a = toDate(start).getTime();
    const b = end ? toDate(end).getTime() : Date.now();

    const diff = Math.max(0, Math.floor((b - a) / 1000));

    const h = String(Math.floor(diff / 3600)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");

    return `${h}:${m}:${s}`;
  };

  const startLiveTimer = (startTime) => {
    stopLiveTimer();

    const update = () => {
      setLiveTime(formatDuration(startTime, null));
    };

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
      console.error("Error cargando proyectos", error);
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
      console.error("Error cargando sesiones", error);
    }
  };

  const startSession = async () => {
    if (!selectedProjectId) {
      alert("Selecciona un proyecto");
      return;
    }

    try {
      const { data } = await API.post("/time-sessions/start", {
        project_id: selectedProjectId,
      });

      setActiveSessionId(data.data.id);
      startLiveTimer(data.data.start_time);
      fetchSessions();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "No se pudo iniciar la sesión de tiempo"
      );
    }
  };

  const stopSession = async () => {
    if (!activeSessionId) return;

    try {
      await API.post("/time-sessions/stop", {
        session_id: activeSessionId,
      });

      setActiveSessionId(null);
      stopLiveTimer();
      setLiveTime("00:00:00");
      fetchSessions();
    } catch (error) {
      alert("No se pudo detener la sesión");
    }
  };


  const handleLogout = async () => {
    await API.post("/logout");
    localStorage.removeItem("token");
    navigate("/login");
  };

  
  const sessionsByDate = sessions.reduce((acc, s) => {
    const date = new Date(s.start_time).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});

  return (
    <div className="dashboard-container d-flex page-enter">
      <Menu active="tiempo" onLogout={handleLogout} />

      <div className="content flex-grow-1 p-4">
        <h2 className="fw-bold mb-4">Control de tiempo</h2>

        <div className="d-flex align-items-center gap-4 mb-5">
          <select
            className="form-select w-50"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={!!activeSessionId}
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {!activeSessionId ? (
            <button className="time-btn play" onClick={startSession}>
              <FaPlay />
            </button>
          ) : (
            <button className="time-btn stop" onClick={stopSession}>
              <FaStop />
            </button>
          )}

          <div className="time-counter fs-3 fw-bold">{liveTime}</div>
        </div>

        {Object.keys(sessionsByDate).map((day) => (
          <div key={day} className="mb-5">
            <h6 className="fw-bold text-muted mb-3">{day}</h6>

            {sessionsByDate[day].map((s) => (
              <div
                key={s.id}
                className="bg-white shadow-sm rounded p-3 mb-2 d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold">
                    {s.project?.title || "Proyecto sin nombre"}
                  </div>
                  <small className="text-muted">
                    {s.project?.description || "Sin descripción"}
                  </small>
                </div>

                <div className="fw-bold text-primary">
                  {formatDuration(s.start_time, s.end_time)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
