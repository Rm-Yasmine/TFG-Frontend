import React, { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // -------------------------------
  // 1️⃣ Registro con Laravel
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/register", form);

      setRegisteredEmail(form.email);
      setVerificationStep(true);

      alert(`Cuenta creada. Hemos enviado un PIN a ${form.email}`);
    } catch (err) {
      console.error(err);
      alert("Error al registrarte.");
    }
  };

  // -------------------------------
  // 2️⃣ Verificar código
  // -------------------------------
  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await API.post("/verify-email", {
        email: registeredEmail,
        code: verificationCode,
      });

      alert("Correo verificado correctamente 🎉");
      navigate("/");
    } catch (err) {
      alert("Código incorrecto.");
    }
  };

  return (
    <div className="container p-5">
      {!verificationStep ? (
        <>
          <h2>Crear cuenta</h2>
          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Nombre" onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
            <button>Registrarse</button>
          </form>
        </>
      ) : (
        <>
          <h2>Verificación de correo</h2>
          <p>Hemos enviado un código a <strong>{registeredEmail}</strong></p>

          <form onSubmit={handleVerify}>
            <input
              type="text"
              maxLength="6"
              placeholder="Código"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            <button>Verificar</button>
          </form>
        </>
      )}
    </div>
  );
}
