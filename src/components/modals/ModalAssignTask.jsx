import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ModalAssignTask({ show, onHide, task, onSuccess }) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [assigneeId, setAssigneeId] = useState(null);
  const [saving, setSaving] = useState(false);

  // 🔁 Reset cuando cambia la tarea
  useEffect(() => {
    if (task?.assignee_id) {
      setAssigneeId(Number(task.assignee_id));
    } else {
      setAssigneeId(null);
    }
  }, [task]);

  // 👥 Cargar miembros del proyecto
  useEffect(() => {
    if (!show || !task?.project_id) return;

    setLoadingMembers(true);

    const fetchMembers = async () => {
      try {
        const { data } = await API.get(`/projects/${task.project_id}`);
        setMembers(data.data?.members || []);
      } catch (err) {
        console.error("Error cargando miembros", err);
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [show, task]);

  const handleAssign = async () => {
    if (!task) return;

    try {
      setSaving(true);

      await API.put(`/tasks/${task.id}/assign`, {
        assignee_id: assigneeId, // number | null
      });

      onSuccess();
      onHide();
    } catch (err) {
      console.error("Error asignando tarea", err.response?.data || err);
      alert("No se pudo asignar la tarea.");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal-backdrop-custom modal fade show custom-modal"
      style={{ display: "block" }}
    >
      <div className="modal-dialog modal-custom">
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
                  value={assigneeId ?? ""}
                  onChange={(e) =>
                    setAssigneeId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
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
            <button
              className="btn btn-secondary"
              onClick={onHide}
              disabled={saving}
            >
              Cerrar
            </button>
            <button
              className="btn btn-purple"
              onClick={handleAssign}
              disabled={saving || loadingMembers}
            >
              {saving ? "Asignando..." : "Asignar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
