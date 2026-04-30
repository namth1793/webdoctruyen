import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white rounded-xl p-5 border-l-4 ${color} shadow-sm`}>
    <div className="text-2xl font-bold text-gray-900">{value?.toLocaleString('vi-VN')}</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <a href="/" target="_blank" className="text-sm text-blue-600 hover:underline">Xem trang chủ →</a>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Tổng truyện" value={stats.stories} color="border-blue-500" />
            <StatCard label="Tổng chương" value={stats.chapters} color="border-green-500" />
            <StatCard label="Người dùng" value={stats.users} color="border-purple-500" />
            <StatCard label="Bình luận" value={stats.comments} color="border-orange-500" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Top 5 truyện nhiều lượt xem</h2>
            <div className="space-y-3">
              {stats.topStories?.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{s.title}</span>
                  <span className="text-sm text-gray-500">{s.views?.toLocaleString('vi-VN')} lượt</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {[
          { to: '/admin/truyen', label: '+ Thêm truyện mới', color: 'bg-blue-600 hover:bg-blue-700' },
          { to: '/admin/danh-muc', label: 'Quản lý danh mục', color: 'bg-green-600 hover:bg-green-700' },
          { to: '/admin/affiliate', label: 'Cấu hình Affiliate', color: 'bg-purple-600 hover:bg-purple-700' },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className={`${item.color} text-white text-sm font-medium text-center py-3 rounded-lg transition-colors`}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
