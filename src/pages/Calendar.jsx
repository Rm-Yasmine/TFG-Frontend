import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import API from "../api/axios";
import Menu from "../components/Menu";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const locales = { es: esLocale };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Colores para los proyectos
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

  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Traer proyectos
        const { data: projectData } = await API.get("/projects");
        const projectsList = projectData.data || [];

        // Asignar color a cada proyecto
        const projectsWithColor = projectsList.map((project, index) => ({
          ...project,
          color: projectColors[index % projectColors.length],
        }));
        setProjects(projectsWithColor);

        // Eventos de proyectos (barra completa)
        const projectEvents = projectsWithColor.map((project) => ({
          id: `project-${project.id}`,
          title: `📌 ${project.title}`,
          start: new Date(project.start_date),
          end: new Date(project.end_date),
          allDay: true,
          resource: { type: "project", projectId: project.id, color: project.color },
        }));

        // Traer tareas y asignar color según proyecto
        const { data: tasksData } = await API.get("/tasks");
        const taskEvents = tasksData.data.map((task) => {
          const project = projectsWithColor.find((p) => p.id === task.project_id);
          const color = project ? project.color : "#5ec576";
          return {
            id: task.id,
            title: task.title,
            start: new Date(task.start_date),
            end: new Date(task.due_date),
            allDay: false,
            resource: { type: "task", projectId: task.project_id, color },
          };
        });

        setEvents([...projectEvents, ...taskEvents]);
      } catch (err) {
        console.error("Error cargando calendario:", err);
      }
    };

    fetchData();
  }, []);

  const eventStyleGetter = (event) => {
    const color = event.resource?.color || "#5ec576";
    return { style: { backgroundColor: color, color: "white" } };
  };

  const handleSelectSlot = (slotInfo) => {
    setNewEvent({ ...newEvent, start: slotInfo.start, end: slotInfo.end });
    setShowModal(true);
  };

  const handleAddEvent = async () => {
    if (!newEvent.title) return alert("Agrega un título");

    try {
      const payload = {
        title: newEvent.title,
        start_date: newEvent.start.toISOString(),
        end_date: newEvent.end.toISOString(),
      };
      const { data } = await API.post("/events", payload);

      setEvents((prev) => [
        ...prev,
        {
          id: data.data.id,
          title: data.data.title,
          start: new Date(data.data.start_date),
          end: new Date(data.data.end_date),
          resource: { type: "event", color: "#ffa500" },
        },
      ]);
      setShowModal(false);
      setNewEvent({ title: "", start: new Date(), end: new Date() });
    } catch (err) {
      console.error("Error creando evento:", err);
      alert("No se pudo crear el evento");
    }
  };

  return (
    <div className="dashboard-container d-flex">
      <Menu active="calendar" />
      <div className="content flex-grow-1 p-4">
        <h3 className="fw-bold mb-4">📅 Calendario</h3>

        <Button variant="purple" className="mb-3" onClick={() => setShowModal(true)}>
          + Añadir evento
        </Button>

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

        {/* MODAL PARA AÑADIR EVENTO */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Nuevo Evento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha inicio</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, start: new Date(e.target.value) })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Fecha fin</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, end: new Date(e.target.value) })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="purple" onClick={handleAddEvent}>
              Crear evento
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
