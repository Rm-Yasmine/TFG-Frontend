
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ModalAssignTask({ show, onHide, task, onSuccess }) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || "");

  useEffect(() => {
    if (!show || !task?.project_id) return;

    const fetchMembers = async () => {
      try {
        const { data } = await API.get(`/projects/${task.project_id}`);
        setMembers(data.data.members || []);
      } catch (err) {
        console.error("Error cargando miembros", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [show, task]);

  const handleAssign = async () => {
    if (!task) return;
    try {
      await API.put(`/tasks/${task.id}`, {
        assignee_id: assigneeId || null,
      });
      onSuccess(); 
      onHide();
    } catch (err) {
      console.error("Error asignando tarea", err);
      alert("No se pudo asignar la tarea.");
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show custom-modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content animate-fade">
          <div className="modal-header">
            <h5 className="modal-title">Asignar tarea</h5>
            <button className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            {loadingMembers ? (
              <div className="text-muted">Cargando miembros...</div>
            ) : (
              <>
                <label className="mb-1 fw-semibold">Asignar a:</label>
                <select
                  className="form-select"
                  value={assigneeId || ""}
                  onChange={(e) => setAssigneeId(e.target.value)}
                >
                  <option value="">— Sin asignar —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onHide}>
              Cerrar
            </button>
            <button className="btn btn-purple" onClick={handleAssign}>
              Asignar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
