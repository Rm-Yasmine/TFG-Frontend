export default function TaskDrawer({ open, task, onClose }) {
  const assigneeName = task?.assignee?.name || "Sin asignar";

  const statusStyles = {
    completed: { text: "Completado", bg: "#e8fdf2", color: "#2e7d32" }, // verde suave
    pending: { text: "Pendiente", bg: "#fff8e1", color: "#b8860b" },   // amarillo suave
    in_progress: { text: "En progreso", bg: "#f3e8ff", color: "#7a48e3" }, // lavanda
    default: { text: "Desconocido", bg: "#f0f0f0", color: "#666" }
  };

  const status = statusStyles[task?.status] || statusStyles.default;

  return (
    <>
      <div className={`overlay ${open ? "show" : ""}`} onClick={onClose}></div>
      <div className={`task-drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <h5>{task?.title}</h5>
          <button className="btn-close" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M6 18L18 6" stroke="#7a48e3" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          <div className="task-block">
            <p className="label">Descripción</p>
            <p>{task?.description}</p>
          </div>

          <div className="task-block" style={{ backgroundColor: status.bg }}>
            <p className="label">Estado</p>
            <span style={{ color: status.color, fontWeight: "bold" }}>{status.text}</span>
          </div>

          <div className="task-block">
            <p className="label">Fecha límite</p>
            <p>{task?.due_date}</p>
          </div>

          <div className="task-block">
            <p className="label">Responsable</p>
            <p>{assigneeName}</p>
          </div>
        </div>
      </div>
    </>
  );
}
