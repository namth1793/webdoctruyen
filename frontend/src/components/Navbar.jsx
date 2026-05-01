import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const inputRef = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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
    setMenuOpen(false);
    setShowResults(false);
    setQuery('');
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (!searchBoxRef.current?.contains(e.target)) setShowResults(false);
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

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/ngon-tinh', label: 'Ngôn tình' },
    { to: '/dam-my', label: 'Đam mỹ' },
    { to: '/tieu-thuyet', label: 'Tiểu thuyết' },
    { to: '/the-loai/khac', label: 'Thể loại khác' },
    { to: '/huong-dan', label: 'Hướng dẫn mở khoá truyện' },
    { to: '/lien-he', label: 'Liên hệ' },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar - ẩn khi scroll xuống */}
      <div className={`bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out ${scrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-blue-800 text-[8px] font-black rounded px-0.5 leading-4">1·2·3</div>
            </div>
            <div className="leading-tight">
              <div className="font-black text-blue-700 dark:text-blue-400 text-base leading-none">Kênh Truyện</div>
              <div className="font-black text-blue-700 dark:text-blue-400 text-base leading-none">123</div>
            </div>
          </Link>

          {/* Search bar - center */}
          <div ref={searchBoxRef} className="flex-1 max-w-2xl mx-auto relative">
            <form onSubmit={handleSearch}>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 gap-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tìm tên truyện, tên người đọc..."
                  className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400"
                  autoComplete="off"
                />
                <kbd className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 shrink-0">
                  Ctrl K
                </kbd>
              </div>
            </form>

            {/* Dropdown results */}
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
                  className="w-full text-center text-sm text-blue-600 py-2.5 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Xem tất cả kết quả →
                </button>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Dark mode toggle */}
            <button onClick={() => setDarkMode(p => !p)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? (
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenu(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate">{user.username}</span>
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-1">
                    <Link to="/tu-truyen" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      Tủ truyện
                    </Link>
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button onClick={() => { logout(); setUserMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/dang-nhap"
                  className="px-4 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/dang-ky"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(p => !p)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom nav bar - blue */}
      <div className="bg-blue-600 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 py-1.5">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-4 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors ${
                  location.pathname === l.to
                    ? 'bg-white text-blue-700 font-bold shadow-sm'
                    : 'text-white font-medium hover:bg-blue-700'
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-blue-600">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              className="block px-5 py-2.5 text-sm text-white hover:bg-blue-700 border-b border-blue-500/50">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
