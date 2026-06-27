import { Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EstimationDashboard from './components/EstimationDashboard';
import AdminPanel from './components/AdminPanel';

function App() {
  const [materials, setMaterials] = useState(null);
  const [hardware, setHardware] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [matRes, hwRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/hardware'),
      ]);
      setMaterials(await matRes.json());
      setHardware(await hwRes.json());
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-navy text-white shadow-lg px-8 h-16 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wide">
          Furniture<span className="text-brand">Est</span>
        </h1>
        <nav className="flex gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive ? 'bg-brand text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            Estimation
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive ? 'bg-brand text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            Admin
          </NavLink>
        </nav>
      </header>
      <main className="flex-1 px-8 py-6 max-w-[1600px] mx-auto w-full">
        <Routes>
          <Route path="/" element={<EstimationDashboard materials={materials} hardware={hardware} />} />
          <Route path="/admin" element={<AdminPanel materials={materials} hardware={hardware} onSave={fetchData} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
