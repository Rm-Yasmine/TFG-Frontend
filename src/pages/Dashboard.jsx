import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import "../App.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // ✅ Obtener usuario autenticado
  const fetchUser = async () => {
    try {
      const { data } = await API.get("/me");
      setUser(data.data);
      fetchProjects();
      fetchTasks(data.data.id);
    } catch {
      navigate("/login");
    }
  };

  // ✅ Obtener proyectos
  const fetchProjects = async () => {
    try {
      const { data } = await API.get(
        "https://tfg-backend-production-bc6a.up.railway.app/api/projects"
      );
      if (data.status === "success") {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
    }
  };

  const fetchTasks = async (userId) => {
    try {
      const { data } = await API.get(
        `https://tfg-backend-production-bc6a.up.railway.app/api/tasks?assignee_id=${userId}`
      );
      if (data.status === "success") {
        setTasks(data.data);

        const completed = data.data.filter(
          (t) => t.status === "COMPLETED"
        ).length;
        const percent = data.data.length
          ? Math.round((completed / data.data.length) * 100)
          : 0;
        setProgress(percent);
      }
    } catch (error) {
      console.error("Error al obtener tareas:", error);
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

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <p className="text-center mt-5">Cargando...</p>;

  return (
    <div className="dashboard-container d-flex">
      <Menu active="inicio" onLogout={handleLogout} />

      <div className="content flex-grow-1 p-4">
        <h2 className="fw-bold mb-3">Bienvenida, {user.name}</h2>
        <h5 className="text-muted mb-4">Mis proyectos</h5>

        <div className="row g-4 mb-5">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div className="col-md-4" key={project.id}>
                <div className="card project-card shadow-sm border-0 h-100">
                  <div className="card-body text-white d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-bold mb-2">
                        {project.title}
                      </h5>
                      <p className="small opacity-75">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="mb-1 small">
                        <strong>Inicio:</strong>{" "}
                        {new Date(project.start_date).toLocaleDateString()}
                      </p>
                      <p className="mb-2 small">
                        <strong>Fin:</strong>{" "}
                        {new Date(project.end_date).toLocaleDateString()}
                      </p>

                      <div className="d-flex justify-content-between align-items-center">
                        <small className="opacity-75">
                          Tareas: {project.tasks?.length || 0}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-secondary">
              No tienes proyectos todavía.
            </div>
          )}
        </div>

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

          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 text-center">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">Progreso general</h6>
                <div className="progress-circle position-relative mx-auto">
                  <svg className="w-100 h-100" viewBox="0 0 36 36">
                    <path
                      className="text-light"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple"
                      strokeWidth="3"
                      strokeDasharray={`${progress}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="circle-label">
                    <span className="fw-bold fs-4 text-purple">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}
