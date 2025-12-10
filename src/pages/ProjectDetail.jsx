import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

import Menu from "../components/Menu";
import TaskRow from "../components/tasks/TaskRow";
import TaskDrawer from "../components/tasks/TaskDrawer";

import ModalCreateTask from "../components/modals/ModalCreateTask";
import ModalEditTask from "../components/modals/ModalEditTask";
import ModalAssignTask from "../components/modals/ModalAssignTask";

import "../App.css";

export default function ProjectDetail() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("");

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const { data } = await API.get("/me");
      setUser(data.data);
    } catch (err) {
      console.error("Error cargando usuario:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProject = async () => {
    try {
      const { data } = await API.get(
        `https://tfg-backend-ochre.vercel.app/api/api/projects/${id}`
      );
      if (data.status === "success") setProject(data.data);
    } catch (e) {
      console.error("Error cargando proyecto:", e);
    }
  };

  const openDrawer = (task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const refresh = () => fetchProject();

  const addMember = async () => {
    try {
      const { data } = await API.post(`/projects/${id}/add-member-by-email`, {
        email,
      });

      if (data.status === "success") {
        setEmail("");
        setShowAddMember(false);
        fetchProject();
      }
    } catch (e) {
      console.error("Error añadiendo miembro:", e);
    }
  };
  const handleLogout = async () => {
    try {
      await API.post("/logout");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  if (!project) return <p className="text-center mt-5">Cargando...</p>;

  return (
    <div className="project-detail-container d-flex">
      <Menu active="proyectos" onLogout={handleLogout} />

      <div className="content flex-grow-1 p-4 animate-fade">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center mb-3">
            <button className="btn-back" onClick={() => navigate("/projects")}>
              ←
            </button>
            <h2 className="fw-bold ms-2">{project.title}</h2>
          </div>

          <button
            className="btn-add-member"
            onClick={() => setShowAddMember(true)}
          >
            + Añadir Miembro
          </button>
        </div>

        <p className="text-muted">{project.description}</p>

        <button
          className="btn btn-purple mb-3"
          onClick={() => setShowCreate(true)}
        >
          + Nueva Tarea
        </button>

        <div className="task-table card shadow-sm border-0">
          <div className="card-body">
            {project.tasks.length > 0 ? (
              project.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onOpen={() => openDrawer(task)}
                  onEdit={() => {
                    setSelectedTask(task);
                    setShowEdit(true);
                  }}
                  onAssign={() => {
                    setSelectedTask(task);
                    setShowAssign(true);
                  }}
                />
              ))
            ) : (
              <p className="text-muted">No hay tareas en este proyecto.</p>
            )}
          </div>
        </div>
      </div>

      <TaskDrawer
        open={drawerOpen}
        task={selectedTask}
        onClose={() => setDrawerOpen(false)}
      />

      <ModalCreateTask
        show={showCreate}
        onHide={() => setShowCreate(false)}
        projectId={project.id}
        userId={user?.id}
        onSuccess={refresh}
      />

      <ModalEditTask
        show={showEdit}
        onHide={() => setShowEdit(false)}
        task={selectedTask}
        onSuccess={refresh}
      />

      <ModalAssignTask
        show={showAssign}
        onHide={() => setShowAssign(false)}
        task={selectedTask}
        onSuccess={refresh}
      />

      {showAddMember && (
        <div className="modal-backdrop-custom">
          <div className="modal-custom card p-4 shadow-lg">
            <h4 className="mb-3">Añadir miembro</h4>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Correo del usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddMember(false)}
              >
                Cancelar
              </button>

              <button className="btn btn-primary" onClick={addMember}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
