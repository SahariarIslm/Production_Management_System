import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
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
      <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
        <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-5 py-5">
              <p className="text-sm font-medium text-teal-700">Production Management System</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal">Manufacturing Admin</h1>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-col lg:overflow-visible">
              {navItems.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    [
                      "whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-teal-700",
                    ].join(" ")
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto hidden border-t border-slate-200 px-5 py-4 text-xs text-slate-500 lg:block">
              Docker Admin Dashboard
            </div>
          </div>
        </aside>
        <main className="w-full px-4 py-6 lg:ml-72 lg:px-8">
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
