export default function TaskDrawer({ open, task, onClose }) {
  return (
    <div className={`task-drawer ${open ? "open" : ""}`}>
      <div className="drawer-header">
        <h5 className="fw-bold">{task?.title}</h5>
        <button className="btn-close" onClick={onClose}></button>
      </div>

      <div className="drawer-body">
        <p><strong>Descripción:</strong> {task?.description}</p>
        <p><strong>Estado:</strong> {task?.status}</p>
        <p><strong>Fecha limite:</strong> {task?.due_date}</p>
      </div>
    </div>
  );
}
