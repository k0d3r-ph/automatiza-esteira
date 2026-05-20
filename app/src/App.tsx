import { Routes, Route, Navigate } from "react-router-dom";
import { Esteira } from "./pages/Esteira/Esteira";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/esteira" replace />} />
      <Route path="/esteira" element={<Esteira />} />
    </Routes>
  );
}

export default App;
