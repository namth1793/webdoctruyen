import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { site_name, logo_url, site_description, footer_copyright, social_facebook, social_youtube } = useSettings();
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={logo_url || '/assets/logo.png'} alt={site_name} className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">{site_name}</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              {site_description}
            </p>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Theo dõi</p>
            <div className="flex gap-3">
              <a href={social_facebook || '#'} aria-label="Facebook" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={social_youtube || '#'} aria-label="YouTube" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Thể loại */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Thể loại</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/dam-my" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Đam mỹ</Link></li>
              <li><Link to="/the-loai/bach-hop" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Bách hợp</Link></li>
              <li><Link to="/ngon-tinh" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Ngôn tình</Link></li>
              <li><Link to="/the-loai/hien-dai" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Hiện đại</Link></li>
              <li><Link to="/the-loai/co-trang" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cổ trang</Link></li>
              <li><Link to="/the-loai/mat-the" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Mạt thế</Link></li>
              <li><Link to="/the-loai/kinh-di" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kinh dị</Link></li>
              <li><Link to="/the-loai/tuong-lai" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tương lai</Link></li>
            </ul>
          </div>

          {/* Khám phá */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Khám phá</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/tim-kiem?sort=new" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Truyện mới</Link></li>
              <li><Link to="/tim-kiem?sort=views" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Xem nhiều</Link></li>
              <li><Link to="/tim-kiem?sort=favorites" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Đề cử</Link></li>
              <li><Link to="/tim-kiem?status=complete" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Hoàn thành</Link></li>
              <li><Link to="/tim-kiem?status=ongoing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Đang ra</Link></li>
              <li><Link to="/lien-he" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Liên hệ</Link></li>
            </ul>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-5">Nội dung trên trang là bản dịch fan-made, không nhằm mục đích thương mại.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-400 dark:text-gray-500">
          <span>{footer_copyright}</span>
          <Link to="/admin/login" className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
