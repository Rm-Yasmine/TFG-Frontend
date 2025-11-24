import { useState, useEffect } from "react";
import API from "../../api/axios";

export default function ModalEditTask({ show, onHide, task, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    assignee_id: "",
    due_date: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "",
        assignee_id: task.assignee_id || "",
        due_date: task.due_date || "",
      });
    }
  }, [task]);

  if (!show || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async () => {
    await API.put(`/tasks/${task.id}`, formData);
    onSuccess();
    onHide();
  };

  return (
    <div className="modal fade show custom-modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content animate-fade">
          <div className="modal-header">
            <h5 className="modal-title">Editar tarea</h5>
            <button className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            <input
              className="form-control mb-2"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título"
            />
            <textarea
              className="form-control mb-2"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción"
            />
            <select
              className="form-control mb-2"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="COMPLETED">Completada</option>
            </select>
            <input
              className="form-control mb-2"
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onHide}>
              Cancelar
            </button>
            <button className="btn btn-purple" onClick={submit}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
