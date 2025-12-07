import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import API from "../api/axios";
import Menu from "../components/Menu";
import { useNavigate } from "react-router-dom";

const locales = { es: esLocale };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const projectColors = [
  "#9b5de5",
  "#f15bb5",
  "#00bbf9",
  "#00f5d4",
  "#ffb700",
  "#f8961e",
];

export default function Calendar() {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: projectResponse } = await API.get("/projects");
      
        const raw = projectResponse?.data ?? [];

        let projectsList = [];

        if (Array.isArray(raw)) {
          projectsList = raw;
        } else if (raw && typeof raw === "object") {
          const combined = Object.values(raw).flat().filter(Boolean);
          projectsList = combined;
        }

        const mapById = new Map();
        projectsList.forEach((p, idx) => {
          if (!mapById.has(p.id)) {
            mapById.set(p.id, { ...p, color: projectColors[idx % projectColors.length] });
          }
        });
        const projectsWithColor = Array.from(mapById.values());
        setProjects(projectsWithColor);

        const projectEvents = projectsWithColor.map((project) => {
          const rawStart = project.start_date || project.created_at || null;
          const rawEnd = project.end_date || project.start_date || project.created_at || null;

          const start = rawStart ? new Date(rawStart) : new Date();
          const endRaw = rawEnd ? new Date(rawEnd) : new Date(start);


          const end = new Date(endRaw);
          end.setDate(end.getDate() + 1);

          return {
            id: `project-${project.id}`,
            title: project.title,
            start,
            end,
            allDay: true,
            resource: {
              type: "project",
              projectId: project.id,
              color: project.color,
              originalStart: start,
            },
          };
        });

        console.log("projectsWithColor:", projectsWithColor);
        console.log("projectEvents:", projectEvents);

        setEvents(projectEvents);
      } catch (err) {
        console.error("Error cargando proyectos para el calendario:", err);
      }
    };

    fetchData();
  }, []);

  const eventPropGetter = (event) => {
    const color = event.resource?.color || "#5ec576";
    return {
      style: {
        backgroundColor: color,
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "4px 8px",
        fontWeight: 600,
      },
    };
  };

  const navigate = useNavigate();

const handleLogout = async () => {
  try {
    await API.post("/logout");              // Llama a tu backend
    localStorage.removeItem("token");       // Borra el token guardado
    navigate("/login");                     // Redirige al login
  } catch (error) {
    console.error("Error cerrando sesión:", error);
  }
};

  const EventComponent = ({ event }) => {
    return <div style={{ pointerEvents: "none" }}>{` ${event.title}`}</div>;
  };

  return (
    <div className="dashboard-container d-flex">
      <Menu active="calendar" onLogout={handleLogout} />
      <div className="content flex-grow-1 p-4">
        <h3 className="fw-bold mb-4">Calendario</h3>

        <div className="card shadow-sm rounded-4 p-3 calendar-card">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            components={{
              event: EventComponent,
            }}
            selectable={false}
            eventPropGetter={eventPropGetter}
            popup={false}
            style={{ height: "75vh" }}
            messages={{
              next: "Sig.",
              previous: "Ant.",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
            }}
          />
        </div>
      </div>
    </div>
  );
}
