import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Menu from "../components/Menu";
import "../App.css";

export default function ProjectChat() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUser();
    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUser = async () => {
    try {
      const { data } = await API.get("/me");
      setUser(data.data);
    } catch {
      navigate("/login");
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await API.get(`/projects/${id}/chat`);
      setMessages(data.data || []);
      await API.post(`/projects/${id}/chat/read`);
    } catch (err) {
      console.error("Error mensajes:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await API.post(`/projects/${id}/chat`, {
        message: newMessage,
      });

      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Error enviando:", err);
    }
  };

  const handleLogout = async () => {
    await API.post("/logout");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!user) return <p className="text-center mt-5">Cargando chat...</p>;

  return (
    <div className="dashboard-container d-flex">
      <Menu active="proyectos" onLogout={handleLogout} />

      <div className="content flex-grow-1 p-3 chat-page">
        <h4 className="fw-bold mb-3">💬 Chat del proyecto</h4>

        <div className="chat-box">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${
                msg.user_id === user.id ? "own" : "other"
              }`}
            >
              <div className="chat-bubble">
                <small className="chat-user">
                  {msg.user?.name || "Usuario"}
                </small>
                <p>{msg.message}</p>
                <small className="chat-time">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </small>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            className="form-control"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="btn btn-primary" onClick={sendMessage}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
