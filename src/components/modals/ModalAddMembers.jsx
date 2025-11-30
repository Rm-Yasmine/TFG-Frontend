import { useState } from "react";
import API from "../../api/axios";

export default function ModalAddMembers({ show, onHide, projectId, onSuccess }) {
  const [emails, setEmails] = useState([""]);
  const [loading, setLoading] = useState(false);

  const addField = () => setEmails((prev) => [...prev, ""]);

  const updateEmail = (value, index) => {
    const copy = [...emails];
    copy[index] = value;
    setEmails(copy);
  };

  const submit = async () => {
    try {
      setLoading(true);

      const validEmails = emails.filter((e) => e.trim() !== "");

      for (const email of validEmails) {
        await API.post(`/projects/${projectId}/add-member-by-email`, {
          email: email.trim(),
        });
      }

      onSuccess();
      onHide();
    } catch (err) {
      console.error(err);
      alert("Error al añadir miembros");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show custom-modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content animate-fade">

          <div className="modal-header">
            <h5 className="modal-title">Añadir miembros</h5>
            <button className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            {emails.map((email, i) => (
              <input
                key={i}
                className="form-control mb-2"
                placeholder="Correo del miembro"
                value={email}
                onChange={(e) => updateEmail(e.target.value, i)}
              />
            ))}

            <button className="btn btn-outline-purple w-100" onClick={addField}>
              + Añadir otro
            </button>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onHide} disabled={loading}>
              Cancelar
            </button>
            <button className="btn btn-purple" onClick={submit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
