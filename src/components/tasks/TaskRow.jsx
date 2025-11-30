import TaskStatusBadge from "./TaskStatusBadge";
import { FaEdit, FaUser, FaEye } from "react-icons/fa";

export default function TaskRow({ task, onOpen, onEdit, onAssign }) {
  return (
    <div className="task-row d-flex justify-content-between align-items-center animate-slide">
      <div>
        <span className="fw-semibold">{task.title}</span>
        <br />
        <span className="text-muted small">Fecha límite: {task.due_date}</span>
      </div>

      <div className="d-flex gap-2">
        <div className="task-status-badge-container">
        <TaskStatusBadge status={task.status} className="task-status-badge" />
        </div>
        <button className="btn-icon" onClick={onOpen}>
          <FaEye />
        </button>
        <button className="btn-icon" onClick={onEdit}>
          <FaEdit />
        </button>
        <button className="btn-icon" onClick={onAssign}>
          <FaUser />
        </button>
      </div>
    </div>
  );
}
