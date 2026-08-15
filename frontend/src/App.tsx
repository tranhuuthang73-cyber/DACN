import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SeasonsManager from './pages/SeasonsManager';
import FinancialsManager from './pages/FinancialsManager';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import AIChatDrawer from './components/AIChatDrawer';
import api from './api';

const MainApp = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'seasons' | 'financials' | 'admin'>('dashboard');
  const [plots, setPlots] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchProfileAndPlots = async () => {
    setLoading(true);
    try {
      const { data: userData } = await api.get('/auth/me');
      setUser(userData);

      const { data: plotData } = await api.get('/plots');
      setPlots(plotData);
      if (plotData.length > 0 && !selectedPlot) {
        setSelectedPlot(plotData[0]);
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPlots();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center font-bold text-emerald-400">
        Đang khởi động Smart Farm System...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 flex flex-col font-sans relative">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            plots={plots}
            selectedPlot={selectedPlot}
            onPlotSelect={setSelectedPlot}
            onRefreshPlots={fetchProfileAndPlots}
          />
        )}

        {activeTab === 'seasons' && (
          <SeasonsManager
            plots={plots}
            selectedPlot={selectedPlot}
            onPlotSelect={setSelectedPlot}
          />
        )}

        {activeTab === 'financials' && <FinancialsManager />}

        {activeTab === 'admin' && user?.role === 'ADMIN' && <AdminPanel />}
      </main>

      {/* Floating AI Assistant Chatbot Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label="Mở Trợ lý AI Hỏi Đáp"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 text-emerald-950 font-black rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-emerald-500/20"
        title="Trợ lý AI Smart Farm"
      >
        <SparklesIcon className="w-8 h-8 font-bold" aria-hidden="true" />
      </button>

      {/* AI Chatbot Drawer */}
      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        plotName={selectedPlot?.name}
      />
    </div>
  );
};

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainApp />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
