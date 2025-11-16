import React, { useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import "../App.css";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";
import Notes from "../pages/Notes";
import Calendar from "../pages/Calendar";
function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = useRef(null);

  const animatedPaths = ["/login", "/register"];

  const isAnimated = animatedPaths.includes(location.pathname);

  return (
    <>
      {isAnimated ? (
        <TransitionGroup component={null}>
          <CSSTransition
            key={location.pathname}
            classNames="page"
            timeout={700}
            nodeRef={nodeRef}
          >
            <div ref={nodeRef}>
              <Routes location={location}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </div>
          </CSSTransition>
        </TransitionGroup>
      ) : (
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/calendar" element={<Calendar />} />

        </Routes>
      )}
    </>
  );
}

export default function AppRoutes() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
