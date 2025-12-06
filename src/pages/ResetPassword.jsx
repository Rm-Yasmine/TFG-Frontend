import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1 = pedir email, 2 = cambiar contraseña
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/request-reset", { email });

      setToken(data.token); 
      setMessage({ type: "success", text: data.message });
      setStep(2); 
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al solicitar reset",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation: passwordConfirm,
      });

      setMessage({ type: "success", text: data.message });

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error al cambiar contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 w-50">
        <h2 className="fw-bold mb-4 text-center">Recuperar contraseña</h2>

        {message.text && (
          <div
            className={`alert ${
              message.type === "success" ? "alert-success" : "alert-danger"
            } text-center fw-semibold`}
          >
            {message.text}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Introduce tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Procesando..." : "SOLICITAR CAMBIO"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Confirmar contraseña"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
            <button className="btn btn-success w-100" disabled={loading}>
              {loading ? "Actualizando..." : "CAMBIAR CONTRASEÑA"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
