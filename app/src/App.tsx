import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { Esteira } from "./pages/Esteira/Esteira";
import { Historico } from "./pages/Historico/Historico";
import Home from "./pages/Home/Home";

function App() {
  return (
    <>
      <nav className="app-nav">
        <NavLink
          to="/home"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Home
        </NavLink>
        <NavLink
          to="/esteira"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Esteira
        </NavLink>
        <NavLink
          to="/historico"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Histórico de Ocorrências
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/esteira" element={<Esteira />} />
        <Route path="/esteira/:id" element={<Esteira />} />

        <Route path="/historico" element={<Historico />} />

        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
