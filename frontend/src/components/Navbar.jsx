import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const THE_LOAI = [
  { label: 'Ngôn tình', to: '/ngon-tinh' },
  { label: 'Đam mỹ', to: '/dam-my' },
  { label: 'Bách hợp', to: '/the-loai/bach-hop' },
  { label: 'Hiện đại', to: '/the-loai/hien-dai' },
  { label: 'Cổ trang', to: '/the-loai/co-trang' },
  { label: 'Mạt thế', to: '/the-loai/mat-the' },
  { label: 'Kinh dị', to: '/the-loai/kinh-di' },
  { label: 'Tương lai', to: '/the-loai/tuong-lai' },
  { label: 'Tiểu thuyết', to: '/tieu-thuyet' },
  { label: 'Huyền huyễn', to: '/the-loai/huyen-huyen' },
  { label: 'Tiên hiệp', to: '/the-loai/tien-hiep' },
  { label: 'Đô thị', to: '/the-loai/do-thi' },
  { label: 'Xuyên không', to: '/the-loai/xuyen-khong' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [scrolled, setScrolled] = useState(false);
  const [openDrop, setOpenDrop] = useState(null); // 'theloai' | 'tinhtrang' | 'menu'
  const inputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length >= 1) {
        const r = await axios.get(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        setResults(r.data.stories);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDrop(null);
    setShowResults(false);
    setQuery('');
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (!searchBoxRef.current?.contains(e.target)) setShowResults(false);
      if (!navRef.current?.contains(e.target)) setOpenDrop(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const toggleDrop = (name) => setOpenDrop(p => p === name ? null : name);

  const isActive = (path, search) => {
    if (search) return location.pathname === path && location.search.includes(search);
    return location.pathname === path;
  };

  const navBtn = (active) =>
    `px-3.5 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors ${active ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-white font-medium hover:bg-blue-700'}`;

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar — ẩn khi scroll */}
      <div className={`bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-20 flex items-center gap-2 sm:gap-4">
          {/* Logo — compact on mobile */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/assets/logo.png" alt="Truyện Huba" className="w-10 h-10 sm:w-20 sm:h-20 object-contain shrink-0" />
            <div className="leading-tight hidden sm:block">
              <div className="font-black text-blue-700 dark:text-blue-400 text-base leading-none">Truyện Huba</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight italic">Ngày đọc 1 chap, đêm cuốn không ngủ</div>
            </div>
            <span className="sm:hidden font-black text-blue-700 dark:text-blue-400 text-sm leading-none">Huba</span>
          </Link>

          {/* Search */}
          <div ref={searchBoxRef} className="flex-1 min-w-0 max-w-2xl mx-auto relative">
            <form onSubmit={handleSearch}>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 sm:px-4 py-2 gap-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tìm kiếm truyện..."
                  className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400"
                  autoComplete="off"
                />
              </div>
            </form>
            {showResults && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {results.map(s => (
                  <Link key={s.id} to={`/truyen/${s.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <img src={s.cover_image} alt={s.title} className="w-9 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{s.title}</p>
                      <p className="text-xs text-gray-500">{s.author} · {s.total_chapters} chương</p>
                    </div>
                  </Link>
                ))}
                <button onClick={handleSearch}
                  className="w-full text-center text-sm text-blue-600 py-3 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Xem tất cả kết quả →
                </button>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button onClick={() => setDarkMode(p => !p)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode
                ? <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                : <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              }
            </button>
            {user ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{user.username[0].toUpperCase()}</div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400 max-w-[80px] truncate">{user.username}</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/dang-nhap" className="px-4 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
                  Đăng ký
                </Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(p => !p)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom blue nav bar (desktop) */}
      <div ref={navRef} className="bg-blue-600 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-0.5 py-1.5">

            {/* Trang chủ */}
            <Link to="/" className={navBtn(isActive('/'))}>Trang chủ</Link>

            {/* Thể loại dropdown */}
            <div className="relative">
              <button onClick={() => toggleDrop('theloai')}
                className={`flex items-center gap-1 ${navBtn(openDrop === 'theloai')}`}>
                Thể loại
                <svg className={`w-3 h-3 transition-transform ${openDrop === 'theloai' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDrop === 'theloai' && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 p-3 min-w-[320px]">
                  <div className="flex flex-wrap gap-2">
                    {THE_LOAI.map(g => (
                      <Link key={g.to} to={g.to}
                        className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 transition-colors font-medium">
                        {g.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Truyện mới */}
            <Link to="/tim-kiem?sort=new" className={navBtn(isActive('/tim-kiem', 'sort=new'))}>Truyện mới</Link>

            {/* Xem nhiều */}
            <Link to="/tim-kiem?sort=views" className={navBtn(isActive('/tim-kiem', 'sort=views'))}>Xem nhiều</Link>

            {/* Tình trạng dropdown */}
            <div className="relative">
              <button onClick={() => toggleDrop('tinhtrang')}
                className={`flex items-center gap-1 ${navBtn(openDrop === 'tinhtrang')}`}>
                Tình trạng
                <svg className={`w-3 h-3 transition-transform ${openDrop === 'tinhtrang' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openDrop === 'tinhtrang' && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 p-2 flex gap-2">
                  <Link to="/tim-kiem?status=complete"
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors whitespace-nowrap">
                    ✓ Hoàn thành
                  </Link>
                  <Link to="/tim-kiem?status=ongoing"
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap">
                    ↻ Đang ra
                  </Link>
                </div>
              )}
            </div>

            {/* Tủ truyện — chỉ khi đã đăng nhập */}
            {user && (
              <Link to="/tu-truyen" className={`flex items-center gap-1.5 ${navBtn(isActive('/tu-truyen'))}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                Tủ truyện
              </Link>
            )}

            <div className="flex-1" />

            {/* Menu dropdown */}
            <div className="relative">
              <button onClick={() => toggleDrop('menu')}
                className={`flex items-center gap-1.5 ${navBtn(openDrop === 'menu')}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                Menu
              </button>
              {openDrop === 'menu' && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 py-1 min-w-[170px]">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">{user.username}</div>
                      <button onClick={() => { logout(); setOpenDrop(null); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Thoát
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/dang-ky" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        Đăng ký
                      </Link>
                      <Link to="/dang-nhap" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                        Đăng nhập
                      </Link>
                    </>
                  )}
                  <hr className="my-1 border-gray-100 dark:border-gray-700" />
                  <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Thống kê</div>
                  <Link to="/tim-kiem?sort=views" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Xem nhiều
                  </Link>
                  <Link to="/tim-kiem?sort=new" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Mới cập nhật
                  </Link>
                  <Link to="/tim-kiem?sort=favorites" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    Đề cử
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-blue-600 border-t border-blue-500 max-h-[70vh] overflow-y-auto">
          <Link to="/" className="flex items-center gap-2 px-5 py-3.5 text-sm text-white font-semibold hover:bg-blue-700 border-b border-blue-500/40">
            <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Trang chủ
          </Link>

          {/* Thể loại - grid 2 cột */}
          <div>
            <button onClick={() => toggleDrop('mb-theloai')}
              className="flex items-center justify-between w-full px-5 py-3.5 text-sm text-white font-semibold hover:bg-blue-700 border-b border-blue-500/40">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                Thể loại
              </span>
              <svg className={`w-4 h-4 transition-transform ${openDrop === 'mb-theloai' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openDrop === 'mb-theloai' && (
              <div className="grid grid-cols-2 gap-1 p-3 bg-blue-700/50 border-b border-blue-500/40">
                {THE_LOAI.map(g => (
                  <Link key={g.to} to={g.to} className="px-3 py-2 text-sm text-white/90 hover:bg-blue-600 rounded-lg font-medium">{g.label}</Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/tim-kiem?sort=new" className="flex items-center gap-2 px-5 py-3.5 text-sm text-white font-semibold hover:bg-blue-700 border-b border-blue-500/40">
            <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Truyện mới
          </Link>
          <Link to="/tim-kiem?sort=views" className="flex items-center gap-2 px-5 py-3.5 text-sm text-white font-semibold hover:bg-blue-700 border-b border-blue-500/40">
            <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Xem nhiều
          </Link>
          <Link to="/tim-kiem?status=complete" className="flex items-center gap-2 px-5 py-3.5 text-sm text-white font-semibold hover:bg-blue-700 border-b border-blue-500/40">
            <span className="text-green-300">✓</span> Hoàn thành
          </Link>
          <Link to="/tim-kiem?status=ongoing" className="flex items-center gap-2 px-5 py-3.5 text-sm text-white font-semibold hover:bg-blue-700 border-b border-blue-500/40">
            <span className="text-blue-200">↻</span> Đang ra
          </Link>

          {user ? (
            <>
              <Link to="/tu-truyen" className="flex items-center gap-2 px-5 py-3.5 text-sm text-white font-semibold hover:bg-blue-700 border-b border-blue-500/40">
                <svg className="w-4 h-4 text-red-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                Tủ truyện
              </Link>
              <button onClick={logout} className="flex items-center gap-2 w-full text-left px-5 py-3.5 text-sm text-red-300 font-semibold hover:bg-blue-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Đăng xuất
              </button>
            </>
          ) : (
            <div className="flex gap-2 p-4">
              <Link to="/dang-nhap" className="flex-1 text-center py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/30 transition-colors">Đăng nhập</Link>
              <Link to="/dang-ky" className="flex-1 text-center py-2.5 bg-white hover:bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl transition-colors">Đăng ký</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
