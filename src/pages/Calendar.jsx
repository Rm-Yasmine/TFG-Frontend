import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import API from "../api/axios";
import Menu from "../components/Menu";

const locales = { es: esLocale };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function Calendar() {
  // Estado controlado para que el toolbar pueda navegar
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: tasksData } = await API.get("/tasks");
        const tasks = tasksData.data.map((task) => ({
          id: task.id,
          title: task.title,
          start: new Date(task.start_date),
          end: new Date(task.due_date),
          allDay: false,
        }));

        // Si no tienes /projects/active, quita esto o sustituye por el proyecto actual
        const { data: projectData } = await API.get("/projects/active");
        const project = projectData.data;
        const projectDuration = {
          id: "project-duration",
          title: `📌 Proyecto: ${project.title}`,
          start: new Date(project.start_date),
          end: new Date(project.end_date),
          allDay: true,
          resource: { type: "project" },
        };

        setEvents([...tasks, projectDuration]);
      } catch (err) {
        console.error("Error cargando calendario:", err);
      }
    };

    fetchData();
  }, []);

  // Estilos por tipo de evento
  const eventStyleGetter = (event) => {
    if (event.resource?.type === "project") {
      return {
        style: {
          backgroundColor: "#9b5de5",
          color: "white",
          borderRadius: "4px",
          border: "none",
          fontWeight: "bold",
        },
      };
    }
    return {
      style: {
        backgroundColor: "#5ec576",
        color: "white",
        borderRadius: "4px",
        border: "none",
      },
    };
  };

  // Añadir evento al seleccionar un slot (opcionalmente abre un modal)
  const handleSelectSlot = async ({ start, end }) => {
    // Ejemplo mínimo: crear un evento rápido
    const title = prompt("Título del evento:");
    if (!title) return;

    try {
      const payload = {
        title,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      };
      const { data } = await API.post("/events", payload);
      setEvents((prev) => [
        ...prev,
        {
          id: data.data.id,
          title: data.data.title,
          start: new Date(data.data.start_date),
          end: new Date(data.data.end_date),
        },
      ]);
    } catch (err) {
      console.error("Error creando evento:", err);
    }
  };

  // Navegación del toolbar: actualiza la fecha
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  return (
    <div className="dashboard-container d-flex">
      <Menu active="calendar" />

      <div className="content flex-grow-1 p-4">
        <h3 className="fw-bold mb-4">📅 Calendario</h3>

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
            onNavigate={handleNavigate}
            popup
            selectable
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
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
