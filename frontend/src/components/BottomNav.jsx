import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const active = (path) => location.pathname === path;

  return (
    <>
      {/* Backdrop */}
      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}

      {/* User popup */}
      {showMenu && user && (
        <div className="fixed bottom-[60px] right-2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 w-44">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.username}</span>
          </div>
          <hr className="border-gray-100 dark:border-gray-700 mb-2" />
          <Link to="/tu-truyen" onClick={() => setShowMenu(false)}
            className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl">
            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Tủ truyện
          </Link>
          <button onClick={() => { logout(); setShowMenu(false); }}
            className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-4 h-14">

          {/* Trang chủ */}
          <Link to="/" className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${active('/') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <svg className="w-6 h-6" fill={active('/') ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active('/') ? 0 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Trang chủ</span>
          </Link>

          {/* Tìm kiếm */}
          <Link to="/tim-kiem" className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${active('/tim-kiem') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active('/tim-kiem') ? 2.5 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Tìm kiếm</span>
          </Link>

          {/* Tủ truyện */}
          <Link to={user ? '/tu-truyen' : '/dang-nhap'}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${active('/tu-truyen') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <svg className="w-6 h-6" fill={active('/tu-truyen') ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Tủ truyện</span>
          </Link>

          {/* Tài khoản */}
          {user ? (
            <button onClick={() => setShowMenu(p => !p)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors w-full ${showMenu ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${showMenu ? 'bg-blue-700' : 'bg-blue-600'}`}>
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-[10px] font-medium leading-none max-w-[52px] truncate">{user.username}</span>
            </button>
          ) : (
            <Link to="/dang-nhap"
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${active('/dang-nhap') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] font-medium leading-none">Đăng nhập</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
