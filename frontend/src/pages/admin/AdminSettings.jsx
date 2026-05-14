import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API = (path, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('no token'));
  return axios({ url: `/api/admin${path}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
};

const TABS = [
  { id: 'brand', label: 'Thương hiệu' },
  { id: 'background', label: 'Nền web' },
  { id: 'header', label: 'Header' },
  { id: 'footer', label: 'Footer' },
];

export default function AdminSettings() {
  const [tab, setTab] = useState('brand');
  const [form, setForm] = useState({
    site_name: '',
    logo_url: '',
    site_description: '',
    hero_bg_url: '',
    footer_copyright: '',
    social_facebook: '',
    social_youtube: '',
    social_telegram: '',
    social_email: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState('');
  const logoRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    API('/settings').then(r => setForm(prev => ({ ...prev, ...r.data }))).catch(() => {});
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const upload = async (file, key, inputRef) => {
    if (!file) return;
    setUploading(key);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await API('/upload', { method: 'POST', data: fd, headers: { 'Content-Type': 'multipart/form-data' } });
      set(key, r.data.url);
    } catch {
      alert('Upload ảnh thất bại. Kiểm tra lại Cloudinary credentials trong .env');
    }
    setUploading('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API('/settings', { method: 'PUT', data: form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { alert(e.response?.data?.error || 'Lỗi khi lưu'); }
    setSaving(false);
  };

  const InputField = ({ label, field, placeholder, hint }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input value={form[field] || ''} onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  const ImageUploadField = ({ label, field, fileRef, hint, aspect }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input ref={fileRef} type="file" accept="image/*"
        onChange={e => upload(e.target.files[0], field, fileRef)} className="hidden" />
      {form[field] ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-2">
          <img src={form[field]} alt={label}
            className={`w-full object-cover ${aspect || 'h-40'}`} />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
            <button onClick={() => fileRef.current?.click()} disabled={!!uploading}
              className="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded-lg shadow">
              {uploading === field ? 'Đang upload...' : 'Đổi ảnh'}
            </button>
            <button onClick={() => set(field, '')}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg shadow">
              Xoá
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => fileRef.current?.click()} disabled={!!uploading}
          className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl text-sm text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-60">
          {uploading === field ? (
            <><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><span>Đang upload...</span></>
          ) : (
            <><svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg><span>Nhấn để chọn ảnh</span><span className="text-xs opacity-60">PNG, JPG — tối đa 5 MB</span></>
          )}
        </button>
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cài đặt giao diện</h1>
          <p className="text-sm text-gray-500 mt-0.5">Logo, nền web, header, footer</p>
        </div>
        <button onClick={handleSave} disabled={saving || !!uploading}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
          {saved ? 'Đã lưu!' : saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">

        {/* ── Tab: Thương hiệu ── */}
        {tab === 'brand' && (<>
          <ImageUploadField label="Logo" field="logo_url" fileRef={logoRef} aspect="h-24 object-contain bg-gray-50"
            hint="Hiển thị trên navbar. Nên dùng ảnh vuông, nền trong suốt (PNG)." />
          <InputField label="Tên website" field="site_name" placeholder="Truyện Huba" />
        </>)}

        {/* ── Tab: Nền web ── */}
        {tab === 'background' && (<>
          <ImageUploadField label="Ảnh nền Hero (trang chủ)" field="hero_bg_url" fileRef={bgRef} aspect="h-48"
            hint="Ảnh nền của banner trang chủ. Tỷ lệ 16:9, tối thiểu 1280×720px." />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hoặc nhập URL ảnh nền</label>
            <input value={form.hero_bg_url || ''} onChange={e => set('hero_bg_url', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </>)}

        {/* ── Tab: Header ── */}
        {tab === 'header' && (<>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-1">Logo & Tên hiển thị</p>
            <p className="text-xs text-blue-600">Logo và tên web được thiết lập ở tab <strong>Thương hiệu</strong>. Navbar tự động hiển thị logo (nếu có) hoặc tên text.</p>
          </div>
          <InputField label="Tên hiển thị trên navbar" field="site_name" placeholder="Truyện Huba"
            hint="Hiển thị bên cạnh logo hoặc thay thế logo nếu chưa upload." />
        </>)}

        {/* ── Tab: Footer ── */}
        {tab === 'footer' && (<>
          <InputField label="Mô tả thương hiệu" field="site_description"
            placeholder="Nền tảng đọc truyện online..."
            hint="Hiển thị dưới logo trong footer." />
          <InputField label="Copyright" field="footer_copyright"
            placeholder="© 2025 Truyện Huba. All rights reserved." />
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Mạng xã hội</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Facebook URL</label>
                <input value={form.social_facebook || ''} onChange={e => set('social_facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">YouTube URL</label>
                <input value={form.social_youtube || ''} onChange={e => set('social_youtube', e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telegram (username hoặc link nhóm)</label>
                <input value={form.social_telegram || ''} onChange={e => set('social_telegram', e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email liên hệ</label>
                <input value={form.social_email || ''} onChange={e => set('social_email', e.target.value)}
                  placeholder="contact@truyenhuba.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}
