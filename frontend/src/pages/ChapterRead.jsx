import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FONT_SIZES = [14, 16, 18, 20, 22, 24];
const THEMES = [
  { id: 'light', label: 'Sáng', bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-200' },
  { id: 'sepia', label: 'Sepia', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' },
  { id: 'dark', label: 'Tối', bg: 'bg-gray-900', text: 'text-gray-100', border: 'border-gray-700' },
];

export default function ChapterRead() {
  const { storySlug, chapterSlug } = useParams();
  const navigate = useNavigate();
  const chNum = parseInt(chapterSlug?.replace('chuong-', '') || '');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [allChapters, setAllChapters] = useState([]);
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('rd_fontSize') || 18));
  const [themeId, setThemeId] = useState(() => localStorage.getItem('rd_theme') || 'light');
  const [progress, setProgress] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [adLink, setAdLink] = useState(null);
  const lastScrollY = useRef(0);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  // Chương 2, rồi mỗi +4: 6, 10, 14, ...
  const showAd = !isNaN(chNum) && chNum >= 2 && (chNum - 2) % 4 === 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    axios.get(`/api/chapters/${storySlug}/${chNum}`).then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => navigate(`/truyen/${storySlug}`));
  }, [storySlug, chNum]);

  useEffect(() => {
    axios.get(`/api/chapters/${storySlug}?limit=200`).then(r => setAllChapters(r.data.chapters));
  }, [storySlug]);

  useEffect(() => {
    if (!showAd) return;
    axios.get('/api/affiliate/active').then(r => { if (r.data) setAdLink(r.data); }).catch(() => {});
  }, [showAd]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      if (Math.abs(scrollTop - lastScrollY.current) > 5) {
        setNavVisible(scrollTop < lastScrollY.current || scrollTop < 100);
        lastScrollY.current = scrollTop;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft' && data?.prev) navigate(`/doc/${storySlug}/chuong-${data.prev.chapter_number}`);
      if (e.key === 'ArrowRight' && data?.next) navigate(`/doc/${storySlug}/chuong-${data.next.chapter_number}`);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [data]);

  const changeFontSize = (val) => {
    const newSize = Math.max(14, Math.min(24, val));
    setFontSize(newSize);
    localStorage.setItem('rd_fontSize', newSize);
  };

  const changeTheme = (id) => {
    setThemeId(id);
    localStorage.setItem('rd_theme', id);
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { chapter, story, prev, next } = data;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors`}>
      {/* Reading progress bar */}
      <div className="reading-progress" style={{ width: `${progress}%` }} />



      {/* Top nav */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`${theme.bg} border-b ${theme.border} shadow-sm`}>
          <div className="max-w-3xl mx-auto px-4 h-12 flex items-center gap-3">
            <Link to={`/truyen/${storySlug}`}
              className="flex items-center gap-1 text-sm hover:text-blue-600 shrink-0 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div className="flex-1 min-w-0 text-center">
              <p className="text-xs truncate opacity-60">{story.title}</p>
              <p className="text-sm font-medium truncate">{chapter.title || `Chương ${chapter.chapter_number}`}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => { setShowChapterList(p => !p); setShowSettings(false); }}
                className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${showChapterList ? 'bg-black/10' : ''}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              </button>
              <button onClick={() => { setShowSettings(p => !p); setShowChapterList(false); }}
                className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${showSettings ? 'bg-black/10' : ''}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className={`${theme.bg} border-b ${theme.border} shadow-md`}>
            <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-70">Cỡ chữ</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeFontSize(fontSize - 2)} className="w-8 h-8 rounded-full border border-current/20 flex items-center justify-center text-lg font-bold hover:bg-black/10">−</button>
                  <span className="text-sm w-8 text-center">{fontSize}</span>
                  <button onClick={() => changeFontSize(fontSize + 2)} className="w-8 h-8 rounded-full border border-current/20 flex items-center justify-center text-lg font-bold hover:bg-black/10">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-70">Giao diện</span>
                <div className="flex gap-2">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => changeTheme(t.id)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${themeId === t.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} ${t.bg} ${t.text}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapter list panel */}
        {showChapterList && (
          <div className={`${theme.bg} border-b ${theme.border} shadow-md max-h-72 overflow-y-auto`}>
            <div className="max-w-3xl mx-auto">
              {allChapters.map(ch => (
                <Link key={ch.id} to={`/doc/${storySlug}/chuong-${ch.chapter_number}`}
                  onClick={() => setShowChapterList(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 transition-colors border-b ${theme.border} ${ch.chapter_number === chNum ? 'bg-blue-600 text-white' : ''}`}>
                  <span className="opacity-60 w-16 shrink-0">Chương {ch.chapter_number}</span>
                  <span className="truncate">{ch.title || `Chương ${ch.chapter_number}`}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center mb-8">
          <Link to={`/truyen/${storySlug}`} className="text-sm text-blue-600 hover:underline">{story.title}</Link>
          <h1 className="text-xl font-bold mt-2">{chapter.title || `Chương ${chapter.chapter_number}`}</h1>
        </div>

        <div className="reading-content" style={{ fontSize: `${fontSize}px` }}>
          {chapter.content?.split('\n\n').map((para, i) => (
            <p key={i} className="mb-5">{para}</p>
          ))}
        </div>

        {/* Ad banner — chương 2, 6, 10, 14, ... */}
        {showAd && adLink && (
          <div className="my-8 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 p-4 text-center">
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-2">Quảng cáo</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{adLink.description || adLink.name}</p>
            <a href={adLink.url} target="_blank" rel="noopener noreferrer"
              onClick={() => axios.post(`/api/affiliate/click/${adLink.id}`).catch(() => {})}
              className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              {adLink.name}
            </a>
          </div>
        )}

        {/* Chapter navigation */}
        <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-current/10">
          {prev ? (
            <Link to={`/doc/${storySlug}/chuong-${prev.chapter_number}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-current/20 hover:bg-black/5 transition-colors max-w-[45%]">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <div className="text-left min-w-0">
                <p className="text-xs opacity-60">Chương trước</p>
                <p className="text-sm font-medium truncate">Chương {prev.chapter_number}</p>
              </div>
            </Link>
          ) : <div />}

          <Link to={`/truyen/${storySlug}`}
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl border border-current/20 hover:bg-black/5 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-xs opacity-60">Trang truyện</span>
          </Link>

          {next ? (
            <Link to={`/doc/${storySlug}/chuong-${next.chapter_number}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-current/20 hover:bg-black/5 transition-colors max-w-[45%]">
              <div className="text-right min-w-0">
                <p className="text-xs opacity-60">Chương sau</p>
                <p className="text-sm font-medium truncate">Chương {next.chapter_number}</p>
              </div>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          ) : (
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl border border-current/20 opacity-40 cursor-not-allowed max-w-[45%]">
              <div className="text-right min-w-0">
                <p className="text-xs">Chương sau</p>
                <p className="text-sm font-medium">Hết truyện</p>
              </div>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          )}
        </div>

        <p className="text-center text-xs opacity-40 mt-4">← → để chuyển chương nhanh</p>
      </div>
    </div>
  );
}
