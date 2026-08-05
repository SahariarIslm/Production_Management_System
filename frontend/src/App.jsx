import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Inventory from "./pages/Inventory";
import Masters from "./pages/Masters";
import Production from "./pages/Production";
import History from "./pages/History";
import Traceability from "./pages/Traceability";

export default function App() {
  const navItems = [
    ["/", "Inventory"],
    ["/masters", "Master Data"],
    ["/production", "Production"],
    ["/history", "History"],
    ["/trace", "Traceability"],
  ];

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-700">Production Management System</p>
              <h1 className="text-2xl font-semibold tracking-normal">Manufacturing Admin</h1>
            </div>
            <nav className="flex flex-wrap gap-2">
              {navItems.map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Routes>
            <Route path="/" element={<Inventory />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/production" element={<Production />} />
            <Route path="/history" element={<History />} />
            <Route path="/trace" element={<Traceability />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
