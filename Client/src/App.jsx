import ExplainThis from "./pages/ExplainThis";
import { Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* New / empty state */}
      <Route path="/" element={<ExplainThis />} />

      {/* Saved item */}
      <Route path="/item/:id" element={<ExplainThis />} />
    </Routes>
  );
}

export default App;
