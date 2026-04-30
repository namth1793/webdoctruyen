import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { StoryCardGrid } from '../components/StoryCard';

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('bookmarks');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/dang-nhap');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      axios.get('/api/auth/bookmarks'),
      axios.get('/api/reading-history'),
    ]).then(([b, h]) => {
      setBookmarks(b.data);
      setHistory(h.data);
      setLoading(false);
    });
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tủ truyện của tôi</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        <button onClick={() => setTab('bookmarks')}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'bookmarks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          📖 Truyện đã lưu
          {bookmarks.length > 0 && <span className="ml-2 text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5">{bookmarks.length}</span>}
        </button>
        <button onClick={() => setTab('history')}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          🕐 Lịch sử đọc
          {history.length > 0 && <span className="ml-2 text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5">{history.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-gray-200" />
              <div className="p-2.5 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'bookmarks' ? (
        bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500 font-medium">Chưa lưu truyện nào</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Nhấn vào nút "Lưu truyện" để thêm vào đây</p>
            <Link to="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              Khám phá truyện
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bookmarks.map(s => <StoryCardGrid key={s.id} story={s} />)}
          </div>
        )
      ) : (
        history.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-gray-500 font-medium">Chưa có lịch sử đọc</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Bắt đầu đọc truyện để lưu lịch sử</p>
            <Link to="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              Đọc ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(h => (
              <Link key={h.id} to={`/doc/${h.slug}/chuong-${h.chapter_number}`}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group">
                <img src={h.cover_image} alt={h.title}
                  className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={e => { e.target.src = `https://picsum.photos/seed/${h.slug}/300/400`; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 truncate">{h.title}</h3>
                  <p className="text-sm text-blue-600 mt-1">Đang đọc: Chương {h.chapter_number} / {h.total_chapters}</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (h.chapter_number / h.total_chapters) * 100)}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-gray-400">{new Date(h.updated_at).toLocaleDateString('vi-VN')}</span>
                  <p className="mt-1 text-xs text-blue-600 font-medium group-hover:underline">Đọc tiếp →</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
