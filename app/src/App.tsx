import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { Esteira } from "./pages/Esteira/Esteira";
import { Historico } from "./pages/Historico/Historico";

function App() {
  return (
    <>
      <nav className="app-nav">
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
        <Route path="/" element={<Navigate to="/esteira" replace />} />
        <Route path="/esteira" element={<Esteira />} />
        <Route path="/historico" element={<Historico />} />
      </Routes>
    </>
  );
}

export default App;
