import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-gray-900">Kênh Truyện 123</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Trang web đọc truyện online miễn phí. Cập nhật truyện mới nhất, nhanh nhất.
              Đọc truyện ngôn tình, đam mỹ, tiểu thuyết hay nhất Việt Nam.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.79a4.85 4.85 0 01-1.02-.1z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Thể loại</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/ngon-tinh" className="hover:text-blue-600 transition-colors">Ngôn tình</Link></li>
              <li><Link to="/dam-my" className="hover:text-blue-600 transition-colors">Đam mỹ</Link></li>
              <li><Link to="/tieu-thuyet" className="hover:text-blue-600 transition-colors">Tiểu thuyết</Link></li>
              <li><Link to="/the-loai/co-trang" className="hover:text-blue-600 transition-colors">Cổ trang</Link></li>
              <li><Link to="/the-loai/hien-dai" className="hover:text-blue-600 transition-colors">Hiện đại</Link></li>
              <li><Link to="/the-loai/huyen-huyen" className="hover:text-blue-600 transition-colors">Huyền huyễn</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                kenhtruyen123@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                @kenhtruyen123
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-400">Nội dung trên trang là bản dịch fan-made, không nhằm mục đích thương mại.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
          <span>© 2024 Kênh Truyện 123. All rights reserved.</span>
          <Link to="/admin/login" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
