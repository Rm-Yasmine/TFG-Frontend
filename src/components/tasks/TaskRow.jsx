import TaskStatusBadge from "./TaskStatusBadge";
import { FaEdit, FaUser, FaTrash } from "react-icons/fa";

export default function TaskRow({ task, onEdit, onAssign, onDelete }) {
  return (
    <div className="task-row d-flex justify-content-between align-items-center animate-slide">
      <div>
        <span className="fw-semibold">{task.title}</span>
        <br />
        <span className="text-muted small">
          Fecha límite: {task.due_date || "--"}
        </span>
      </div>

      <div className="d-flex gap-2 align-items-center">
        <div className="task-status-badge-container">
          <TaskStatusBadge
            status={task.status}
            className="task-status-badge"
          />
        </div>

        <button className="btn-icon" onClick={onEdit} title="Editar tarea">
          <FaEdit />
        </button>

        <button className="btn-icon" onClick={onAssign} title="Asignar usuario">
          <FaUser />
        </button>

        <button
          className="btn-icon btn-icon-danger"
          onClick={onDelete}
          title="Eliminar tarea"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
