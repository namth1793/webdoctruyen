import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { StoryCardGrid } from '../components/StoryCard';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400)return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

const GENRES = [
  { label: 'Ngôn Tình',     to: '/ngon-tinh',               iconBg: 'from-pink-400 to-rose-500',     icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { label: 'Đam Mỹ',        to: '/dam-my',                  iconBg: 'from-violet-500 to-purple-600', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { label: 'Cổ Trang',      to: '/tim-kiem?q=Cổ trang',     iconBg: 'from-amber-400 to-orange-500',  icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' },
  { label: 'Hiện Đại',      to: '/tim-kiem?q=Hiện đại',     iconBg: 'from-blue-400 to-blue-600',     icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: 'Đô Thị',        to: '/tim-kiem?q=Đô thị',       iconBg: 'from-sky-400 to-cyan-500',      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Huyền Huyễn',   to: '/tim-kiem?q=Huyền huyễn', iconBg: 'from-fuchsia-500 to-pink-600',  icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { label: 'Ngọt Văn',      to: '/tim-kiem?q=Ngọt văn',     iconBg: 'from-pink-300 to-rose-400',     icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { label: 'Thẩm Mến',      to: '/tim-kiem?q=Thẩm mến',    iconBg: 'from-red-400 to-pink-500',      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { label: 'Báo Thù',       to: '/tim-kiem?q=Báo thù',      iconBg: 'from-orange-500 to-red-600',    icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
  { label: 'Tiểu Thuyết',   to: '/tieu-thuyet',             iconBg: 'from-emerald-400 to-teal-600',  icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { label: 'Ngược Luyến',   to: '/tim-kiem?q=Ngược luyến', iconBg: 'from-red-400 to-rose-600',      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { label: 'Vòng Lặp',      to: '/tim-kiem?q=Vòng lặp',    iconBg: 'from-teal-400 to-cyan-600',     icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { label: 'Trinh Thám',    to: '/tim-kiem?q=Trinh thám',  iconBg: 'from-gray-600 to-gray-800',     icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { label: 'Trùng Sinh',    to: '/tim-kiem?q=Trùng sinh',  iconBg: 'from-blue-400 to-indigo-600',   icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Sảng Văn',      to: '/tim-kiem?q=Sảng văn',    iconBg: 'from-yellow-400 to-green-500',  icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Cung Đấu',      to: '/tim-kiem?q=Cung đấu',    iconBg: 'from-purple-500 to-violet-700', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { label: 'Vô Hạn Lưu',   to: '/tim-kiem?q=Vô hạn lưu',  iconBg: 'from-indigo-500 to-blue-700',   icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { label: 'Xuyên Nhanh',   to: '/tim-kiem?q=Xuyên nhanh', iconBg: 'from-amber-400 to-yellow-500',  icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

export default function Home() {
  const { user } = useAuth();
  const [featured,       setFeatured]       = useState([]);
  const [latest,         setLatest]         = useState([]);
  const [hot,            setHot]            = useState([]);
  const [newStories,     setNewStories]     = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [featuredIdx,    setFeaturedIdx]    = useState(0);
  const [loading,        setLoading]        = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      axios.get('/api/stories/featured'),
      axios.get('/api/stories/latest'),
      axios.get('/api/stories/hot'),
      axios.get('/api/stories?sort=new&limit=10'),
    ]).then(([f, l, h, n]) => {
      setFeatured(f.data);
      setLatest(l.data);
      setHot(h.data);
      setNewStories(n.data.stories);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    axios.get('/api/reading-history').then(r => setReadingHistory(r.data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (featured.length < 2) return;
    timerRef.current = setInterval(() => setFeaturedIdx(i => (i + 1) % featured.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [featured]);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setFeaturedIdx(idx);
    timerRef.current = setInterval(() => setFeaturedIdx(i => (i + 1) % featured.length), 5000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cur    = featured[featuredIdx];
  const others = featured.filter((_, i) => i !== featuredIdx).slice(0, 3);

  const beachBg = {
    backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center bottom',
  };

  return (
    <div className="min-h-screen relative" style={beachBg}>

      {/* ── HERO BANNER ── */}
      {cur && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 py-6 sm:py-10 flex items-center gap-4 sm:gap-6 md:gap-10 min-h-[280px] sm:min-h-[380px] md:min-h-[420px]">
            {/* Phone frame */}
            <div className="hidden sm:block shrink-0">
              <div className="relative bg-white rounded-3xl shadow-2xl p-1 border-4 border-white w-[250px]">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
                  <img src={cur.cover_image} alt={cur.title} className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${cur.slug}/300/400`; }} />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-[10px] text-white font-bold text-center leading-tight line-clamp-2">{cur.title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Story info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white mb-2 sm:mb-3 leading-tight uppercase drop-shadow-lg line-clamp-2">
                {cur.title}
              </h2>
              <p className="hidden sm:block text-sm md:text-base text-white/90 leading-relaxed mb-4 line-clamp-3 max-w-xl drop-shadow">
                {cur.description}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                {cur.category_name && <span className="text-sm font-semibold text-white drop-shadow">{cur.category_name}</span>}
                {(cur.genres || []).slice(0, 2).map(g => (
                  <span key={g} className="text-sm font-semibold text-white drop-shadow">{g}</span>
                ))}
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${cur.status === 'complete' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                  {cur.status === 'complete' ? 'Hoàn thành' : 'Đang ra'}
                </span>
                <span className="flex items-center gap-1 text-sm text-white/80 drop-shadow">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {cur.views?.toLocaleString('vi-VN')} lượt xem
                </span>
              </div>
              <Link to={`/doc/${cur.slug}/chuong-1`}
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:scale-95">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Đọc Ngay
              </Link>
            </div>

            {/* Right thumbnails */}
            <div className="hidden lg:flex flex-col gap-3 shrink-0 w-[120px]">
              {others.map(s => (
                <button key={s.id} onClick={() => goTo(featured.indexOf(s))}
                  className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group h-[110px]">
                  <img src={s.cover_image} alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${s.slug}/300/400`; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] text-white font-semibold leading-tight line-clamp-2">{s.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {featured.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === featuredIdx ? 'bg-blue-600 w-6 h-2' : 'bg-white/60 w-2 h-2 hover:bg-white/90'}`} />
            ))}
          </div>
        </div>
      )}

      {/* ── SECTIONS ── */}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">

        {/* 1. TRUYỆN MỚI CẬP NHẬT */}
        <section>
          <SectionHeader title="Truyện Mới Cập Nhật" icon="🕐" accent="bg-blue-500" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {latest.slice(0, 10).map(s => <StoryCardGrid key={s.id} story={s} />)}
          </div>
        </section>

        {/* 2. TRUYỆN HOT */}
        <section>
          <SectionHeader title="Truyện Hot" icon="🔥" accent="bg-orange-500" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {hot.slice(0, 10).map((s, i) => (
              <div key={s.id} className="relative">
                {i < 3 && (
                  <span className={`absolute -top-2 -left-2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg ${
                    i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>{i + 1}</span>
                )}
                <StoryCardGrid story={s} />
              </div>
            ))}
          </div>
        </section>

        {/* 3. TRUYỆN MỚI */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg shadow">Truyện</span>
              <span className="text-white font-black text-xl drop-shadow-md tracking-wide">MỚI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-4 py-1.5 bg-red-500 text-white text-sm font-bold rounded-lg shadow">Vừa đọc</span>
              <span className="text-white font-black text-xl drop-shadow-md tracking-wide">GẦN ĐÂY</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {newStories.slice(0, 6).map(s => (
                <Link key={s.id} to={`/truyen/${s.slug}`}
                  className="group bg-white rounded-2xl p-3 flex gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  <img src={s.cover_image} alt={s.title}
                    className="w-16 h-[86px] object-cover rounded-xl shrink-0"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${s.slug}/300/400`; }} />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-black text-sm text-gray-900 uppercase line-clamp-2 leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 flex-1 leading-relaxed">
                      {s.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                        Chương {s.latest_chapter || s.total_chapters}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(s.updated_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {readingHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-500">Bạn chưa đọc truyện nào</p>
                  <p className="text-xs text-gray-400 mt-1">Lịch sử sẽ hiển thị ở đây</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {readingHistory.slice(0, 6).map(h => (
                    <Link key={h.id} to={`/doc/${h.slug}/chuong-${h.chapter_number}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group">
                      <img src={h.cover_image} alt={h.title}
                        className="w-10 h-[52px] object-cover rounded-lg shrink-0"
                        onError={e => { e.target.src = `https://picsum.photos/seed/${h.slug}/300/400`; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-snug">{h.title}</p>
                        <p className="text-[11px] text-blue-500 font-medium mt-0.5">Chương {h.chapter_number}</p>
                        <p className="text-[11px] text-gray-400">{timeAgo(h.updated_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. THỂ LOẠI TRUYỆN */}
        <section>
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white drop-shadow-md">Thể Loại Truyện</h2>
          </div>

          {/* Genre grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {GENRES.map(g => (
              <Link key={g.label} to={g.to}
                className="group bg-white rounded-2xl px-3 py-3.5 flex items-center gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`w-10 h-10 bg-gradient-to-br ${g.iconBg} rounded-xl flex items-center justify-center shrink-0 shadow`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={g.icon} />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-violet-600 transition-colors leading-tight truncate">{g.label}</span>
              </Link>
            ))}
          </div>

          {/* View all button */}
          <div className="flex justify-center mt-6">
            <Link to="/the-loai"
              className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-white/70 text-white font-semibold rounded-full hover:bg-white/20 transition-colors drop-shadow">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Xem tất cả thể loại
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionHeader({ title, icon, accent, to }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-black text-white flex items-center gap-2.5 drop-shadow-md">
        <span className={`w-1.5 h-7 ${accent} rounded-full`} />
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      {to && (
        <Link to={to} className="text-sm font-semibold text-white/80 hover:text-white flex items-center gap-1 group drop-shadow">
          Xem tất cả
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
