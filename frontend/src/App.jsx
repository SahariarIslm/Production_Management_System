import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Inventory from "./pages/Inventory";
import Traceability from "./pages/Traceability";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-800 text-white p-4 flex gap-6">
        <Link to="/">Inventory</Link>
        <Link to="/trace">Traceability</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inventory />} />
        <Route path="/trace" element={<Traceability />} />
      </Routes>
    </BrowserRouter>
  );
}