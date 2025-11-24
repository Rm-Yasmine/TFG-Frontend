import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  const [user, setUser] = useState(null);

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
    // eslint-disable-next-line
  }, []);

  const fetchProject = async () => {
    try {
      const { data } = await API.get(
        `https://tfg-backend-production-bc6a.up.railway.app/api/projects/${id}`
      );
      if (data.status === "success") setProject(data.data);
    } catch (e) {
      console.error("Error cargando proyecto:", e);
    }
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line
  }, []);

  const openDrawer = (task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const refresh = () => fetchProject();

  if (!project) return <p className="text-center mt-5">Cargando...</p>;

  return (
    <div className="project-detail-container d-flex">
      <Menu active="projects" />

      {/* CONTENIDO */}
      <div className="content flex-grow-1 p-4 animate-fade">
        <h2 className="fw-bold">{project.title}</h2>
        <p className="text-muted">{project.description}</p>

        <button
          className="btn btn-purple mb-3"
          onClick={() => setShowCreate(true)}
        >
          + Nueva Tarea
        </button>

        {/* TABLA DE TAREAS */}
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

      {/* DRAWER A LA DERECHA */}
      <TaskDrawer
        open={drawerOpen}
        task={selectedTask}
        onClose={() => setDrawerOpen(false)}
      />

      {/* MODALES */}
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
    </div>
  );
}
