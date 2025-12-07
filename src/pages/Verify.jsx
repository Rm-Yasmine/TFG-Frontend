import { useState, useEffect } from "react";
import axios from "axios";

export default function Verify() {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const api = "https://tfg-backend-production-bc6a.up.railway.app/api";

  // Obtiene el email desde la URL: /verify?email=algo@mail.com
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const emailParam = query.get("email");

    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await axios.post(`${api}/verify-pin`, {
        email,
        pin,
      });

      setMsg("✔ Verificación completada. Ya puedes iniciar sesión.");

      // Redirección si quieres automática:
      // setTimeout(() => window.location.href = "/login", 1500);

    } catch (err) {
      setMsg("❌ PIN incorrecto o expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Verificar correo</h2>

      {email ? (
        <p>Introduce el PIN enviado a <strong>{email}</strong></p>
      ) : (
        <p style={{ color: "red" }}>No se proporcionó un correo.</p>
      )}

      {msg && <p>{msg}</p>}

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="PIN de 6 dígitos"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Verificando..." : "Verificar PIN"}
        </button>
      </form>
    </div>
  );
}
