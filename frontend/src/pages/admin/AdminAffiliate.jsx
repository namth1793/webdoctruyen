import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API = (path, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('no token'));
  return axios({ url: `/api/admin${path}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
};

const empty = { name: '', url: '', image_url: '', description: '', trigger_after: 4, time_trigger: 5, active: true };

export default function AdminAffiliate() {
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = () => API('/affiliate').then(r => setLinks(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await API('/upload', { method: 'POST', data: fd, headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(p => ({ ...p, image_url: r.data.url }));
    } catch {
      alert('Upload ảnh thất bại. Kiểm tra lại Cloudinary credentials trong .env');
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) return alert('Vui lòng nhập tên và URL đích');
    setSaving(true);
    try {
      if (editing) await API(`/affiliate/${editing}`, { method: 'PUT', data: form });
      else await API('/affiliate', { method: 'POST', data: form });
      setForm(empty); setEditing(null); load();
    } catch (e) { alert(e.response?.data?.error || 'Lỗi'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xoá link này?')) return;
    await API(`/affiliate/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleActive = async (link) => {
    await API(`/affiliate/${link.id}`, { method: 'PUT', data: { ...link, active: link.active ? 0 : 1 } });
    load();
  };

  const startEdit = (l) => {
    setEditing(l.id);
    setForm({ ...l, active: !!l.active, image_url: l.image_url || '', time_trigger: l.time_trigger ?? 5 });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Affiliate Links</h1>
      <p className="text-sm text-gray-500 mb-5">
        Cấu hình cửa sổ affiliate. Chỉ 1 link <span className="text-green-600 font-medium">active</span> có hiệu lực.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Sửa link' : 'Thêm link mới'}</h2>
          <div className="space-y-4">

            {/* Tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị (nút CTA)</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Mua sắm tại Shopee" />
            </div>

            {/* URL đích */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL đích (link affiliate)</label>
              <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://shope.ee/..." />
            </div>

            {/* Ảnh banner – upload file */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh banner (upload lên Cloudinary)</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

              {form.image_url ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={form.image_url} alt="Banner preview" className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                    <button onClick={() => fileRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded-lg shadow">
                      Đổi ảnh
                    </button>
                    <button onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg shadow">
                      Xoá
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl text-sm text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-60">
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Đang upload...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Nhấn để chọn ảnh banner</span>
                      <span className="text-xs opacity-60">PNG, JPG — tối đa 5 MB</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (hiện trong popup)</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghé Shopee ủng hộ web đọc truyện nhé!" />
            </div>

            {/* Triggers */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hiện sau mỗi N chương</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={50} value={form.trigger_after}
                    onChange={e => setForm(p => ({ ...p, trigger_after: parseInt(e.target.value) || 4 }))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-500">chương</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hiện sau N phút đọc</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={60} value={form.time_trigger ?? 5}
                    onChange={e => setForm(p => ({ ...p, time_trigger: parseInt(e.target.value) || 0 }))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-500">phút (0 = tắt)</span>
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={!!form.active}
                onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="active" className="text-sm text-gray-700">Kích hoạt ngay</label>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={handleSave} disabled={saving || uploading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-60 transition-colors">
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm link'}
            </button>
            {editing && (
              <button onClick={() => { setForm(empty); setEditing(null); }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Huỷ
              </button>
            )}
          </div>
        </div>

        {/* ── List ── */}
        <div className="space-y-3">
          {links.map(l => (
            <div key={l.id} className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${l.active ? 'border-green-400' : 'border-gray-200'}`}>
              {l.image_url && (
                <img src={l.image_url} alt="banner" className="w-full h-24 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{l.name}</span>
                      {l.active
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                        : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Tắt</span>}
                    </div>
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate block">{l.url}</a>
                    {l.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{l.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Chương: mỗi {l.trigger_after}</span>
                      {(l.time_trigger > 0) && <span>Thời gian: {l.time_trigger} phút</span>}
                      <span>Clicks: {(l.clicks || 0).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => toggleActive(l)}
                      className={`px-2 py-1 text-xs rounded ${l.active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                      {l.active ? 'Tắt' : 'Bật'}
                    </button>
                    <button onClick={() => startEdit(l)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded">Sửa</button>
                    <button onClick={() => handleDelete(l.id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded">Xoá</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {links.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
              Chưa có link nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
