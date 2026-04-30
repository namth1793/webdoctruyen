import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StoryCardGrid } from '../components/StoryCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setInput(query);
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    axios.get(`/api/search?q=${encodeURIComponent(query)}&limit=40`).then(r => {
      setResults(r.data.stories);
      setLoading(false);
    });
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Tìm kiếm truyện</h1>
        <form onSubmit={handleSubmit} className="relative">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Nhập tên truyện, tác giả, thể loại..."
            className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 focus:border-blue-500 rounded-2xl outline-none bg-white shadow-sm transition-colors"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
            Tìm
          </button>
        </form>
      </div>

      {/* Popular searches */}
      {!query && (
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-medium text-gray-500 mb-3 text-center">Tìm kiếm phổ biến</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Ngôn tình', 'Đam mỹ', 'Cổ trang', 'Sủng văn', 'Tu tiên', 'Vô hạn lưu', 'Trọng sinh', 'Xuyên nhanh', 'HE', 'Hài hước'].map(g => (
              <button key={g} onClick={() => setSearchParams({ q: g })}
                className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-700 text-sm text-gray-600 rounded-full transition-colors shadow-sm">
                {g}
              </button>
            ))}
          </div>

          <div className="mt-10">
            <p className="text-sm font-medium text-gray-500 mb-4 text-center">Danh mục chính</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { to: '/ngon-tinh', label: 'Ngôn tình', emoji: '💗', color: 'from-rose-50 to-pink-50 border-rose-200' },
                { to: '/dam-my', label: 'Đam mỹ', emoji: '💜', color: 'from-violet-50 to-purple-50 border-violet-200' },
                { to: '/tieu-thuyet', label: 'Tiểu thuyết', emoji: '📚', color: 'from-blue-50 to-indigo-50 border-blue-200' },
              ].map(c => (
                <Link key={c.to} to={c.to}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${c.color} border hover:shadow-md transition-shadow`}>
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-sm font-semibold text-gray-700">{c.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && searched && (
        <>
          <div className="mb-4">
            <p className="text-gray-700">
              Kết quả tìm kiếm cho <span className="font-semibold text-gray-900">"{query}"</span>:
              <span className="ml-2 text-gray-500">{results.length} truyện</span>
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 font-medium">Không tìm thấy truyện phù hợp</p>
              <p className="text-sm text-gray-400 mt-2">Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map(s => <StoryCardGrid key={s.id} story={s} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
