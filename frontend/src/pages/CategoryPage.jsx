import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { StoryCardGrid } from '../components/StoryCard';

const CATEGORY_INFO = {
  'ngon-tinh': { name: 'Ngôn Tình', emoji: '💗', desc: 'Truyện ngôn tình lãng mạn ngọt ngào, tình cảm đôi lứa', color: 'rose' },
  'dam-my': { name: 'Đam Mỹ', emoji: '💜', desc: 'Truyện đam mỹ BL/Yaoi, tình cảm nam nam', color: 'violet' },
  'tieu-thuyet': { name: 'Tiểu Thuyết', emoji: '📚', desc: 'Tiểu thuyết đa thể loại, huyền huyễn, phiêu lưu', color: 'blue' },
};

const GENRES = ['Sủng văn', 'Cổ trang', 'Hiện đại', 'Tu tiên', 'Vô hạn lưu', 'Trọng sinh', 'Xuyên nhanh', 'Cung đấu', 'Báo thù', 'Hệ thống', 'HE', 'Hài hước', 'Phiêu lưu', 'Bí ẩn', 'Lịch sử', 'Đô thị', 'Giải trí'];

const SORT_OPTIONS = [
  { value: 'updated', label: 'Mới cập nhật' },
  { value: 'views', label: 'Xem nhiều nhất' },
  { value: 'favorites', label: 'Yêu thích nhất' },
  { value: 'chapters', label: 'Nhiều chương nhất' },
];

export default function CategoryPage({ category: propCategory }) {
  const { genre } = useParams();
  const location = useLocation();

  const category = propCategory || null;
  const info = CATEGORY_INFO[category];

  const [stories, setStories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('updated');
  const [status, setStatus] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(genre || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
    setSelectedGenre(genre || '');
  }, [location.pathname, genre]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, page, limit: 20 });
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (selectedGenre) params.set('genre', selectedGenre);

    axios.get(`/api/stories?${params}`).then(r => {
      setStories(r.data.stories);
      setTotal(r.data.total);
      setTotalPages(r.data.totalPages);
      setLoading(false);
    });
  }, [category, sort, status, selectedGenre, page]);

  const colorMap = {
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', btn: 'bg-rose-600 hover:bg-rose-700', tag: 'bg-rose-100 text-rose-700 border-rose-200' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', btn: 'bg-violet-600 hover:bg-violet-700', tag: 'bg-violet-100 text-violet-700 border-violet-200' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700', tag: 'bg-blue-100 text-blue-700 border-blue-200' },
  };
  const colors = colorMap[info?.color || 'blue'];

  const title = info ? `${info.emoji} ${info.name}` : (selectedGenre ? `Thể loại: ${selectedGenre}` : 'Tất cả truyện');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      {info && (
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-5 mb-6`}>
          <h1 className={`text-2xl font-bold ${colors.text} mb-1`}>{title}</h1>
          <p className="text-sm text-gray-600">{info.desc}</p>
        </div>
      )}
      {!info && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-sm text-gray-500">{total} truyện</p>
        </div>
      )}

      {/* Genre filter */}
      {category && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-500 mr-1">Lọc:</span>
            <button
              onClick={() => { setSelectedGenre(''); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${!selectedGenre ? `${colors.tag} border` : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              Tất cả
            </button>
            {GENRES.map(g => (
              <button key={g}
                onClick={() => { setSelectedGenre(g === selectedGenre ? '' : g); setPage(1); }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${selectedGenre === g ? `${colors.tag} border` : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort & filter bar */}
      <div className="flex items-center justify-between gap-3 mb-5 bg-white border border-gray-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 hidden sm:block">Trạng thái:</span>
          {['', 'complete', 'ongoing'].map(s => (
            <button key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s === '' ? 'Tất cả' : s === 'complete' ? 'Hoàn thành' : 'Đang ra'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 hidden sm:block">Sắp xếp:</span>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-blue-400">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Stories grid */}
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
      ) : stories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 font-medium">Không có truyện nào</p>
          <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-3">Tìm thấy <span className="font-semibold text-gray-900">{total}</span> truyện</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stories.map(s => <StoryCardGrid key={s.id} story={s} />)}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            ← Trước
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p;
            if (totalPages <= 5) p = i + 1;
            else if (page <= 3) p = i + 1;
            else if (page >= totalPages - 2) p = totalPages - 4 + i;
            else p = page - 2 + i;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${page === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
                {p}
              </button>
            );
          })}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
