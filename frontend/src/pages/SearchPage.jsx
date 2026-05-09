import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StoryCardGrid } from '../components/StoryCard';

const SORT_LABELS = { new: 'Truyện mới', views: 'Xem nhiều', favorites: 'Đề cử' };
const STATUS_LABELS = { complete: 'Hoàn thành', ongoing: 'Đang ra' };

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query  = searchParams.get('q')      || '';
  const sort   = searchParams.get('sort')   || '';
  const status = searchParams.get('status') || '';
  const tag    = searchParams.get('tag')    || '';

  const [input, setInput] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [allTags, setAllTags] = useState([]);

  // Fetch tags list once
  useEffect(() => {
    axios.get('/api/tags').then(r => setAllTags(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setInput(query);
    if (query.trim()) {
      setLoading(true); setSearched(true);
      axios.get(`/api/search?q=${encodeURIComponent(query)}&limit=40`).then(r => {
        setResults(r.data.stories); setLoading(false);
      });
      return;
    }
    if (sort || status || tag) {
      setLoading(true); setSearched(true);
      const p = new URLSearchParams({ limit: 40 });
      if (sort)   p.set('sort', sort);
      if (status) p.set('status', status);
      if (tag)    p.set('tag', tag);
      axios.get(`/api/stories?${p}`).then(r => {
        setResults(r.data.stories); setLoading(false);
      });
      return;
    }
    setResults([]); setSearched(false);
  }, [query, sort, status, tag]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  const activeTag = allTags.find(t => t.slug === tag);
  const pageTitle = query
    ? `"${query}"`
    : activeTag ? `#${activeTag.name}`
    : SORT_LABELS[sort] || STATUS_LABELS[status] || '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Tìm kiếm truyện</h1>
        <form onSubmit={handleSubmit} className="relative">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Nhập tên truyện, tác giả, thể loại..."
            className="w-full pl-12 pr-28 py-4 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 rounded-2xl outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm transition-colors"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
            Tìm
          </button>
        </form>
      </div>

      {/* Discovery — chỉ khi chưa search */}
      {!searched && (
        <div className="space-y-10 max-w-4xl mx-auto">
          {/* Danh mục */}
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Thể loại chính</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { to: '/ngon-tinh',        label: 'Ngôn tình',  emoji: '💗', color: 'from-rose-50 to-pink-50 border-rose-200 dark:from-rose-900/20 dark:to-pink-900/20 dark:border-rose-800' },
                { to: '/dam-my',           label: 'Đam mỹ',     emoji: '💜', color: 'from-violet-50 to-purple-50 border-violet-200 dark:from-violet-900/20 dark:to-purple-900/20 dark:border-violet-800' },
                { to: '/the-loai/co-trang',label: 'Cổ trang',   emoji: '🏯', color: 'from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-800' },
                { to: '/the-loai/hien-dai',label: 'Hiện đại',   emoji: '🏙️', color: 'from-blue-50 to-sky-50 border-blue-200 dark:from-blue-900/20 dark:to-sky-900/20 dark:border-blue-800' },
                { to: '/the-loai/mat-the', label: 'Mạt thế',    emoji: '🌑', color: 'from-gray-50 to-slate-50 border-gray-200 dark:from-gray-800/40 dark:to-slate-800/40 dark:border-gray-700' },
                { to: '/the-loai/kinh-di', label: 'Kinh dị',    emoji: '👻', color: 'from-red-50 to-orange-50 border-red-200 dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-800' },
                { to: '/the-loai/tuong-lai',label: 'Tương lai',  emoji: '🚀', color: 'from-cyan-50 to-teal-50 border-cyan-200 dark:from-cyan-900/20 dark:to-teal-900/20 dark:border-cyan-800' },
                { to: '/the-loai/bach-hop',label: 'Bách hợp',   emoji: '🌸', color: 'from-pink-50 to-fuchsia-50 border-pink-200 dark:from-pink-900/20 dark:to-fuchsia-900/20 dark:border-pink-800' },
              ].map(c => (
                <Link key={c.to} to={c.to}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br ${c.color} border hover:shadow-md transition-all`}>
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{c.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          {allTags.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Hashtag phổ biến</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(t => (
                  <button key={t.slug} onClick={() => setSearchParams({ tag: t.slug })}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 text-sm text-gray-600 dark:text-gray-300 rounded-full transition-colors shadow-sm">
                    #{t.name}
                    {t.count > 0 && <span className="ml-1 text-xs text-gray-400">{t.count}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 dark:text-white text-lg">{pageTitle}</span>
              <span className="text-sm text-gray-400">{results.length} truyện</span>
            </div>
            <button onClick={() => { setSearchParams({}); setSearched(false); }}
              className="text-sm text-blue-600 hover:underline">← Quay lại</button>
          </div>

          {/* Tag filter chips nếu đang filter theo tag */}
          {tag && allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {allTags.map(t => (
                <button key={t.slug} onClick={() => setSearchParams({ tag: t.slug })}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    t.slug === tag
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-700'
                  }`}>
                  #{t.name}
                </button>
              ))}
            </div>
          )}

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
