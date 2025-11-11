import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";

export default function Projects() {
  const [ownProjects, setOwnProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await API.get("/projects");
        setOwnProjects(data.data.own || []);
        setCollabProjects(data.data.collaboration || []);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      }
    };
    fetchProjects();
  }, []);

  const renderProjectCard = (project) => (
    <div
      key={project.id}
      className="card shadow-sm border-0 p-3 m-2 project-card"
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{ cursor: "pointer", flex: "1 1 30%", minWidth: 300 }}
    >
      <h5 className="fw-bold">{project.title}</h5>
      <p className="text-muted small">{project.description}</p>
      <div className="mt-2 small d-flex justify-content-between">
        <span>{project.members?.length || 0} miembros</span>
        <span>{project.progress}%</span>
      </div>
      <div className="progress mt-2" style={{ height: "6px" }}>
        <div
          className="progress-bar bg-purple"
          style={{ width: `${project.progress}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="dashboard-container d-flex">
      <Menu active="proyectos" />
      <div className="content flex-grow-1 p-4">
        <h3 className="fw-bold mb-4">Proyectos</h3>

        <h5 className="mb-3 text-purple">Mis proyectos</h5>
        <div className="d-flex flex-wrap">{ownProjects.map(renderProjectCard)}</div>

        <h5 className="mt-5 mb-3 text-purple">Proyectos de colaboración</h5>
        <div className="d-flex flex-wrap">{collabProjects.map(renderProjectCard)}</div>
      </div>
    </div>
  );
}
