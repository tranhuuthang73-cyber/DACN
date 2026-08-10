import React, { useState, useEffect } from 'react';
import { LogOut, Plus, MapPin, Sprout, Droplets, Check, X, Edit3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

const Dashboard = () => {
  const [plots, setPlots] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [activeSeason, setActiveSeason] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Forms state
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [newPlotName, setNewPlotName] = useState('');
  
  const [showLogForm, setShowLogForm] = useState(false);
  const [logType, setLogType] = useState('WATER');
  const [logAmount, setLogAmount] = useState('');

  const fetchPlots = async () => {
    const { data } = await api.get('/plots');
    setPlots(data);
    if (data.length > 0) handleSelectPlot(data[0]);
  };

  const handleSelectPlot = async (plot: any) => {
    setSelectedPlot(plot);
    const { data: seasonData } = await api.get(`/seasons/plot/${plot.id}`);
    setSeasons(seasonData);
    if (seasonData.length > 0) {
      setActiveSeason(seasonData[0]);
      fetchLogsAndRecs(seasonData[0].id);
    } else {
      setActiveSeason(null);
      setRecommendations([]);
      setLogs([]);
    }
  };

  const fetchLogsAndRecs = async (seasonId: number) => {
    const { data: logsData } = await api.get(`/logs/season/${seasonId}`);
    setLogs(logsData);
    
    try {
      const { data: recData } = await api.get(`/ai/recommendations/${seasonId}`);
      setRecommendations(recData);
    } catch (e) {
      setRecommendations([]);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleCreatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/plots', { name: newPlotName, area_m2: 1000 });
    setShowPlotForm(false);
    fetchPlots();
  };

  const handleCreateSeason = async () => {
    if (!selectedPlot) return;
    await api.post('/seasons', {
      plot_id: selectedPlot.id,
      crop_type: 'Lúa',
      planted_date: new Date().toISOString(),
      target_yield: 5000
    });
    handleSelectPlot(selectedPlot);
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason) return;
    await api.post('/logs', {
      season_id: activeSeason.id,
      type: logType,
      amount: parseFloat(logAmount),
      unit: logType === 'WATER' ? 'lít' : 'kg'
    });
    setShowLogForm(false);
    fetchLogsAndRecs(activeSeason.id);
  };

  const handleFeedback = async (recId: number, action: string, actualValue?: number) => {
    await api.post(`/ai/feedback/${recId}`, { action, actual_value: actualValue });
    alert(`Đã gửi phản hồi: ${action}`);
    fetchLogsAndRecs(activeSeason.id);
  };

  // Mock data for chart based on logs over time (simplification)
  const chartData = logs.map(l => ({
    date: new Date(l.logged_at).toLocaleDateString(),
    amount: l.amount
  })).reverse();

  return (
    <div className="min-h-screen bg-nature-light flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-nature-dark text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 flex items-center"><Sprout className="mr-2" /> Nông Trại</h2>
        
        <div className="flex-1">
          <h3 className="text-sm uppercase text-gray-300 font-semibold mb-4">Thửa đất của tôi</h3>
          <ul className="space-y-2">
            {plots.map(plot => (
              <li key={plot.id}>
                <button 
                  onClick={() => handleSelectPlot(plot)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition ${selectedPlot?.id === plot.id ? 'bg-nature' : 'hover:bg-nature-dark/80'}`}
                >
                  <MapPin size={18} className="mr-2" /> {plot.name}
                </button>
              </li>
            ))}
          </ul>
          
          <button 
            onClick={() => setShowPlotForm(true)}
            className="mt-4 w-full flex items-center justify-center py-2 border border-nature rounded-lg hover:bg-nature transition"
          >
            <Plus size={18} className="mr-2" /> Thêm thửa đất
          </button>
        </div>
        
        <button onClick={handleLogout} className="mt-auto flex items-center text-red-300 hover:text-red-100 transition">
          <LogOut size={18} className="mr-2" /> Đăng xuất
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {selectedPlot ? (
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{selectedPlot.name}</h1>
                <p className="text-gray-500 mt-1">Diện tích: {selectedPlot.area_m2} m²</p>
              </div>
              {!activeSeason && (
                <button onClick={handleCreateSeason} className="bg-nature text-white px-4 py-2 rounded-lg font-semibold hover:bg-nature-dark shadow">
                  Bắt đầu vụ mùa mới
                </button>
              )}
            </div>

            {activeSeason && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* AI Recommendations Column */}
                <div className="lg:col-span-1 space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">Gợi ý từ AI 🤖</h3>
                  {recommendations.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có gợi ý nào. Hãy nhập thêm dữ liệu canh tác.</p>
                  ) : (
                    recommendations.map(rec => (
                      <div key={rec.id} className="bg-white rounded-xl shadow-lg border border-nature-accent/20 p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-nature-accent"></div>
                        <div className="flex items-center mb-3 text-nature-dark">
                          <Droplets className="mr-2" size={20} />
                          <h4 className="font-bold text-lg">Cần thêm {rec.type === 'WATER' ? 'Nước' : 'Phân bón'}</h4>
                        </div>
                        <p className="text-3xl font-black text-gray-800 mb-1">{rec.suggested_amount.toFixed(1)} <span className="text-base font-normal text-gray-500">{rec.type === 'WATER' ? 'lít' : 'kg'}</span></p>
                        <p className="text-sm text-gray-400 mb-5">Độ tin cậy: {(rec.confidence_score * 100).toFixed(0)}%</p>
                        
                        <div className="flex gap-2">
                          <button onClick={() => handleFeedback(rec.id, 'ACCEPTED')} className="flex-1 bg-nature text-white py-2 rounded-md font-semibold flex justify-center items-center hover:bg-nature-dark transition">
                            <Check size={16} className="mr-1" /> Có
                          </button>
                          <button onClick={() => {
                            const val = prompt('Bạn đã dùng bao nhiêu?');
                            if (val) handleFeedback(rec.id, 'MODIFIED', parseFloat(val));
                          }} className="flex-1 bg-nature-accent text-white py-2 rounded-md font-semibold flex justify-center items-center hover:bg-orange-600 transition">
                            <Edit3 size={16} className="mr-1" /> Sửa
                          </button>
                          <button onClick={() => handleFeedback(rec.id, 'REJECTED')} className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-md font-semibold flex justify-center items-center hover:bg-gray-300 transition">
                            <X size={16} className="mr-1" /> Bỏ
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Logs and Chart Column */}
                <div className="lg:col-span-2 space-y-6">
                  
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">Nhật ký canh tác</h3>
                      <button onClick={() => setShowLogForm(!showLogForm)} className="bg-nature text-white px-3 py-1.5 rounded-lg flex items-center text-sm font-semibold hover:bg-nature-dark transition">
                        <Plus size={16} className="mr-1" /> Thêm nhật ký
                      </button>
                    </div>

                    {showLogForm && (
                      <form onSubmit={handleCreateLog} className="bg-nature-light p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end border border-nature/20">
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                          <select value={logType} onChange={e => setLogType(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300">
                            <option value="WATER">Tưới nước</option>
                            <option value="FERTILIZER">Bón phân</option>
                          </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                          <input type="number" required value={logAmount} onChange={e => setLogAmount(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300" placeholder="0" />
                        </div>
                        <button type="submit" className="bg-nature-dark text-white px-4 py-2 rounded-md font-bold hover:bg-nature transition">Lưu</button>
                      </form>
                    )}

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="amount" stroke="#889c76" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-6 border-t pt-4 max-h-48 overflow-y-auto">
                      {logs.map(log => (
                        <div key={log.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-3 ${log.type === 'WATER' ? 'bg-blue-400' : 'bg-nature-accent'}`}></span>
                            <span className="font-medium text-gray-700">{log.type === 'WATER' ? 'Tưới nước' : 'Bón phân'}</span>
                          </div>
                          <div className="text-gray-500 font-semibold">{log.amount} {log.unit}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Sprout size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-semibold">Chọn hoặc tạo thửa đất để bắt đầu</h2>
          </div>
        )}
      </div>

      {/* Plot Modal */}
      {showPlotForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Thêm thửa đất mới</h3>
            <form onSubmit={handleCreatePlot}>
              <input
                type="text"
                placeholder="Tên thửa đất (VD: Vườn sầu riêng số 1)"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 outline-none focus:border-nature focus:ring-1 focus:ring-nature"
                value={newPlotName}
                onChange={e => setNewPlotName(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowPlotForm(false)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-nature text-white font-bold rounded-lg hover:bg-nature-dark">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
