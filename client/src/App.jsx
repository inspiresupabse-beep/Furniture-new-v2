import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EstimationDashboard from './components/EstimationDashboard';
import AdminPanel from './components/AdminPanel';
import AuthPage from './components/AuthPage';
import EstimateReport from './components/EstimateReport';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function AppLayout({ materials, hardware, onConfigSaved }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isEstimation = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-navy text-white shadow-lg px-4 sm:px-8 h-16 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wide">
          Furniture<span className="text-brand">Est</span>
        </h1>
        <nav className="flex items-center gap-1">
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
            to="/reports"
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive ? 'bg-brand text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            Reports
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
          <span className="mx-2 text-white/30">|</span>
          <span className="text-xs text-white/60 px-2">{user?.username}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            Sign out
          </button>
        </nav>
      </header>
      <main
        className={`flex-1 w-full py-4 sm:py-6 ${
          isEstimation
            ? 'px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto'
            : 'px-4 sm:px-8 max-w-[1600px] mx-auto'
        }`}
      >
        <Routes>
          <Route path="/" element={<EstimationDashboard materials={materials} hardware={hardware} />} />
          <Route path="/reports" element={<EstimateReport materials={materials} />} />
          <Route path="/admin" element={<AdminPanel materials={materials} hardware={hardware} onSave={onConfigSaved} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const { isAuthenticated, ready } = useAuth();
  const [materials, setMaterials] = useState(null);
  const [hardware, setHardware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [matRes, hwRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/hardware'),
      ]);
      if (!matRes.ok || !hwRes.ok) {
        throw new Error('Failed to load configuration from server');
      }
      setMaterials(await matRes.json());
      setHardware(await hwRes.json());
    } catch (err) {
      console.error('Failed to load config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else if (ready) {
      setLoading(false);
    }
  }, [isAuthenticated, ready]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/signin" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage mode="signin" />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage mode="signup" />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            {loading ? (
              <div className="min-h-screen flex items-center justify-center text-stone-500">
                Loading configuration...
              </div>
            ) : error || !materials || !hardware ? (
              <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-stone-600 px-6">
                <p className="text-lg font-medium">Could not load configuration</p>
                <p className="text-sm text-stone-500">{error || 'Configuration data is unavailable.'}</p>
                <button
                  type="button"
                  onClick={fetchData}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Retry
                </button>
              </div>
            ) : (
              <AppLayout materials={materials} hardware={hardware} onConfigSaved={fetchData} />
            )}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
