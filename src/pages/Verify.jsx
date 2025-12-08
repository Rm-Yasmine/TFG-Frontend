import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Verify() {
  const [params] = useSearchParams();
  const email = params.get("email");

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/verify-code", {
        email,
        code,
      });

      localStorage.setItem("token", data.token);

      setMessage("Correo verificado correctamente. Redirigiendo...");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Código incorrecto."
      );
    }
  };

  const resendCode = async () => {
    setSending(true);
    try {
      await API.post("/resend-code", { email });
      setMessage("Nuevo código enviado a tu correo.");
    } catch {
      setMessage("No se pudo reenviar el código.");
    }
    setSending(false);
  };

  return (
    <div className="container text-center mt-5">
      <h2>Verificar correo</h2>
      <p>Hemos enviado un código a: <strong>{email}</strong></p>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit} className="mt-4">
        <input
          className="form-control text-center mb-3"
          placeholder="Introduce el código"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <button className="btn btn-primary w-100">Verificar</button>
      </form>

      <button
        onClick={resendCode}
        className="btn btn-link mt-3"
        disabled={sending}
      >
        {sending ? "Enviando..." : "Reenviar código"}
      </button>
    </div>
  );
}
