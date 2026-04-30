import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { StoryCardGrid } from '../components/StoryCard';

const BG_IMAGES = [
  'https://picsum.photos/seed/beach-ocean-1/1920/600',
  'https://picsum.photos/seed/landscape-sky/1920/600',
  'https://picsum.photos/seed/nature-river/1920/600',
  'https://picsum.photos/seed/mountain-lake/1920/600',
];

const GENRES = [
  { label: 'Ngôn tình',  emoji: '💗', to: '/ngon-tinh',            color: 'from-pink-500 to-rose-400' },
  { label: 'Đam mỹ',     emoji: '💜', to: '/dam-my',               color: 'from-violet-600 to-purple-400' },
  { label: 'Tiểu thuyết',emoji: '📚', to: '/tieu-thuyet',           color: 'from-blue-600 to-sky-400' },
  { label: 'Cổ trang',   emoji: '🏯', to: '/tim-kiem?q=Cổ trang',  color: 'from-amber-600 to-yellow-400' },
  { label: 'Hiện đại',   emoji: '🏙️', to: '/tim-kiem?q=Hiện đại',  color: 'from-emerald-600 to-teal-400' },
  { label: 'Tu tiên',    emoji: '⚡',  to: '/tim-kiem?q=Tu tiên',   color: 'from-indigo-600 to-blue-400' },
  { label: 'Vô hạn lưu', emoji: '🔁', to: '/tim-kiem?q=Vô hạn lưu',color: 'from-cyan-600 to-sky-400' },
  { label: 'Trọng sinh', emoji: '🌀', to: '/tim-kiem?q=Trọng sinh', color: 'from-fuchsia-600 to-pink-400' },
  { label: 'Xuyên nhanh',emoji: '🚀', to: '/tim-kiem?q=Xuyên nhanh',color:'from-orange-500 to-amber-400' },
  { label: 'Cung đấu',   emoji: '👑', to: '/tim-kiem?q=Cung đấu',  color: 'from-red-600 to-rose-400' },
  { label: 'Sủng văn',   emoji: '🍬', to: '/tim-kiem?q=Sủng văn',  color: 'from-pink-400 to-red-300' },
  { label: 'Hài hước',   emoji: '😄', to: '/tim-kiem?q=Hài hước',  color: 'from-yellow-500 to-orange-400' },
];

export default function Home() {
  const [featured,    setFeatured]    = useState([]);
  const [latest,      setLatest]      = useState([]);
  const [hot,         setHot]         = useState([]);
  const [newStories,  setNewStories]  = useState([]);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [loading,     setLoading]     = useState(true);
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
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center bottom',
  };

  return (
    <div className="min-h-screen relative" style={beachBg}>
      {/* Soft white veil so text stays readable */}
      <div className="absolute inset-0 bg-white/30 dark:bg-gray-950/60 pointer-events-none" />

      {/* ── HERO BANNER ── */}
      {cur && (
        <div className="relative overflow-hidden" style={{ minHeight: 420 }}>

          <div className="relative max-w-7xl mx-auto px-4 py-10 flex items-center gap-6 md:gap-10 min-h-[420px]">
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
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 leading-tight uppercase drop-shadow-sm">
                {cur.title}
              </h2>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed mb-4 line-clamp-4 max-w-xl">
                {cur.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {cur.category_name && <span className="text-sm font-semibold text-blue-600">{cur.category_name}</span>}
                {(cur.genres || []).slice(0, 2).map(g => (
                  <span key={g} className="text-sm font-semibold text-blue-600">{g}</span>
                ))}
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${cur.status === 'complete' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                  {cur.status === 'complete' ? 'Hoàn thành' : 'Đang ra'}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {cur.views?.toLocaleString('vi-VN')} lượt xem
                </span>
              </div>
              <Link to={`/doc/${cur.slug}/chuong-1`}
                className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
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
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {latest.slice(0, 12).map((s, i) => (
                <Link key={s.id} to={`/truyen/${s.slug}`}
                  className={`group flex items-center gap-3 p-3.5 hover:bg-blue-50/80 dark:hover:bg-gray-700/60 transition-colors
                    ${i % 3 !== 2 ? 'lg:border-r' : ''} ${i % 2 !== 1 ? 'sm:border-r lg:border-r-0' : ''}
                    border-b border-gray-100/80 dark:border-gray-700/60 last:border-b-0`}>
                  <div className="relative shrink-0">
                    <img src={s.cover_image} alt={s.title}
                      className="w-11 h-[60px] object-cover rounded-lg shadow"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${s.slug}/300/400`; }} />
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow">
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 truncate leading-snug">
                      {s.title}
                    </p>
                    <p className="text-xs text-blue-500 font-medium mt-0.5">
                      Chương {s.latest_chapter || s.total_chapters}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{s.author}</p>
                  </div>
                </Link>
              ))}
            </div>
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
          <SectionHeader title="Truyện Mới" icon="✨" accent="bg-emerald-500" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {newStories.map(s => <StoryCardGrid key={s.id} story={s} />)}
          </div>
        </section>

        {/* 4. THỂ LOẠI TRUYỆN */}
        <section>
          <SectionHeader title="Thể Loại Truyện" icon="📂" accent="bg-violet-500" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {GENRES.map(g => (
              <Link key={g.label} to={g.to}
                className="group relative overflow-hidden rounded-2xl h-24 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${g.color}`} />
                <div className="relative h-full flex flex-col items-center justify-center gap-1.5 px-2">
                  <span className="text-3xl drop-shadow leading-none">{g.emoji}</span>
                  <span className="text-white font-bold text-sm text-center leading-tight drop-shadow">{g.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionHeader({ title, icon, accent, to }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
        <span className={`w-1.5 h-7 ${accent} rounded-full`} />
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      {to && (
        <Link to={to} className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 group">
          Xem tất cả
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
