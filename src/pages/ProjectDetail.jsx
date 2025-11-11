import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useParams } from "react-router-dom";
import Menu from "../components/Menu";
import "../App.css";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", due_date: "" });
  const [loading, setLoading] = useState(true);

  // 🔹 Obtener usuario autenticado
  const fetchUser = async () => {
    const { data } = await API.get("/me");
    setUser(data.data);
  };

  // 🔹 Cargar datos del proyecto
  const fetchProject = async () => {
    try {
      const { data } = await API.get(`/projects/${id}`);
      setProject(data.data);
    } catch (error) {
      console.error("Error al cargar proyecto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return alert("El título es obligatorio");

    try {
      await API.post("/tasks", {
        ...newTask,
        project_id: project.id,
        created_by: user.id,
      });
      setNewTask({ title: "", description: "", due_date: "" });
      fetchProject();
    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status });
      fetchProject();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  if (loading) return <p className="text-center mt-5">Cargando...</p>;
  if (!project || !user) return null;

  const isOwner = project.owner_id === user.id;

  // 🧮 Contar tareas por estado
  const total = project.tasks.length;
  const completed = project.tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const pending = project.tasks.filter((t) => t.status === "PENDING").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="dashboard-container d-flex">
      <Menu active="proyectos" />
      <div className="content flex-grow-1 p-4">
        <h3 className="fw-bold mb-4">Detalles del Proyecto</h3>

        {/* --- Encabezado del proyecto --- */}
        <div className="card shadow-sm border-0 p-4 mb-4 rounded-4">
          <h4 className="fw-semibold mb-2">{project.title}</h4>
          <p className="text-muted small mb-3">{project.description}</p>
          <div className="d-flex justify-content-between small text-muted">
            <span>📅 Inicio: {new Date(project.start_date).toLocaleDateString()}</span>
            <span>🏁 Fin: {new Date(project.end_date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* --- Miembros y estadísticas --- */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">👥 Miembros del equipo</h6>
                {project.members.map((m) => (
                  <div key={m.id} className="d-flex align-items-center mb-2">
                    <div className="avatar bg-purple text-white rounded-circle me-2">
                      {m.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-semibold">{m.name}</div>
                      <small className="text-muted">{m.email}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 h-100 text-center">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">📊 Estadísticas</h6>
                <div className="position-relative mx-auto" style={{ width: 100, height: 100 }}>
                  <svg className="w-100 h-100" viewBox="0 0 36 36">
                    <path
                      strokeWidth="3"
                      stroke="#eee"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      strokeWidth="3"
                      strokeDasharray={`${progress}, 100`}
                      strokeLinecap="round"
                      stroke="#9b5de5"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div
                    className="position-absolute top-50 start-50 translate-middle fw-bold"
                    style={{ color: "#9b5de5" }}
                  >
                    {progress}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">📈 Resumen</h6>
                <p>Total tareas: {total}</p>
                <p>Completadas: {completed}</p>
                <p>En progreso: {inProgress}</p>
                <p>Pendientes: {pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Crear tarea (solo dueña) --- */}
        {isOwner && (
          <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h6 className="fw-semibold mb-3">➕ Nueva tarea</h6>
            <form onSubmit={handleCreateTask}>
              <div className="row g-2">
                <div className="col-md-4">
                  <input
                    type="text"
                    placeholder="Título"
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
                <div className="col-md-4">
                  <button className="btn btn-purple w-100">Crear tarea</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* --- Listado de tareas --- */}
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <h6 className="fw-semibold mb-3">🗂️ Tareas del proyecto</h6>
          {project.tasks.length === 0 ? (
            <p className="text-muted">No hay tareas todavía.</p>
          ) : (
            project.tasks.map((task) => (
              <div
                key={task.id}
                className="d-flex justify-content-between align-items-center border-bottom py-2"
              >
                <div>
                  <strong>{task.title}</strong>
                  <div className="small text-muted">
                    {task.assignee ? `👤 ${task.assignee.name}` : "Sin asignar"} —{" "}
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </div>

                {/* Control de estado */}
                {isOwner ? (
                  <span className="badge bg-light text-purple">{task.status}</span>
                ) : task.assignee_id === user.id ? (
                  <select
                    className="form-select form-select-sm w-auto"
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROGRESS">En progreso</option>
                    <option value="COMPLETED">Completada</option>
                  </select>
                ) : (
                  <span className="badge bg-light text-secondary">{task.status}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
