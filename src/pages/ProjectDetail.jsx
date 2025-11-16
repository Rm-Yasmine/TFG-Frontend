import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import Menu from "../components/Menu";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState({
    title: "",
    due_date: "",
  });

  const fetchUser = async () => {
    const { data } = await API.get("/me");
    setUser(data.data);
  };

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await API.get(`/projects/${id}`);
      setProject(data.data);
    } catch (err) {
      console.error("Error cargando proyecto:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
    fetchProject();
  }, [fetchProject]);

  if (loading) return <p className="text-center mt-5">Cargando...</p>;
  if (!project || !user) return null;

  const isOwner = project.owner?.id === user.id;

  const total = project.tasks.length;
  const completed = project.tasks.filter((t) => t.status === "COMPLETED").length;
  const pending = project.tasks.filter((t) => t.status === "PENDING").length;
  const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;

    await API.post("/tasks", {
      ...newTask,
      project_id: project.id,
      created_by: user.id,
    });

    setNewTask({ title: "", due_date: "" });
    fetchProject();
  };

  const changeStatus = async (taskId, status) => {
    await API.patch(`/tasks/${taskId}/status`, { status });
    fetchProject();
  };

  return (
    <div className="dashboard-container d-flex">
      <Menu active="proyectos" />
      <div className="content flex-grow-1 p-4">
        <h3 className="fw-bold mb-4">Detalles del Proyecto</h3>

        <div className="card shadow-sm p-4 mb-4 rounded-4">
          <h4>{project.title}</h4>
          <p className="text-muted">{project.description}</p>
          <div className="d-flex justify-content-between text-muted small">
            <span>📅 Inicio: {new Date(project.start_date).toLocaleDateString()}</span>
            <span>🏁 Fin: {new Date(project.end_date).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">👥 Miembros</h6>
                {project.members.map((m) => (
                  <div key={m.id} className="d-flex align-items-center mb-2">
                    <div className="avatar bg-purple rounded-circle me-2 text-white">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{m.name}</strong>
                      <br />
                      <small className="text-muted">{m.email}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm rounded-4 h-100 text-center">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">📊 Progreso</h6>
                <div className="progress-circle position-relative mx-auto" style={{ width: 120 }}>
                  <svg viewBox="0 0 36 36" className="w-100 h-100">
                    <path stroke="#eee" strokeWidth="3" fill="none" d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" />
                    <path
                      stroke="#9b5de5"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${progress},100`}
                      d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                    />
                  </svg>
                  <div className="position-absolute top-50 start-50 translate-middle fw-bold" style={{ color: "#9b5de5" }}>
                    {progress}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-semibold">📈 Resumen</h6>
                <p>Total tareas: {total}</p>
                <p>Completadas: {completed}</p>
                <p>En progreso: {inProgress}</p>
                <p>Pendientes: {pending}</p>
              </div>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="card shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-semibold mb-3">➕ Nueva tarea</h6>
            <form onSubmit={createTask}>
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    placeholder="Título de la tarea"
                    className="form-control"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="date"
                    className="form-control"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <button className="btn btn-purple w-100">Crear</button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="card shadow-sm rounded-4 p-4">
          <h6 className="fw-semibold mb-3">🗂 Listado de tareas</h6>
          {project.tasks.map((task) => (
            <div className="d-flex justify-content-between border-bottom py-2" key={task.id}>
              <div>
                <strong>{task.title}</strong>
                <div className="text-muted small">
                  {task.assignee ? `Asignada a ${task.assignee.name}` : "Sin asignar"} —{" "}
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              </div>
              {isOwner ? (
                <span className="badge bg-light text-purple">{task.status}</span>
              ) : task.assignee_id === user.id ? (
                <select
                  className="form-select form-select-sm"
                  value={task.status}
                  onChange={(e) => changeStatus(task.id, e.target.value)}
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En progreso</option>
                  <option value="COMPLETED">Completada</option>
                </select>
              ) : (
                <span className="badge bg-light text-muted">{task.status}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
